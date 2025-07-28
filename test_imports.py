# test_imports.py
import sys
import os

# Add project root to path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

try:
    from ai_module.utils.groq_client import GroqClient
    print("✓ GroqClient imported successfully")
except ImportError as e:
    print(f"✗ Failed to import GroqClient: {e}")

try:
    from ai_module.config.agent_config import AgentConfiguration
    print("✓ AgentConfig imported successfully")
except ImportError as e:
    print(f"✗ Failed to import AgentConfig: {e}")

try:
    from ai_module.utils.response_parser import ResponseParser
    print("✓ ResponseParser imported successfully")
except ImportError as e:
    print(f"✗ Failed to import ResponseParser: {e}")

try:
    from ai_module.utils.validation import AgentValidator
    print("✓ ValidationError imported successfully")
except ImportError as e:
    print(f"✗ Failed to import ValidationError: {e}")

print("\nIf all imports are successful, you can run the tests!")