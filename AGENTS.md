# DiffusionGemma Integration for OpenCode

## Configuration

Add this configuration to your `opencode.json` file to use the DiffusionGemma model with OpenCode:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "openai/google/diffusiongemma-26b-a4b-it",
  "small_model": "openai/google/diffusiongemma-26b-a4b-it",

  "provider": {
    "openai": {
      "options": {
        "apiKey": "not-needed",
        "baseURL": "http://localhost:8000/v1"
      }
    }
  }
}
```

## How It Works

1. The OpenCode configuration points to the local FastAPI server
2. All API requests are routed through the server to NVIDIA's API
3. The server provides an OpenAI-compatible interface
4. You can use the model for coding tasks locally

## Usage Examples

Once configured, you can ask OpenCode to:

```
help me write a Python function to sort a list of dictionaries
can you refactor this code to use more efficient algorithms
summarize this documentation and extract the key points
```

## Server Setup

Make sure to start the server before using OpenCode:

```bash
# Start the DiffusionGemma API server
cd /path/to/project
./start_server.sh
```

The server will run on `http://localhost:8000`.

## Files

- `diffusiongemma_client.py` - Python client for direct API calls
- `diffusiongemma_server.py` - FastAPI server (OpenAI-compatible)
- `start_server.sh` - Easy startup script
- `test_api.py` - Test API connection

## Troubleshooting

### Server Not Starting

```bash
# Check if port 8000 is in use
lsof -i :8000

# Kill the process using port 8000
kill -9 $(lsof -t -i:8000)
```

### OpenCode Not Connecting

```bash
# Check server status
curl http://localhost:8000

# Check models endpoint
curl http://localhost:8000/v1/models
```

### API Key Issues

Make sure your NVIDIA API key is set:

```bash
export NVIDIA_API_KEY="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"
```

## Integration Notes

- The model uses Google's DiffusionGemma 26B A4B-IT architecture
- It supports parallel token generation for real-time applications
- Enable thinking mode for complex reasoning tasks
- The model is optimized for text applications

## Testing

You can test the integration before using it with OpenCode:

```bash
python3 test_api.py
```

This will verify that the API connection works correctly.
