"""DiffusionGemma 26B A4B-IT client for NVIDIA NIM API."""
import os
import requests
import json
from typing import Optional, Dict, Any, List, Iterator
from dataclasses import dataclass


@dataclass
class ChatMessage:
    """Represents a chat message."""
    role: str
    content: str


class DiffusionGemmaClient:
    """Client for interacting with Google's DiffusionGemma 26B A4B-IT model via NVIDIA API."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: str = "https://integrate.api.nvidia.com/v1",
        model: str = "google/diffusiongemma-26b-a4b-it",
        timeout: int = 120,
    ):
        """
        Initialize the DiffusionGemma client.

        Args:
            api_key: NVIDIA API key. If not provided, uses NVIDIA_API_KEY env var.
            base_url: Base URL for the NVIDIA API.
            model: Model identifier.
            timeout: Request timeout in seconds.
        """
        self.api_key = api_key or os.environ.get("NVIDIA_API_KEY")
        if not self.api_key:
            raise ValueError(
                "API key required. Provide it as argument or set NVIDIA_API_KEY env var."
            )

        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout = timeout
        self.chat_completions_url = f"{self.base_url}/chat/completions"

    @staticmethod
    def normalize_model(model: str) -> str:
        aliases = {
            "diffusiongemma-26b-a4b-it",
            "DiffusionGemma-26B-A4B-IT",
            "google/diffusiongemma-26b-a4b-it",
        }
        return "google/diffusiongemma-26b-a4b-it" if model in aliases else model

    def chat(
        self,
        messages: List[Dict[str, str]],
        max_tokens: int = 4096,
        temperature: float = 1.0,
        top_p: float = 0.95,
        stream: bool = False,
        enable_thinking: bool = True,
        model: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Send a chat completion request.

        Args:
            messages: List of messages with 'role' and 'content' keys.
            max_tokens: Maximum number of tokens to generate.
            temperature: Sampling temperature.
            top_p: Nucleus sampling parameter.
            stream: Whether to stream the response.
            enable_thinking: Enable thinking mode for reasoning.
            **kwargs: Additional parameters to pass to the API.

        Returns:
            API response as a dictionary.
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "text/event-stream" if stream else "application/json",
        }

        payload = {
            "model": self.normalize_model(model or self.model),
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "top_p": top_p,
            "stream": stream,
            "chat_template_kwargs": {"enable_thinking": enable_thinking},
        }
        payload.update(kwargs)

        response = requests.post(
            self.chat_completions_url,
            headers=headers,
            json=payload,
            stream=stream,
            timeout=self.timeout,
        )
        response.raise_for_status()

        if stream:
            return response
        return response.json()

    def chat_stream(
        self,
        messages: List[Dict[str, str]],
        max_tokens: int = 4096,
        temperature: float = 1.0,
        top_p: float = 0.95,
        enable_thinking: bool = True,
        model: Optional[str] = None,
        **kwargs
    ) -> Iterator[str]:
        """
        Stream chat completion response.

        Args:
            messages: List of messages with 'role' and 'content' keys.
            max_tokens: Maximum number of tokens to generate.
            temperature: Sampling temperature.
            top_p: Nucleus sampling parameter.
            enable_thinking: Enable thinking mode for reasoning.
            **kwargs: Additional parameters to pass to the API.

        Yields:
            Chunks of the generated text.
        """
        response = self.chat(
            messages=messages,
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=top_p,
            stream=True,
            enable_thinking=enable_thinking,
            **kwargs
        )

        for line in response.iter_lines():
            if line:
                decoded_line = line.decode("utf-8")
                if decoded_line.startswith("data: "):
                    data = decoded_line[6:]
                    if data == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data)
                        delta = chunk.get("choices", [{}])[0].get("delta", {})
                        content = delta.get("content", "")
                        if content:
                            yield content
                    except json.JSONDecodeError:
                        continue

    def simple_chat(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """
        Simple chat with a single prompt.

        Args:
            prompt: The user prompt.
            system_prompt: Optional system prompt.

        Returns:
            The model's response text.
        """
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = self.chat(messages=messages)
        return response["choices"][0]["message"]["content"]


if __name__ == "__main__":
    # Example usage
    client = DiffusionGemmaClient()
    
    # Simple chat
    response = client.simple_chat("Hello, how are you?")
    print("Response:", response)
    
    # Streaming chat
    print("\nStreaming response:")
    for chunk in client.chat_stream([{"role": "user", "content": "Count from 1 to 5"}]):
        print(chunk, end="", flush=True)
    print()
