# AI Service

A FastAPI-based microservice for AI functionality.

## Setup

1. Install dependencies:
```bash
uv sync
```

2. Configure environment variables:
```bash
# Copy the example environment file
cp env.example .env

# Edit .env with your actual API keys
nano .env
```

3. Run the service:
```bash
uv run python main.py
```

Or with uvicorn directly:
```bash
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Configuration

The service uses environment variables for configuration. Copy `env.example` to `.env` and fill in your API keys:

### Required API Keys
- `OPENAI_API_KEY`: Your OpenAI API key
- `ANTHROPIC_API_KEY`: Your Anthropic API key  
- `HUGGINGFACE_API_KEY`: Your Hugging Face API key
- `COHERE_API_KEY`: Your Cohere API key

### Optional Configuration
- `APP_NAME`: Application name (default: "AI Service")
- `APP_VERSION`: Application version (default: "1.0.0")
- `DEBUG`: Enable debug mode (default: false)
- `HOST`: Server host (default: "0.0.0.0")
- `PORT`: Server port (default: 8000)
- `DEFAULT_MODEL`: Default AI model (default: "gpt-3.5-turbo")
- `MAX_TOKENS`: Maximum tokens for responses (default: 1000)
- `TEMPERATURE`: AI response temperature (default: 0.7)
- `SECRET_KEY`: Secret key for security (optional)

## API Endpoints

- `GET /health` - Health check
- `GET /config` - Get current configuration and available API providers
- `POST /ai/generate` - Generate AI response

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
