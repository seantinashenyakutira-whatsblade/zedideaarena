#!/bin/bash
# Start the DiffusionGemma local API server

export NVIDIA_API_KEY="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"

echo "Starting DiffusionGemma Local API Server..."
echo "API Endpoint: http://localhost:8000"
echo "OpenAI-compatible endpoint: http://localhost:8000/v1/chat/completions"
echo ""

python3 diffusiongemma_server.py
