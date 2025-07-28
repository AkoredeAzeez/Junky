"""
Validation utilities for agent outputs in JUNKY Healthcare DAO
"""
import logging
from typing import Dict, Any, List, Optional, Union, Tuple
from dataclasses import dataclass
from datetime import datetime, timezone
import re
from enum import Enum

from .response_parser import AgentResponse
from ..config.agent_config import get_config, AgentType

# Configure logging
logger = logging.getLogger(__name__)

class ValidationLevel(Enum):
    """Validation strictness levels"""
    STRICT = "strict"      # All validations must pass
    MODERATE = "moderate"  # Major validations must pass
    LENIENT = "lenient"    # Only critical validations must pass

class ValidationResult(Enum):
    """Validation results"""
    PASS = "pass"
    WARNING = "warning"
    FAIL = "fail"

@dataclass
class ValidationIssue:
    """Represents a validation issue"""
    level: ValidationResult
    field: str
    message: str
    expected: Optional[str] = None
    actual: Optional[str] = None
    
    def __str__(self) -> str:
        return f"[{self.level.value.upper()}] {self.field}: {self.message}"

@dataclass
class ValidationReport:
    """Complete validation report"""
    is_valid: bool
    issues: List[ValidationIssue]
    warnings_count: int
    errors_count: int
    validation_level: ValidationLevel
    
    def __str__(self) -> str:
        status = "VALID" if self.is_valid else "INVALID"
        return f"Validation {status}: {self.errors_count} errors, {self.warnings_count} warnings"

