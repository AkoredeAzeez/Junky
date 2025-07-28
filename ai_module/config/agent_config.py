"""
Configuration settings for all AI agents in JUNKY Healthcare DAO
"""
import os
from typing import Dict, Any, List
from dataclasses import dataclass, field
from enum import Enum

class AgentType(Enum):
    """Types of AI agents in the system"""
    SEVERITY = "severity"
    FINANCIAL = "financial" 
    RESOURCE = "resource"
    COORDINATOR = "coordinator"

class SeverityLevel(Enum):
    """Medical severity levels"""
    CRITICAL = "critical"      # 9-10 score
    HIGH = "high"             # 7-8 score
    MODERATE = "moderate"     # 5-6 score
    LOW = "low"               # 3-4 score
    MINIMAL = "minimal"       # 1-2 score

@dataclass
class ModelConfig:
    """Configuration for Groq model parameters"""
    model_name: str = "llama3-8b-8192"
    temperature: float = 0.1
    max_tokens: int = 1000
    top_p: float = 0.9
    frequency_penalty: float = 0.0
    presence_penalty: float = 0.0

@dataclass 
class SeverityAgentConfig:
    """Configuration for medical severity assessment agent"""
    model_config: ModelConfig = field(default_factory=ModelConfig)
    
    # Scoring weights (must sum to 1.0)
    diagnosis_weight: float = 0.4      # Weight for primary diagnosis
    symptoms_weight: float = 0.3       # Weight for symptom severity
    urgency_weight: float = 0.2        # Weight for time sensitivity
    complications_weight: float = 0.1   # Weight for potential complications
    
    # Severity thresholds
    critical_threshold: float = 9.0
    high_threshold: float = 7.0
    moderate_threshold: float = 5.0
    low_threshold: float = 3.0
    
    # Medical categories to prioritize
    priority_conditions: List[str] = field(default_factory=lambda: [
        "cardiac arrest", "stroke", "sepsis", "trauma", "respiratory failure",
        "diabetic emergency", "seizure", "overdose", "burns", "cancer emergency"
    ])
    
    # Age-based severity modifiers
    pediatric_modifier: float = 1.1    # Children get slight priority boost
    elderly_modifier: float = 1.1      # Elderly get slight priority boost
    adult_modifier: float = 1.0        # Standard adult baseline

@dataclass
class FinancialAgentConfig:
    """Configuration for financial need assessment agent"""
    model_config: ModelConfig = field(default_factory=ModelConfig)
    
    # Scoring weights (must sum to 1.0)
    income_weight: float = 0.3         # Weight for household income
    debt_weight: float = 0.2           # Weight for existing medical debt
    insurance_weight: float = 0.25     # Weight for insurance coverage
    dependents_weight: float = 0.15    # Weight for number of dependents
    assets_weight: float = 0.1         # Weight for available assets
    
    # Income thresholds (annual USD)
    poverty_threshold: int = 15000
    low_income_threshold: int = 35000
    middle_income_threshold: int = 75000
    high_income_threshold: int = 150000
    
    # Insurance coverage modifiers
    uninsured_modifier: float = 1.5
    underinsured_modifier: float = 1.2
    insured_modifier: float = 1.0
    well_insured_modifier: float = 0.8

@dataclass
class ResourceAgentConfig:
    """Configuration for hospital resource matching agent"""
    model_config: ModelConfig = field(default_factory=ModelConfig)
    
    # Scoring weights (must sum to 1.0)
    capacity_weight: float = 0.3       # Weight for bed availability
    staff_weight: float = 0.25         # Weight for staffing levels
    equipment_weight: float = 0.2      # Weight for equipment availability
    specialization_weight: float = 0.15 # Weight for specialized care
    location_weight: float = 0.1       # Weight for geographic proximity
    
    # Capacity thresholds (percentage)
    critical_capacity: float = 0.95    # Above 95% capacity is critical
    high_capacity: float = 0.85        # Above 85% capacity is high
    moderate_capacity: float = 0.70    # Above 70% capacity is moderate
    
    # Distance thresholds (kilometers)
    local_distance: float = 10.0
    regional_distance: float = 50.0
    distant_threshold: float = 200.0

