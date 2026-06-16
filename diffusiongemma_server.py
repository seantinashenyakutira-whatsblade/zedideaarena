"""OpenAI-compatible FastAPI server for DiffusionGemma via NVIDIA NIM."""
import os
import json
from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any, AsyncGenerator, Union

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
import uvicorn

from diffusiongemma_client import DiffusionGemmaClient


@asynccontextmanager
async def lifespan(app: FastAPI):
    global client
    api_key = os.environ.get("NVIDIA_API_KEY")
    if not api_key:
        raise ValueError("NVIDIA_API_KEY environment variable not set")
    client = DiffusionGemmaClient(api_key=api_key)
    print(f"DiffusionGemma client initialized with model: {client.model}")
    yield


app = FastAPI(
    title="DiffusionGemma Local API",
    description="OpenAI-compatible API for Google's DiffusionGemma 26B A4B-IT via NVIDIA NIM",
    version="1.0.0",
    lifespan=lifespan,
)

# Global client instance
client: DiffusionGemmaClient = None


class ChatMessage(BaseModel):
    role: str
    content: Union[str, List[Dict[str, Any]], None] = None


class ChatCompletionRequest(BaseModel):
    model: str = "google/diffusiongemma-26b-a4b-it"
    messages: List[ChatMessage]
    max_tokens: int = 4096
    temperature: float = 1.0
    top_p: float = 0.95
    stream: bool = False
    enable_thinking: Optional[bool] = None
    chat_template_kwargs: Optional[Dict[str, Any]] = None


class ChatCompletionResponse(BaseModel):
    id: str
    object: str
    created: int
    model: str
    choices: List[Dict[str, Any]]
    usage: Dict[str, int]


@app.get("/")
async def root():
    return {"message": "DiffusionGemma Local API", "status": "running"}


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400,
        content={"detail": exc.errors(), "message": "Bad Request"},
    )


@app.get("/v1/models")
async def list_models():
    """List available models (OpenAI-compatible)."""
    return {
        "object": "list",
        "data": [
            {
                "id": "google/diffusiongemma-26b-a4b-it",
                "object": "model",
                "created": 1710000000,
                "owned_by": "google",
            }
        ],
    }


@app.post("/v1/chat/completions")
async def chat_completions(request: ChatCompletionRequest):
    """
    OpenAI-compatible chat completions endpoint.
    """
    global client
    if not client:
        raise HTTPException(status_code=500, detail="Client not initialized")

    messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
    thinking = request.enable_thinking
    if thinking is None and request.chat_template_kwargs:
        thinking = request.chat_template_kwargs.get("enable_thinking", True)
    elif thinking is None:
        thinking = True

    if request.stream:
        return StreamingResponse(
            _stream_response(messages, request, thinking),
            media_type="text/event-stream",
        )

    try:
        response = client.chat(
            messages=messages,
            model=request.model,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            top_p=request.top_p,
            stream=False,
            enable_thinking=thinking,
        )

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def _stream_response(messages: List[Dict], request: ChatCompletionRequest, thinking: bool) -> AsyncGenerator[str, None]:
    """Stream the response from the model."""
    global client
    
    try:
        response = client.chat(
            messages=messages,
            model=request.model,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            top_p=request.top_p,
            stream=True,
            enable_thinking=thinking,
        )

        for line in response.iter_lines():
            if line:
                decoded_line = line.decode("utf-8")
                if decoded_line.startswith("data: "):
                    data = decoded_line[6:]
                    if data == "[DONE]":
                        yield "data: [DONE]\n\n"
                        break
                    try:
                        chunk = json.loads(data)
                        delta = chunk.get("choices", [{}])[0].get("delta", {})
                        content = delta.get("content", "")
                        if content:
                            yield f"data: {json.dumps(chunk)}\n\n"
                    except json.JSONDecodeError:
                        continue
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"


@app.post("/v1/completions")
async def completions(request: Request):
    """Legacy completions endpoint (redirects to chat)."""
    raise HTTPException(status_code=400, detail="Use /v1/chat/completions instead")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
