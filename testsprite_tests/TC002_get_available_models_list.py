import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 10
MODEL_NAME = "google/diffusiongemma-26b-a4b-it"

def test_get_available_models_list():
    url = f"{BASE_URL}/v1/models"
    headers = {
        "Content-Type": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    try:
        json_data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Check that response JSON has keys 'object' and 'data'
    # According to PRD, response_schema is 200: "object, data"
    assert isinstance(json_data, dict), "Response JSON is not an object"
    assert "object" in json_data, "Response JSON missing 'object' key"
    assert "data" in json_data, "Response JSON missing 'data' key"
    assert isinstance(json_data["data"], list), "'data' key is not a list"

test_get_available_models_list()