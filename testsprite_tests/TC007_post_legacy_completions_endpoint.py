import requests

def test_post_legacy_completions_endpoint():
    base_url = "http://localhost:8000"
    url = f"{base_url}/v1/completions"
    headers = {"Content-Type": "application/json"}
    payload = {
        "model": "google/diffusiongemma-26b-a4b-it",
        "prompt": "Test prompt",
        "max_tokens": 16,
        "temperature": 0.2,
        "top_p": 0.95,
        "enable_thinking": False
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 400

    try:
        json_data = response.json()
        assert isinstance(json_data, dict)
    except ValueError:
        assert False, "Response is not valid JSON"

test_post_legacy_completions_endpoint()