import requests

def test_post_chat_completions_valid_request():
    base_url = "http://localhost:8000"
    url = f"{base_url}/v1/chat/completions"
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
        "enable_thinking": False,
        "stream": False
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"
        json_response = response.json()

        # Basic JSON shape verification: check keys typically present in OpenAI chat completion response
        assert isinstance(json_response, dict), "Response is not a JSON object"
        assert "id" in json_response, "Response missing 'id'"
        assert "object" in json_response, "Response missing 'object'"
        assert "choices" in json_response, "Response missing 'choices'"
        assert isinstance(json_response["choices"], list), "'choices' is not a list"
        assert len(json_response["choices"]) > 0, "'choices' list is empty"
        choice = json_response["choices"][0]
        assert "message" in choice, "'message' not in first choice"
        assert "role" in choice["message"], "'role' missing in message"
        assert "content" in choice["message"], "'content' missing in message"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_chat_completions_valid_request()