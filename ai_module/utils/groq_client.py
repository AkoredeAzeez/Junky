"""
Groq API client configuration and management for JUNKY Healthcare DAO
"""
import os
import asyncio
from typing import Dict, Any, Optional, List
import json
import logging
from groq import Groq
from dataclasses import dataclass
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class GroqResponse:
    """Structured response from Groq API"""
    content: str
    model: str
    usage: Dict[str, int]
    response_time: float
    success: bool
    error: Optional[str] = None

class GroqClient:
    """
    Centralized Groq API client for all healthcare AI agents
    """
    
    def __init__(self, api_key: Optional[str] = None, model: str = "llama3-8b-8192"):
        """
        Initialize Groq client
        
        Args:
            api_key: Groq API key (defaults to environment variable)
            model: Model to use for completions
        """
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("Groq API key not found. Set GROQ_API_KEY environment variable or pass api_key parameter.")
        
        self.model = model
        self.client = Groq(api_key=self.api_key)
        self.request_count = 0
        self.rate_limit_delay = 1.0  # seconds between requests
        
        logger.info(f"Groq client initialized with model: {self.model}")
    
    async def complete(
        self, 
        messages: List[Dict[str, str]], 
        temperature: float = 0.1,
        max_tokens: int = 1000,
        stream: bool = False,
        **kwargs
    ) -> GroqResponse:
        """
        Make completion request to Groq API
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            temperature: Sampling temperature (0-2)
            max_tokens: Maximum tokens to generate
            stream: Whether to stream response
            **kwargs: Additional parameters for Groq API
            
        Returns:
            GroqResponse object with completion data
        """
        start_time = time.time()
        
        try:
            # Rate limiting
            if self.request_count > 0:
                await asyncio.sleep(self.rate_limit_delay)
            
            # Make API request
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=stream,
                **kwargs
            )
            
            self.request_count += 1
            response_time = time.time() - start_time
            
            # Extract response content
            content = response.choices[0].message.content
            
            # Extract usage information
            usage = {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            }
            
            logger.info(f"Groq API request completed in {response_time:.2f}s. Tokens used: {usage['total_tokens']}")
            
            return GroqResponse(
                content=content,
                model=self.model,
                usage=usage,
                response_time=response_time,
                success=True
            )
            
        except Exception as e:
            response_time = time.time() - start_time
            error_msg = f"Groq API error: {str(e)}"
            logger.error(error_msg)
            
            return GroqResponse(
                content="",
                model=self.model,
                usage={},
                response_time=response_time,
                success=False,
                error=error_msg
            )
    
    def complete_sync(
        self, 
        messages: List[Dict[str, str]], 
        temperature: float = 0.1,
        max_tokens: int = 1000,
        **kwargs
    ) -> GroqResponse:
        """
        Synchronous version of complete method
        """
        return asyncio.run(self.complete(messages, temperature, max_tokens, **kwargs))
    
    async def complete_with_retry(
        self,
        messages: List[Dict[str, str]],
        max_retries: int = 3,
        retry_delay: float = 2.0,
        **kwargs
    ) -> GroqResponse:
        """
        Complete request with automatic retry logic
        
        Args:
            messages: Message list for completion
            max_retries: Maximum number of retry attempts
            retry_delay: Delay between retry attempts
            **kwargs: Additional parameters for complete method
            
        Returns:
            GroqResponse object
        """
        last_response = None
        
        for attempt in range(max_retries + 1):
            response = await self.complete(messages, **kwargs)
            
            if response.success:
                if attempt > 0:
                    logger.info(f"Request succeeded on attempt {attempt + 1}")
                return response
            
            last_response = response
            
            if attempt < max_retries:
                logger.warning(f"Request failed on attempt {attempt + 1}, retrying in {retry_delay}s...")
                await asyncio.sleep(retry_delay)
                retry_delay *= 1.5  # Exponential backoff
        
        logger.error(f"Request failed after {max_retries + 1} attempts")
        return last_response
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get client usage statistics
        
        Returns:
            Dictionary with usage stats
        """
        return {
            "total_requests": self.request_count,
            "model": self.model,
            "rate_limit_delay": self.rate_limit_delay
        }
    
    def set_rate_limit(self, delay: float):
        """
        Update rate limiting delay
        
        Args:
            delay: Delay in seconds between requests
        """
        self.rate_limit_delay = delay
        logger.info(f"Rate limit delay updated to {delay}s")

# Global client instance
_groq_client = None

def get_groq_client(api_key: Optional[str] = None, model: str = "llama3-8b-8192") -> GroqClient:
    """
    Get singleton Groq client instance
    
    Args:
        api_key: Groq API key (only used on first call)
        model: Model to use (only used on first call)
        
    Returns:
        GroqClient instance
    """
    global _groq_client
    
    if _groq_client is None:
        _groq_client = GroqClient(api_key=api_key, model=model)
    
    return _groq_client

def reset_client():
    """Reset the global client instance (useful for testing)"""
    global _groq_client
    _groq_client = None