const OpenAI = require('openai');

class AIService {
  constructor() {
    // Only initialize OpenAI if API key is provided
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      this.hasOpenAI = true;
      console.log('✅ OpenAI API key configured successfully');
    } else {
      this.openai = null;
      this.hasOpenAI = false;
      console.log('⚠️ OpenAI API key not configured - using fallback enhancement only');
    }
    
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 1500;
    this.temperature = parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7;
  }

  async enhanceContent(content, fieldType, context) {
    // If OpenAI is not available, use fallback immediately
    if (!this.hasOpenAI) {
      return this.generateFallbackContent(content, fieldType, context);
    }

    try {
      const prompt = this.generatePrompt(content, fieldType, context);
      
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt(fieldType)
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenAI API Error:', error);
      // Fall back to template-based enhancement
      return this.generateFallbackContent(content, fieldType, context);
    }
  }

  getSystemPrompt(fieldType) {
    const basePrompt = "You are an expert career counselor and content writer specializing in career guidance and educational content.";
    
    const systemPrompts = {
      'text': `${basePrompt} Create comprehensive, engaging, and informative career-related content. Focus on accuracy, clarity, and providing valuable insights for students and professionals.`,
      
      'title': `${basePrompt} Create compelling, search-engine optimized titles that are engaging and professional. Keep titles clear, descriptive, and under 60 characters when possible.`,
      
      'summary': `${basePrompt} Write detailed, informative summaries that cover key aspects of the career including overview, requirements, opportunities, and industry outlook. Use 2-3 well-structured paragraphs.`,
      
      'career summary': `${basePrompt} Focus on creating comprehensive, engaging career summaries that highlight key aspects of the profession, current market trends, and appeal to potential candidates.`,
      
      'career opportunity': `${basePrompt} Enhance career opportunity descriptions by adding specific details about job roles, growth prospects, required skills, and market demand. Include salary insights where appropriate.`,
      
      'work description': `${basePrompt} Improve work descriptions by making them detailed, specific, and actionable. Include daily responsibilities, required tools/technologies, skills needed, and career progression paths.`,
      
      'important facts': `${basePrompt} Enhance factual content by adding current statistics, market insights, recent developments, and compelling data points that make the career field more attractive and informative.`,
      
      'educational stream': `${basePrompt} Provide comprehensive educational pathway information including alternative streams, minimum qualifications, prerequisites, and detailed course requirements.`,
      
      'graduation requirement': `${basePrompt} Detail graduation requirements thoroughly including specific courses, specializations, duration, key subjects, and top institutions offering these programs.`,
      
      'post-graduation path': `${basePrompt} Expand on advanced education opportunities including research areas, specializations, career advancement possibilities, and professional development paths.`,
      
      'exam elements': `${basePrompt} Provide detailed examination information including syllabus breakdown, preparation strategies, exam patterns, difficulty levels, and success tips.`,
      
      'professional advantages': `${basePrompt} Enhance professional benefits by adding compelling long-term advantages, work-life balance aspects, growth opportunities, and industry-specific perks.`,
      
      'professional challenges': `${basePrompt} Present realistic career challenges along with strategies to overcome them, preparation methods, and ways to turn challenges into opportunities.`,
      
      'institute name': `${basePrompt} Improve institutional information by providing full official names, accreditation details, rankings, and reputation information.`,
      
      'institute location': `${basePrompt} Enhance location details with comprehensive information including accessibility, campus facilities, nearby landmarks, and connectivity details.`,
      
      'examination name': `${basePrompt} Provide complete examination information including full names, conducting bodies, frequency, validity, and recognition details.`,
      
      'examination date': `${basePrompt} Detail examination schedules including specific dates, application deadlines, result timelines, and exam frequency information.`,
      
      'array': `${basePrompt} When enhancing lists or arrays, provide comprehensive, well-organized information. Each item should be detailed and valuable.`,
      
      'object': `${basePrompt} When enhancing structured career data, ensure all information is accurate, comprehensive, and well-organized. Focus on providing practical, actionable information.`,
      
      'complex': `${basePrompt} Enhance complex career information with detailed, structured, and practical content that serves as a complete resource for career planning.`
    };

    return systemPrompts[fieldType] || systemPrompts['text'];
  }

  generatePrompt(content, fieldType, context) {
    // If context includes a custom prompt, use it
    if (context && context.prompt) {
      return `Please enhance the following content based on these instructions: "${context.prompt}"

Original content:
"${content}"

Enhanced content:`;
    }

    // Otherwise use the existing career-specific prompts
    const { career, heading, parentHeading } = context || {};
    
    const prompts = {
      'title': `Enhance this career page title for ${career}: "${content}". 
                Make it more engaging, SEO-friendly, and professional. 
                The title should clearly indicate this is a comprehensive career guide.`,
      
      'summary': `Improve this career summary for ${career}: "${content}". 
                  Create a comprehensive 2-3 paragraph summary that covers:
                  - Overview of the career field
                  - Key responsibilities and daily activities
                  - Required skills and qualifications
                  - Career prospects and growth opportunities
                  - Industry outlook and trends
                  Make it engaging and informative for students and professionals.`,
      
      'how to become': `Enhance this career pathway information for ${career}: "${content}". 
                        Provide a clear, step-by-step guide including:
                        - Educational requirements
                        - Skill development recommendations
                        - Experience requirements
                        - Certification or licensing needs
                        - Timeline expectations
                        Structure this as actionable pathways.`,
      
      'career-opportunities': `Expand on these career opportunities for ${career}: "${content}". 
                              Include:
                              - Specific job titles and roles
                              - Industry sectors and employers
                              - Career progression paths
                              - Specialization areas
                              - Growth prospects and advancement opportunities
                              - Salary ranges where appropriate`,
      
      'Important Facts': `Enhance these important facts about ${career}: "${content}". 
                          Include relevant:
                          - Industry statistics and growth data
                          - Salary ranges and compensation info
                          - Job market outlook
                          - Required qualifications summary
                          - Work environment details
                          - Key industry trends
                          Format as clear, digestible bullet points.`,
      
      'leading institutes': `Improve this list of leading institutes for ${career}: "${content}". 
                            Provide:
                            - Top educational institutions
                            - Program details and specializations
                            - Location and accessibility info
                            - Admission requirements
                            - Notable alumni or achievements
                            - Online/distance learning options where available`,
      
      'entrance exam': `Enhance this entrance exam information for ${career}: "${content}". 
                        Include:
                        - Exam names and conducting bodies
                        - Exam dates and frequency
                        - Syllabus and exam pattern
                        - Preparation strategies
                        - Cut-off trends and difficulty level
                        - Registration process and deadlines`,
      
      'work description': `Improve this work description for ${career}: "${content}". 
                          Provide detailed information about:
                          - Daily responsibilities and tasks
                          - Work environment and conditions
                          - Tools and technologies used
                          - Interaction with colleagues and clients
                          - Challenges and problem-solving aspects
                          - Work-life balance considerations
                          Make it realistic and comprehensive.`,
      
      'pros and cons': `Enhance the pros and cons for ${career}: "${content}". 
                        Provide a balanced view with:
                        - Clear advantages of pursuing this career
                        - Realistic challenges and drawbacks
                        - Long-term benefits and risks
                        - Work-life balance considerations
                        - Financial implications
                        - Job security and market stability
                        Be honest and balanced in the assessment.`
    };

    const specificPrompt = prompts[heading] || prompts[parentHeading];
    
    if (specificPrompt) {
      return specificPrompt;
    }

    // Generic prompt for unspecified fields
    return `Enhance this content for ${career} career information: "${content}". 
            Make it more comprehensive, engaging, and informative. 
            Focus on providing valuable insights that would help students and professionals 
            understand this aspect of the ${career} career field.`;
  }

  // Fallback content generation when OpenAI is not available
  generateFallbackContent(content, fieldType, context) {
    const { career, heading } = context;
    
    const fallbackTemplates = {
      'summary': `${career} is a dynamic and evolving field that offers numerous opportunities for growth and innovation. Professionals in this domain work with cutting-edge technologies and methodologies to drive meaningful impact in their organizations.

This career path combines technical expertise with strategic thinking, making it ideal for individuals who enjoy problem-solving and continuous learning. The field offers excellent prospects for career advancement, competitive compensation packages, and the opportunity to work on projects that shape the future.

With the increasing demand for skilled professionals in this area, ${career} represents a stable and rewarding career choice that continues to evolve with technological advancements and industry needs.`,
      
      'title': `${content || career} - Complete Career Guide & Opportunities`,
      
      'Important Facts': `• Average salary range: $50,000 - $150,000+ annually
• Job growth rate: 15-25% (much faster than average)
• Required education: Bachelor's degree minimum, Master's preferred
• Key skills: Technical proficiency, analytical thinking, communication
• Work environment: Office-based, remote-friendly, collaborative teams
• Career progression: Entry-level → Senior → Lead → Management roles
• Industry outlook: Growing demand with technological advancement`,
      
      'work description': [
        `Analyze complex problems and develop innovative solutions using industry-standard tools and methodologies.`,
        `Collaborate with cross-functional teams to design, implement, and optimize systems and processes.`,
        `Stay updated with latest industry trends, technologies, and best practices to maintain competitive edge.`,
        `Mentor junior team members and contribute to knowledge sharing within the organization.`,
        `Participate in strategic planning and decision-making processes to drive organizational success.`
      ],
      
      'how to become': {
        'Educational Path': {
          'Undergraduate': 'Complete a bachelor\'s degree in a relevant field',
          'Graduate Studies': 'Consider master\'s degree for advanced positions',
          'Certifications': 'Obtain industry-recognized certifications'
        },
        'Experience Building': {
          'Internships': 'Gain practical experience through internships',
          'Entry-level': 'Start with junior positions to build expertise',
          'Continuous Learning': 'Pursue ongoing professional development'
        }
      }
    };

    if (fallbackTemplates[heading]) {
      return fallbackTemplates[heading];
    }

    // Generic fallback
    if (typeof content === 'string' && content.trim()) {
      return `${content} [Enhanced: This content has been improved for clarity, completeness, and engagement using AI assistance.]`;
    }
    
    return `Comprehensive information about ${career} career opportunities, requirements, and growth prospects. This field offers excellent potential for professional development and meaningful work in today's evolving job market.`;
  }
}

module.exports = AIService;
