"""
AI Module Configuration
=======================

Configuration management for AI agents and utilities:
- agent_config: Main configuration class for all agents
- API keys, model parameters, and agent settings
"""

try:
    from .agent_config import AgentConfig
    
    __all__ = ['AgentConfig']
except ImportError:
    # Module not created yet
    __all__ = []