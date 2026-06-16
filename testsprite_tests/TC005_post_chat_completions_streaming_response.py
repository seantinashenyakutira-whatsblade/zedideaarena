import requests
import json

def test_post_chat_completions_streaming_response():
    base_url = "http://localhost:8000"
    endpoint = "/v1/chat/completions"
    url = base_url + endpoint
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "model": "google/diffusiongemma-26b-a4b-it",
        "messages": [
            {"role": "user", "content": "Hello, how are you?"}
        ],
        "max_tokens": 16,
        "temperature": 0.2,
        "top_p": 0.95,
        "stream": True,
        "enable_thinking": False
    }
    try:
        with requests.post(url, headers=headers, json=payload, stream=True, timeout=10) as response:
            assert response.status_code == 200, f"Expected status 200 but got {response.status_code}"
            chunk_count = 0
            for line in response.iter_lines(decode_unicode=True):
                if line:
                    if line.startswith('data: '):
                        line = line[len('data: '):]
                    if line == '[DONE]':
                        break
                    chunk = json.loads(line)
                    assert "choices" in chunk and isinstance(chunk["choices"], list), "Chunk missing choices list"
                    chunk_count += 1
                    if chunk_count == 10:  # increased upper limit to avoid premature break
                        break
            assert chunk_count >= 1, f"Expected at least 1 streamed chunk but got {chunk_count}"
    except requests.RequestException as e:
        assert False, f"HTTP request failed: {e}"

test_post_chat_completions_streaming_response()
