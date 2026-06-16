import requests

def test_TC001_get_root_health_check():
    url = "http://localhost:8000/"
    headers = {
        "Content-Type": "application/json",
        "model": "google/diffusiongemma-26b-a4b-it",
        "max_tokens": "16",
        "temperature": "0.2",
        "top_p": "0.95",
        "enable_thinking": "false"
    }
    timeout = 10
    try:
        response = requests.get(url, headers=headers, timeout=timeout)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    try:
        json_data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(json_data, dict), "Response JSON is not an object"
    assert "status" in json_data, "'status' not in response JSON"
    assert "message" in json_data, "'message' not in response JSON"


test_TC001_get_root_health_check()