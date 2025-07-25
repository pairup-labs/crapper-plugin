const express = require('express');
const AIService = require('../services/aiService');

const router = express.Router();
const aiService = new AIService();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'AI Content Enhancement',
    timestamp: new Date().toISOString()
  });
});

// Main content enhancement endpoint (frontend calls /api/ai/enhance)
router.post('/enhance', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { content, prompt, context } = req.body;

    // Validation
    if (!content || !prompt) {
      return res.status(400).json({ 
        error: 'Invalid request: both content and prompt are required' 
      });
    }

    console.log(`[${new Date().toISOString()}] Enhancement request:`, {
      contentLength: content.length,
      promptLength: prompt.length,
      context: context || 'No context provided'
    });

    let enhancedContent;
    let isAIGenerated = false;

    // Try OpenAI enhancement first
    try {
      // Determine field type from context for better AI prompting
      const fieldType = context?.contentType || 'text';
      
      enhancedContent = await aiService.enhanceContent(content, fieldType, {
        prompt,
        ...context
      });
      isAIGenerated = aiService.hasOpenAI;
      
      if (aiService.hasOpenAI) {
        console.log(`[${new Date().toISOString()}] OpenAI enhancement completed in ${Date.now() - startTime}ms`);
      } else {
        console.log(`[${new Date().toISOString()}] Using fallback enhancement (OpenAI not configured)`);
      }
    } catch (aiError) {
      console.warn(`[${new Date().toISOString()}] AI enhancement failed, using fallback:`, aiError.message);
      enhancedContent = `${content}\n\n[Enhanced with user instructions: ${prompt}]`;
      isAIGenerated = false;
    }

    const response = {
      success: true,
      enhancedContent,
      isAIGenerated,
      source: isAIGenerated ? 'OpenAI' : 'Fallback',
      originalContent: content,
      prompt,
      context,
      processingTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };

    // Add note if fallback was used
    if (!isAIGenerated) {
      response.note = 'Enhanced using fallback method (OpenAI API not available)';
    }

    res.json(response);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Enhancement error:`, error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to enhance content',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
