import requests

BASE_URL = "http://localhost:8000"
ENDPOINT = "/v1/chat/completions"
TIMEOUT = 10
HEADERS = {"Content-Type": "application/json"}
MODEL_NAME = "google/diffusiongemma-26b-a4b-it"

def test_post_chat_completions_streaming_invalid_request():
    invalid_payload = {
        # Intentionally malformed: missing 'messages' field (required)
        "model": MODEL_NAME,
        "max_tokens": 16,
        "temperature": 0.2,
        "top_p": 0.95,
        "stream": True,
        "enable_thinking": False
    }
    corrected_payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "user", "content": "Hello, how are you?"}
        ],
        "max_tokens": 16,
        "temperature": 0.2,
        "top_p": 0.95,
        "stream": True,
        "enable_thinking": False
    }

    # POST with invalid payload, expect 400
    try:
        resp = requests.post(
            BASE_URL + ENDPOINT,
            json=invalid_payload,
            headers=HEADERS,
            timeout=TIMEOUT,
            stream=True
        )
        assert resp.status_code == 400, f"Expected 400 but got {resp.status_code}"
        # Validate basic response shape: JSON with error keys or validation details
        try:
            json_resp = resp.json()
            assert isinstance(json_resp, dict)
        except Exception:
            assert False, "Response is not JSON for 400 validation error"
    except requests.RequestException as e:
        assert False, f"Request failed unexpectedly: {e}"

    # Resubmit corrected payload with stream=true, expect 200 streamed response
    try:
        resp = requests.post(
            BASE_URL + ENDPOINT,
            json=corrected_payload,
            headers=HEADERS,
            timeout=TIMEOUT,
            stream=True
        )
        assert resp.status_code == 200, f"Expected 200 but got {resp.status_code}"
        # Collect first 3 streamed chunks
        chunk_count = 0
        for chunk in resp.iter_lines():
            if chunk:
                chunk_count += 1
            if chunk_count >= 3:
                break
        assert chunk_count > 0, "No streamed chunks received"
    except requests.RequestException as e:
        assert False, f"Request failed unexpectedly: {e}"

test_post_chat_completions_streaming_invalid_request()