class AgentValidator:
    """Validator for agent responses and inputs"""
    
    def __init__(self, validation_level: ValidationLevel = ValidationLevel.MODERATE):
        self.validation_level = validation_level
        self.config = get_config()
    
    def validate_response(self, response: AgentResponse, agent_type: AgentType) -> ValidationReport:
        """
        Comprehensive validation of agent response
        
        Args:
            response: AgentResponse to validate
            agent_type: Type of agent that generated response
            
        Returns:
            ValidationReport with issues and overall status
        """
        issues = []
        
        # Core field validations
        issues.extend(self._validate_score(response.score))
        issues.extend(self._validate_confidence(response.confidence))
        issues.extend(self._validate_reasoning(response.reasoning))
        issues.extend(self._validate_factors(response.factors))
        issues.extend(self._validate_timestamp(response.timestamp))
        issues.extend(self._validate_agent_type(response.agent_type, agent_type))
        
        # Agent-specific validations
        issues.extend(self._validate_agent_specific(response, agent_type))
        
        # Business logic validations
        issues.extend(self._validate_business_logic(response, agent_type))
        
        # Count issues by level
        errors = [issue for issue in issues if issue.level == ValidationResult.FAIL]
        warnings = [issue for issue in issues if issue.level == ValidationResult.WARNING]
        
        # Determine overall validity based on validation level
        is_valid = self._determine_validity(errors, warnings)
        
        return ValidationReport(
            is_valid=is_valid,
            issues=issues,
            warnings_count=len(warnings),
            errors_count=len(errors),
            validation_level=self.validation_level
        )
    
    def validate_input_data(self, data: Dict[str, Any], agent_type: AgentType) -> ValidationReport:
        """
        Validate input data for agent processing
        
        Args:
            data: Input data dictionary
            agent_type: Type of agent that will process data
            
        Returns:
            ValidationReport
        """
        issues = []
        
        # Common input validations
        issues.extend(self._validate_required_fields(data, agent_type))
        issues.extend(self._validate_data_types(data, agent_type))
        issues.extend(self._validate_data_ranges(data, agent_type))
        
        # Agent-specific input validations
        if agent_type == AgentType.SEVERITY:
            issues.extend(self._validate_severity_input(data))
        elif agent_type == AgentType.FINANCIAL:
            issues.extend(self._validate_financial_input(data))
        elif agent_type == AgentType.RESOURCE:
            issues.extend(self._validate_resource_input(data))
        
        # Count issues
        errors = [issue for issue in issues if issue.level == ValidationResult.FAIL]
        warnings = [issue for issue in issues if issue.level == ValidationResult.WARNING]
        
        is_valid = self._determine_validity(errors, warnings)
        
        return ValidationReport(
            is_valid=is_valid,
            issues=issues,
            warnings_count=len(warnings),
            errors_count=len(errors),
            validation_level=self.validation_level
        )
    
    def _validate_score(self, score: float) -> List[ValidationIssue]:
        """Validate score field"""
        issues = []
        
        if not isinstance(score, (int, float)):
            issues.append(ValidationIssue(
                level=ValidationResult.FAIL,
                field="score",
                message="Score must be a number",
                expected="float",
                actual=str(type(score))
            ))
            return issues
        
        if not (0.0 <= score <= 10.0):
            issues.append(ValidationIssue(
                level=ValidationResult.FAIL,
                field="score",
                message="Score must be between 0.0 and 10.0",
                expected="0.0 <= score <= 10.0",
                actual=str(score)
            ))
        
        # Warning for extreme scores without high confidence
        if (score < 1.0 or score > 9.0):
            issues.append(ValidationIssue(
                level=ValidationResult.WARNING,
                field="score",
                message="Extreme score detected - ensure confidence is appropriate",
                actual=str(score)
            ))
        
        return issues
    
    def _validate_confidence(self, confidence: float) -> List[ValidationIssue]:
        """Validate confidence field"""
        issues = []
        
        if not isinstance(confidence, (int, float)):
            issues.append(ValidationIssue(
                level=ValidationResult.FAIL,
                field="confidence",
                message="Confidence must be a number",
                expected="float",
                actual=str(type(confidence))
            ))
            return issues
        
        if not (0.0 <= confidence <= 1.0):
            issues.append(ValidationIssue(
                level=ValidationResult.FAIL,
                field="confidence",
                message="Confidence must be between 0.0 and 1.0",
                expected="0.0 <= confidence <= 1.0",
                actual=str(confidence)
            ))
        
        # Warning for very low confidence
        if confidence < 0.3:
            issues.append(ValidationIssue(
                level=ValidationResult.WARNING,
                field="confidence",
                message="Very low confidence detected",
                actual=str(confidence)
            ))
        
        return issues
    
    def _validate_reasoning(self, reasoning: str) -> List[ValidationIssue]:
        """Validate reasoning field"""
        issues = []
        
        if not isinstance(reasoning, str):
            issues.append(ValidationIssue(
                level=ValidationResult.FAIL,
                field="reasoning",
                message="Reasoning must be a string",
                expected="string",
                actual=str(type(reasoning))
            ))
            return issues
        
        reasoning = reasoning.strip()
        
        if len(reasoning) < 10:
            issues.append(ValidationIssue(
                level=ValidationResult.FAIL,
                field="reasoning",
                message="Reasoning too short (minimum 10 characters)",
                expected=">=10 characters",
                actual=f"{len(reasoning)} characters"
            ))
        
        if len(reasoning) > 1000:
            issues.append(ValidationIssue(
                level=ValidationResult.WARNING,
                field="reasoning",
                message="Reasoning very long, consider summarizing",
                actual=f"{len(reasoning)} characters"
            ))
        
        # Check for placeholder text
        placeholder_patterns = [
            r"lorem ipsum", r"placeholder", r"todo", r"tbd", r"fixme"
        ]
        
        for pattern in placeholder_patterns:
            if re.search(pattern, reasoning, re.IGNORECASE):
                issues.append(ValidationIssue(
                    level=ValidationResult.FAIL,
                    field="reasoning",
                    message="Reasoning contains placeholder text",
                    actual=pattern
                ))
        
        return issues
    
    def _validate_factors(self, factors: List[str]) -> List[ValidationIssue]:
        """Validate factors field"""
        issues = []
        
        if not isinstance(factors, list):
            issues.append(ValidationIssue(
                level=ValidationResult.FAIL,
                field="factors",
                message="Factors must be a list",
                expected="list",
                actual=str(type(factors))
            ))
            return issues
        
        if len(factors) > 10:
            issues.append(ValidationIssue(
                level=ValidationResult.WARNING,
                field="factors",
                message="Too many factors, consider consolidating",
                expected="<=10 factors",
                actual=f"{len(factors)} factors"
            ))
        
        # Validate individual factors
        for i, factor in enumerate(factors):
            if not isinstance(factor, str):
                issues.append(ValidationIssue(
                    level=ValidationResult.FAIL,
                    field=f"factors[{i}]",
                    message="Factor must be a string",
                    expected="string",
                    actual=str(type(factor))
                ))
            elif len(factor.strip()) < 3:
                issues.append(ValidationIssue(
                    level=ValidationResult.WARNING,
                    field=f"factors[{i}]",
                    message="Factor too short",
                    actual=factor
                ))
        
        return issues
    
    def _validate_timestamp(self, timestamp: str) -> List[ValidationIssue]:
        """Validate timestamp field"""
        issues = []
        
        if not isinstance(timestamp, str):
            issues.append(ValidationIssue(
                level=ValidationResult.FAIL,
                field="timestamp",
                message="Timestamp must be a string",
                expected="string",
                actual=str(type(timestamp))
            ))
            return issues
        
        try:
            # Try to parse ISO format timestamp
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            
            # Check if timestamp is reasonable (not too far in future/past)
            now = datetime.now(timezone.utc)
            diff = abs((dt - now).total_seconds())
            
            if diff > 3600:  # More than 1 hour difference
                issues.append(ValidationIssue(
                    level=ValidationResult.WARNING,
                    field="timestamp",
                    message="Timestamp differs significantly from current time",
                    actual=timestamp
                ))
                
        except ValueError:
            issues.append(ValidationIssue(
                level=ValidationResult.FAIL,
                field="timestamp",
                message="Invalid timestamp format (expected ISO format)",
                expected="ISO 8601 format",
                actual=timestamp
            ))
        
        return issues
    
    def _validate_agent_type(self, response_agent_type: str, expected_type: AgentType) -> List[ValidationIssue]:
        """Validate agent type consistency"""
        issues = []
        
        if response_agent_type != expected_type.value:
            issues.append(ValidationIssue(
                level=ValidationResult.WARNING,
                field="agent_type",
                message="Agent type mismatch",
                expected=expected_type.value,
                actual=response_agent_type
            ))
        
        return issues
    
    def _validate_agent_specific(self, response: AgentResponse, agent_type: AgentType) -> List[ValidationIssue]:
        """Agent-specific validations"""
        issues = []
        
        if agent_type == AgentType.SEVERITY:
            issues.extend(self._validate_severity_response(response))
        elif agent_type == AgentType.FINANCIAL:
            issues.extend(self._validate_financial_response(response))
        elif agent_type == AgentType.RESOURCE:
            issues.extend(self._validate_resource_response(response))
        elif agent_type == AgentType.COORDINATOR:
            issues.extend(self._validate_coordinator_response(response))
        
        return issues
    
    def _validate_severity_response(self, response: AgentResponse) -> List[ValidationIssue]:
        """Validate severity agent specific requirements"""
        issues = []
        
        # High severity scores should have high confidence
        if response.score >= 8.0 and response.confidence < 0.7:
            issues.append(ValidationIssue(
                level=ValidationResult.WARNING,
                field="severity_confidence",
                message="High severity score with low confidence",
                actual=f"score={response.score}, confidence={response.confidence}"
            ))
        
        # Check for medical keywords in reasoning
        medical_keywords = ['diagnosis', 'symptoms', 'treatment', 'condition', 'medical', 'clinical']
        if not any(keyword in response.reasoning.lower() for keyword in medical_keywords):
            issues.append(ValidationIssue(
                level=ValidationResult.WARNING,
                field="severity_reasoning",
                message="Medical context not clearly evident in reasoning",
                actual=response.reasoning[:100] + "..."
            ))
        
        return issues
    
    def _validate_financial_response(self, response: AgentResponse) -> List[ValidationIssue]:
        """Validate financial agent specific requirements"""
        issues = []
        
        # Check for financial keywords in reasoning
        financial_keywords = ['income', 'debt', 'insurance', 'financial', 'cost', 'afford', 'payment']
        if not any(keyword in response.reasoning.lower() for keyword in financial_keywords):
            issues.append(ValidationIssue(
                level=ValidationResult.WARNING,
                field="financial_reasoning",
                message="Financial context not clearly evident in reasoning",
                actual=response.reasoning[:100] + "..."
            ))
        
        return issues
    
    def _validate_resource_response(self, response: AgentResponse) -> List[ValidationIssue]:
        """Validate resource agent specific requirements"""
        issues = []
        
        # Check for resource keywords in reasoning
        resource_keywords = ['capacity', 'beds', 'staff', 'equipment', 'resources', 'availability']
        if not any(keyword in response.reasoning.lower() for keyword in resource_keywords):
            issues.append(ValidationIssue(
                level=ValidationResult.WARNING,
                field="resource_reasoning",
                message="Resource context not clearly evident in reasoning",
                actual=response.reasoning[:100] + "..."
            ))
        
        return issues
    
    def _validate_coordinator_response(self, response: AgentResponse) -> List[ValidationIssue]:
        """Validate coordinator agent specific requirements"""
        issues = []
        
        # Coordinator should have comprehensive reasoning
        if len(response.reasoning) < 50:
            issues.append(ValidationIssue(
                level=ValidationResult.WARNING,
                field="coordinator_reasoning",
                message="Coordinator reasoning should be more comprehensive",
                actual=f"{len(response.reasoning)} characters"
            ))
        
        return issues
    
    def _validate_business_logic(self, response: AgentResponse, agent_type: AgentType) -> List[ValidationIssue]:
        """Validate business logic consistency"""
        issues = []
        
        # Score-confidence correlation
        if response.score > 8.0 and response.confidence < 0.6:
            issues.append(ValidationIssue(
                level=ValidationResult.WARNING,
                field="logic_consistency",
                message="High score with low confidence may indicate uncertainty",
                actual=f"score={response.score}, confidence={response.confidence}"
            ))
        
        # Low score with high confidence
        if response.score < 3.0 and response.confidence > 0.9:
            issues.append(ValidationIssue(
                level=ValidationResult.WARNING,
                field="logic_consistency",
                message="Low score with very high confidence may be unusual",
                actual=f"score={response.score}, confidence={response.confidence}"
            ))
        
        return issues
    
    def _validate_required_fields(self, data: Dict[str, Any], agent_type: AgentType) -> List[ValidationIssue]:
        """Validate required input fields for each agent type"""
        issues = []
        
        required_fields = {
            AgentType.SEVERITY: ['diagnosis', 'symptoms', 'age'],
            AgentType.FINANCIAL: ['income', 'insurance_status'],
            AgentType.RESOURCE: ['location', 'required_resources'],
            AgentType.COORDINATOR: ['severity_data', 'financial_data', 'resource_data']
        }
        
        required = required_fields.get(agent_type, [])
        
        for field in required:
            if field not in data:
                issues.append(ValidationIssue(
                    level=ValidationResult.FAIL,
                    field=f"input_{field}",
                    message=f"Required field '{field}' missing",
                    expected=field
                ))
            elif data[field] is None or data[field] == "":
                issues.append(ValidationIssue(
                    level=ValidationResult.FAIL,
                    field=f"input_{field}",
                    message=f"Required field '{field}' is empty",
                    expected="non-empty value",
                    actual="empty"
                ))
        
        return issues
    
    def _validate_data_types(self, data: Dict[str, Any], agent_type: AgentType) -> List[ValidationIssue]:
        """Validate data types for input fields"""
        issues = []
        
        # Define expected types for common fields
        type_expectations = {
            'age': (int, float),
            'income': (int, float),
            'diagnosis': str,
            'symptoms': (str, list),
            'location': str,
            'insurance_status': str
        }
        
        for field, expected_types in type_expectations.items():
            if field in data:
                if not isinstance(data[field], expected_types):
                    issues.append(ValidationIssue(
                        level=ValidationResult.FAIL,
                        field=f"input_{field}",
                        message=f"Invalid data type for '{field}'",
                        expected=str(expected_types),
                        actual=str(type(data[field]))
                    ))
        
        return issues
    
    def _validate_data_ranges(self, data: Dict[str, Any], agent_type: AgentType) -> List[ValidationIssue]:
        """Validate data value ranges"""
        issues = []
        
        # Age validation
        if 'age' in data:
            age = data['age']
            if isinstance(age, (int, float)):
                if age < 0 or age > 150:
                    issues.append(ValidationIssue(
                        level=ValidationResult.FAIL,
                        field="input_age",
                        message="Age out of valid range",
                        expected="0-150",
                        actual=str(age)
                    ))
        
        # Income validation
        if 'income' in data:
            income = data['income']
            if isinstance(income, (int, float)):
                if income < 0:
                    issues.append(ValidationIssue(
                        level=ValidationResult.FAIL,
                        field="input_income",
                        message="Income cannot be negative",
                        expected=">=0",
                        actual=str(income)
                    ))
        
        return issues
    
    def _validate_severity_input(self, data: Dict[str, Any]) -> List[ValidationIssue]:
        """Severity agent specific input validation"""
        issues = []
        
        # Validate diagnosis is not empty
        if 'diagnosis' in data and not data['diagnosis'].strip():
            issues.append(ValidationIssue(
                level=ValidationResult.FAIL,
                field="input_diagnosis",
                message="Diagnosis cannot be empty",
                expected="non-empty string"
            ))
        
        return issues
    
    def _validate_financial_input(self, data: Dict[str, Any]) -> List[ValidationIssue]:
        """Financial agent specific input validation"""
        issues = []
        
        # Validate insurance status
        valid_insurance_statuses = ['uninsured', 'underinsured', 'insured', 'well_insured']
        if 'insurance_status' in data:
            if data['insurance_status'] not in valid_insurance_statuses:
                issues.append(ValidationIssue(
                    level=ValidationResult.WARNING,
                    field="input_insurance_status",
                    message="Unknown insurance status",
                    expected=str(valid_insurance_statuses),
                    actual=data['insurance_status']
                ))
        
        return issues
    
    def _validate_resource_input(self, data: Dict[str, Any]) -> List[ValidationIssue]:
        """Resource agent specific input validation"""
        issues = []
        
        # Validate required resources format
        if 'required_resources' in data:
            resources = data['required_resources']
            if isinstance(resources, str):
                if not resources.strip():
                    issues.append(ValidationIssue(
                        level=ValidationResult.FAIL,
                        field="input_required_resources",
                        message="Required resources cannot be empty",
                        expected="non-empty string or list"
                    ))
        
        return issues
    
    def _determine_validity(self, errors: List[ValidationIssue], warnings: List[ValidationIssue]) -> bool:
        """Determine overall validity based on validation level"""
        
        if self.validation_level == ValidationLevel.STRICT:
            return len(errors) == 0 and len(warnings) == 0
        elif self.validation_level == ValidationLevel.MODERATE:
            return len(errors) == 0
        else:  # LENIENT
            # Only fail on critical errors (could be refined further)
            critical_errors = [e for e in errors if 'must' in e.message.lower()]
            return len(critical_errors) == 0

# Global validator instance
_validator = AgentValidator()

def validate_response(response: AgentResponse, agent_type: AgentType) -> ValidationReport:
    """Validate agent response using global validator"""
    return _validator.validate_response(response, agent_type)

def validate_input(data: Dict[str, Any], agent_type: AgentType) -> ValidationReport:
    """Validate input data using global validator"""
    return _validator.validate_input_data(data, agent_type)

def set_validation_level(level: ValidationLevel):
    """Set global validation level"""
    global _validator
    _validator.validation_level = level