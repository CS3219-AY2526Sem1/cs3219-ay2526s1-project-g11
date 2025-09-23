from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
from google import genai

app = FastAPI(title="AI Service", version="1.0.0")
load_dotenv()


def get_gemini_client():
    return genai.Client()


class HealthResponse(BaseModel):
    status: str
    message: str


class AIRequest(BaseModel):
    prompt: str
    context: Optional[str] = None


class AIResponse(BaseModel):
    response: str
    confidence: Optional[float] = None


@app.get("/")
async def root():
    return {"message": "AI Service is up. See /health"}


@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="healthy", message="AI Service is running")


@app.post("/ai/generate", response_model=AIResponse)
async def generate_response(request: AIRequest):
    prompt = request.prompt if request.context is None else f"{request.prompt}{request.context}"
    client = get_gemini_client()
    response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
    return AIResponse(response=response.text, confidence=0.85)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
