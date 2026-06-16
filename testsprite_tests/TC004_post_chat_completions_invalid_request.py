import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 10
HEADERS = {"Content-Type": "application/json"}
MODEL_NAME = "google/diffusiongemma-26b-a4b-it"


def test_post_chat_completions_invalid_request():
    url = f"{BASE_URL}/v1/chat/completions"

    # Malformed request (missing required 'model' and 'messages')
    malformed_payload = {
        "max_tokens": 16,
        "temperature": 0.2,
        "top_p": 0.95,
        "enable_thinking": False
    }

    try:
        response = requests.post(url, json=malformed_payload, headers=HEADERS, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed unexpectedly: {e}"
    else:
        assert response.status_code == 400, f"Expected 400 for malformed request, got {response.status_code}"
        try:
            json_resp = response.json()
            assert isinstance(json_resp, dict)
        except Exception:
            assert False, "Response body is not valid JSON for 400 response"

    # Corrected valid request
    valid_payload = {
        "model": MODEL_NAME,
        "messages": [{"role": "user", "content": "Hello"}],
        "max_tokens": 16,
        "temperature": 0.2,
        "top_p": 0.95,
        "enable_thinking": False
    }

    try:
        response = requests.post(url, json=valid_payload, headers=HEADERS, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed unexpectedly: {e}"
    else:
        assert response.status_code == 200, f"Expected 200 for corrected request, got {response.status_code}"
        try:
            json_resp = response.json()
            # Basic JSON shape checks for OpenAI chat completion response
            assert isinstance(json_resp, dict)
            assert "choices" in json_resp and isinstance(json_resp["choices"], list)
            assert "model" in json_resp and isinstance(json_resp["model"], str)
        except Exception:
            assert False, "Response JSON shape is invalid for 200 response"


test_post_chat_completions_invalid_request()