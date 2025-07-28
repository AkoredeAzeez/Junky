"""
AI Module Tests
===============

Test suites for AI module components:
- test_groq_client: Tests for Groq API client
- test_agents: Tests for individual agents (Phase 2)
- test_integration: Integration tests (Phase 3)
"""

# Test configuration
import pytest

def pytest_configure(config):
    """Configure pytest for AI module tests."""
    config.addinivalue_line(
        "markers", "integration: mark test as integration test"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )
    config.addinivalue_line(
        "markers", "api: mark test as requiring API access"
    )

# Test utilities
def create_mock_response(score, confidence, reasoning):
    """Helper to create mock agent responses."""
    return {
        "score": score,
        "confidence": confidence,
        "reasoning": reasoning,
        "timestamp": "2025-05-26T10:30:00Z"
    }

def create_mock_groq_response(content):
    """Helper to create mock Groq API responses."""
    return {
        "choices": [
            {
                "message": {
                    "content": content
                }
            }
        ],
        "usage": {
            "prompt_tokens": 100,
            "completion_tokens": 50,
            "total_tokens": 150
        }
    }

__all__ = [
    'create_mock_response',
    'create_mock_groq_response'
]