@dataclass
class CoordinatorAgentConfig:
    """Configuration for agent coordination"""
    model_config: ModelConfig = field(default_factory=ModelConfig)
    
    # Final scoring weights (must sum to 1.0)
    severity_weight: float = 0.5       # Weight for medical severity
    financial_weight: float = 0.3      # Weight for financial need
    resource_weight: float = 0.2       # Weight for resource availability
    
    # Confidence thresholds for decision making
    high_confidence_threshold: float = 0.8
    medium_confidence_threshold: float = 0.6
    low_confidence_threshold: float = 0.4
    
    # Priority ranking thresholds
    urgent_priority_threshold: float = 8.5
    high_priority_threshold: float = 7.0
    medium_priority_threshold: float = 5.0
    low_priority_threshold: float = 3.0

@dataclass
class ValidationConfig:
    """Configuration for response validation"""
    
    # Score validation ranges
    min_score: float = 0.0
    max_score: float = 10.0
    
    # Required confidence levels
    min_confidence: float = 0.0
    max_confidence: float = 1.0
    
    # Response structure requirements
    required_fields: List[str] = field(default_factory=lambda: [
        "score", "confidence", "reasoning", "timestamp"
    ])
    
    # Maximum response length
    max_reasoning_length: int = 500
    max_factors_count: int = 10

class AgentConfiguration:
    """Main configuration class for all agents"""
    
    def __init__(self):
        # Agent-specific configurations
        self.severity = SeverityAgentConfig()
        self.financial = FinancialAgentConfig()
        self.resource = ResourceAgentConfig()
        self.coordinator = CoordinatorAgentConfig()
        self.validation = ValidationConfig()
        
        # Global settings
        self.api_timeout: int = 30  # seconds
        self.max_retries: int = 3
        self.retry_delay: float = 2.0
        self.enable_caching: bool = True
        self.cache_ttl: int = 3600  # seconds (1 hour)
        
        # Environment-specific overrides
        self._load_env_overrides()
    
    def _load_env_overrides(self):
        """Load configuration overrides from environment variables"""
        
        # Model configuration overrides
        if os.getenv("GROQ_MODEL"):
            model_name = os.getenv("GROQ_MODEL")
            for config in [self.severity.model_config, self.financial.model_config, 
                          self.resource.model_config, self.coordinator.model_config]:
                config.model_name = model_name
        
        if os.getenv("AGENT_TEMPERATURE"):
            temp = float(os.getenv("AGENT_TEMPERATURE"))
            for config in [self.severity.model_config, self.financial.model_config,
                          self.resource.model_config, self.coordinator.model_config]:
                config.temperature = temp
        
        # Timeout overrides
        if os.getenv("AGENT_TIMEOUT"):
            self.api_timeout = int(os.getenv("AGENT_TIMEOUT"))
        
        # Retry configuration
        if os.getenv("AGENT_MAX_RETRIES"):
            self.max_retries = int(os.getenv("AGENT_MAX_RETRIES"))
        
        # Cache configuration
        if os.getenv("ENABLE_AGENT_CACHE"):
            self.enable_caching = os.getenv("ENABLE_AGENT_CACHE").lower() == "true"
    
    def get_agent_config(self, agent_type: AgentType) -> Any:
        """
        Get configuration for specific agent type
        
        Args:
            agent_type: Type of agent to get config for
            
        Returns:
            Agent-specific configuration object
        """
        config_map = {
            AgentType.SEVERITY: self.severity,
            AgentType.FINANCIAL: self.financial,
            AgentType.RESOURCE: self.resource,
            AgentType.COORDINATOR: self.coordinator
        }
        
        return config_map.get(agent_type)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert configuration to dictionary"""
        return {
            "severity": self.severity.__dict__,
            "financial": self.financial.__dict__,
            "resource": self.resource.__dict__,
            "coordinator": self.coordinator.__dict__,
            "validation": self.validation.__dict__,
            "global": {
                "api_timeout": self.api_timeout,
                "max_retries": self.max_retries,
                "retry_delay": self.retry_delay,
                "enable_caching": self.enable_caching,
                "cache_ttl": self.cache_ttl
            }
        }

# Global configuration instance
config = AgentConfiguration()

def get_config() -> AgentConfiguration:
    """Get global configuration instance"""
    return config

def update_config(**kwargs):
    """Update global configuration with provided values"""
    global config
    
    for key, value in kwargs.items():
        if hasattr(config, key):
            setattr(config, key, value)