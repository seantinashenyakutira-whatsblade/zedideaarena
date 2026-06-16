# DiffusionGemma 26B A4B-IT Integration for OpenCode

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Environment Variable

```bash
export NVIDIA_API_KEY="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"
```

Or add it to your `~/.bashrc` or `~/.zshrc`.

### 3. Start the Local API Server

```bash
python diffusiongemma_server.py
```

The server will start on `http://0.0.0.0:8000`.

### 4. Configure OpenCode

Add this to your OpenCode configuration to use the local API:

```json
{
  "models": [
    {
      "name": "diffusiongemma",
      "provider": "openai",
      "base_url": "http://localhost:8000/v1",
      "model": "google/diffusiongemma-26b-a4b-it",
      "api_key": "not-needed"
    }
  ]
}
```

## Usage from Python

```python
from diffusiongemma_client import DiffusionGemmaClient

client = DiffusionGemmaClient()

# Simple chat
response = client.simple_chat("Hello, how are you?")
print(response)

# Streaming
for chunk in client.chat_stream([{"role": "user", "content": "Count from 1 to 5"}]):
    print(chunk, end="", flush=True)
```

## API Endpoints

- `GET /` - Health check
- `GET /v1/models` - List models
- `POST /v1/chat/completions` - Chat completions (OpenAI-compatible)

## Model Information

- **Model**: google/diffusiongemma-26b-a4b-it
- **Provider**: Google
- **Platform**: NVIDIA NIM (NVIDIA Inference Microservice)
- **Type**: Diffusion-based 26B parameter LLM
- **Features**: Parallel token generation, real-time text applications
- **Max Tokens**: 4096

## Files

- `diffusiongemma_client.py` - Python client library
- `diffusiongemma_server.py` - FastAPI server (OpenAI-compatible)
- `requirements.txt` - Python dependencies
- `test_api.py` - Quick test script

## Notes

- The model requires an NVIDIA API key
- The local server acts as a proxy to NVIDIA's API
- All OpenAI-compatible clients can connect to the local server
