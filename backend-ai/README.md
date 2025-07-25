# AI Backend Server

A dedicated backend server for AI-powered content enhancement in the career content management system.

## Features

- 🤖 **AI Content Enhancement**: OpenAI-powered content improvement
- 🔄 **Fallback System**: Smart fallback when AI service is unavailable
- 🛡️ **Security**: Rate limiting, CORS, and security headers
- 📊 **Health Monitoring**: Health check endpoints
- 🚀 **Performance**: Optimized for fast response times
- 📝 **Comprehensive Logging**: Detailed request and error logging

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and configuration information.

### Content Enhancement
```
POST /api/enhance-content
```
Enhance individual content fields with AI.

**Request Body:**
```json
{
  "content": "Content to enhance",
  "fieldType": "text|title|summary|array|object|complex",
  "context": {
    "career": "Career name",
    "heading": "Field heading",
    "parentHeading": "Parent section"
  }
}
```

### Bulk Enhancement
```
POST /api/enhance-bulk
```
Enhance multiple content fields in a single request.

**Request Body:**
```json
{
  "requests": [
    {
      "content": "Content 1",
      "fieldType": "text",
      "context": { ... }
    },
    {
      "content": "Content 2", 
      "fieldType": "summary",
      "context": { ... }
    }
  ]
}
```

### Enhancement Types
```
GET /api/enhancement-types
```
Get available field types and headings for enhancement.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

3. **Start Server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Configuration

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend application URL for CORS
- `OPENAI_MODEL`: OpenAI model to use (default: gpt-3.5-turbo)
- `OPENAI_MAX_TOKENS`: Maximum tokens per request (default: 1500)
- `OPENAI_TEMPERATURE`: AI creativity level (default: 0.7)

### Rate Limiting

- General API: 100 requests per 15 minutes
- AI Enhancement: 50 requests per 15 minutes  
- Bulk Operations: 10 requests per 15 minutes

## AI Enhancement Types

### Field Types
- **text**: General text content
- **title**: Page titles and headings
- **summary**: Career summaries and overviews
- **array**: Lists and arrays of information
- **object**: Structured data objects
- **complex**: Complex nested structures

### Career Headings
- title
- summary
- how to become
- career-opportunities
- Important Facts
- leading institutes
- entrance exam
- work description
- pros and cons

## Error Handling

The server includes comprehensive error handling for:
- Rate limiting violations
- CORS errors
- OpenAI API failures
- Validation errors
- Network timeouts

When OpenAI is unavailable, the system automatically falls back to intelligent template-based enhancement.

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin request protection
- **Rate Limiting**: Prevents abuse
- **Input Validation**: Request validation
- **Error Sanitization**: Safe error responses

## Monitoring

Health check endpoint provides:
- Server status
- Uptime information
- Environment details
- OpenAI configuration status

## Integration

This server is designed to work with the career content management frontend. Update your frontend's AI service calls to point to:

```javascript
const API_BASE_URL = 'http://localhost:3001/api';
```

## Development

```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Run in production mode
npm start
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production OpenAI API key
3. Set appropriate CORS origins
4. Configure reverse proxy (nginx/Apache)
5. Set up process manager (PM2)
6. Configure monitoring and logging

## License

MIT License
