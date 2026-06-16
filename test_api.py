"""Quick test script to verify DiffusionGemma API connection."""
import os
import sys

# Set the API key
os.environ["NVIDIA_API_KEY"] = "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"

from diffusiongemma_client import DiffusionGemmaClient


def test_simple_chat():
    print("Testing simple chat...")
    client = DiffusionGemmaClient()
    
    try:
        response = client.simple_chat("What is the capital of France?")
        print("Response:")
        print(response)
        return True
    except Exception as e:
        print(f"Simple chat failed: {e}")
        return False


def test_streaming_chat():
    print("\nTesting streaming chat...")
    client = DiffusionGemmaClient()
    
    try:
        print("Streaming Response:")
        for chunk in client.chat_stream([{"role": "user", "content": "Count from 1 to 5"}]):
            print(chunk, end="", flush=True)
        print()
        return True
    except Exception as e:
        print(f"Streaming chat failed: {e}")
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("DiffusionGemma 26B A4B-IT API Test")
    print("=" * 60)
    
    results = []
    results.append(("Simple Chat", test_simple_chat()))
    results.append(("Streaming Chat", test_streaming_chat()))
    
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    for name, result in results:
        status = "PASSED" if result else "FAILED"
        print(f"{name}: {status}")
    
    if all(r for _, r in results):
        print("\nAll tests passed!")
        sys.exit(0)
    else:
        print("\nSome tests failed.")
        sys.exit(1)
