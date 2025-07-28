"""
AI Module for Healthcare Donation System
========================================

This module contains AI agents and utilities for:
- Medical severity assessment
- Financial need evaluation  
- Hospital resource matching
- Agent coordination and management

Main Components:
- agents/: Individual AI agents for different assessment types
- utils/: Utility functions for Groq API, parsing, validation
- config/: Configuration management for agents
- prompts/: Structured prompts for different agent types
- tests/: Test suites for all components
"""

__version__ = "0.1.0"
__author__ = "Healthcare Donation System Team"

# Import key classes for easy access
try:
    from .utils.groq_client import GroqClient
    from .config.agent_config import AgentConfig
    from .utils.response_parser import ResponseParser
    from .utils.validation import ValidationError
    
    __all__ = [
        'GroqClient',
        'AgentConfig', 
        'ResponseParser',
        'ValidationError'
    ]
except ImportError:
    # If modules aren't created yet, that's okay
    __all__ = []