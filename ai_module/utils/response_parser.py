"""
Response parsing utilities for structured LLM outputs in JUNKY Healthcare DAO
"""
import json
import re
import logging
from typing import Dict, Any, Optional, List, Union
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from enum import Enum

# Configure logging
logger = logging.getLogger(__name__)

class ParseError(Exception):
    """Custom exception for parsing errors"""
    pass

@dataclass
class AgentResponse:
    """Standardized agent response structure"""
    score: float
    confidence: float
    reasoning: str
    factors: List[str]
    timestamp: str
    agent_type: str
    raw_response: str = ""
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}
        
        # Ensure timestamp is in ISO format
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return asdict(self)
    
    def is_valid(self) -> bool:
        """Check if response contains valid data"""
        return (
            0.0 <= self.score <= 10.0 and
            0.0 <= self.confidence <= 1.0 and
            len(self.reasoning.strip()) > 0
        )

class ResponseParser:
    """Parser for structured LLM responses"""
    
    def __init__(self):
        # JSON extraction patterns
        self.json_patterns = [
            r'```json\s*(\{.*?\})\s*```',  # JSON in code blocks
            r'```\s*(\{.*?\})\s*```',      # JSON in generic code blocks
            r'(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})',  # Standalone JSON objects
        ]
        
        # Score extraction patterns
        self.score_patterns = [
            r'(?:score|rating|severity)[:\s]*([0-9]+(?:\.[0-9]+)?)',
            r'([0-9]+(?:\.[0-9]+)?)\s*(?:out of|/)\s*10',
            r'([0-9]+(?:\.[0-9]+)?)\s*(?:points?|score)',
        ]
        
        # Confidence extraction patterns
        self.confidence_patterns = [
            r'(?:confidence|certainty)[:\s]*([0-9]+(?:\.[0-9]+)?)',
            r'([0-9]+(?:\.[0-9]+)?)%?\s*confident',
            r'confidence.*?([0-9]+(?:\.[0-9]+)?)',
        ]
    
    def parse_agent_response(
        self, 
        response_text: str, 
        agent_type: str,
        fallback_extraction: bool = True
    ) -> AgentResponse:
        """
        Parse agent response text into structured format
        
        Args:
            response_text: Raw response text from LLM
            agent_type: Type of agent that generated response
            fallback_extraction: Whether to use fallback parsing if JSON fails
            
        Returns:
            AgentResponse object
        """
        
        # First try to extract JSON
        json_data = self._extract_json(response_text)
        
        if json_data:
            try:
                return self._parse_json_response(json_data, agent_type, response_text)
            except Exception as e:
                logger.warning(f"JSON parsing failed: {e}")
        
        # Fallback to text extraction
        if fallback_extraction:
            logger.info("Using fallback text parsing")
            return self._parse_text_response(response_text, agent_type)
        
        raise ParseError(f"Could not parse response: {response_text[:200]}...")
    
    def _extract_json(self, text: str) -> Optional[Dict[str, Any]]:
        """Extract JSON object from text using regex patterns"""
        
        for pattern in self.json_patterns:
            matches = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)
            
            for match in matches:
                try:
                    # Clean up the JSON string
                    json_str = match.strip()
                    json_obj = json.loads(json_str)
                    
                    if isinstance(json_obj, dict):
                        return json_obj
                        
                except json.JSONDecodeError:
                    continue
        
        return None
    
    def _parse_json_response(
        self, 
        json_data: Dict[str, Any], 
        agent_type: str,
        raw_response: str
    ) -> AgentResponse:
        """Parse structured JSON response"""
        
        # Extract required fields with fallbacks
        score = self._extract_numeric_value(json_data, ['score', 'rating', 'severity', 'priority'])
        confidence = self._extract_numeric_value(json_data, ['confidence', 'certainty'])
        reasoning = self._extract_text_value(json_data, ['reasoning', 'explanation', 'justification', 'analysis'])
        factors = self._extract_list_value(json_data, ['factors', 'components', 'elements', 'criteria'])
        
        # Validate extracted values
        if score is None:
            raise ParseError("No valid score found in JSON response")
        
        if confidence is None:
            confidence = 0.5  # Default confidence
        
        if not reasoning:
            reasoning = "No reasoning provided"
        
        if not factors:
            factors = []
        
        # Normalize values
        score = self._normalize_score(score)
        confidence = self._normalize_confidence(confidence)
        
        return AgentResponse(
            score=score,
            confidence=confidence,
            reasoning=reasoning,
            factors=factors,
            timestamp=datetime.now(timezone.utc).isoformat(),
            agent_type=agent_type,
            raw_response=raw_response,
            metadata=json_data
        )
    
    def _parse_text_response(self, text: str, agent_type: str) -> AgentResponse:
        """Fallback parsing using regex patterns"""
        
        # Extract score
        score = self._extract_score_from_text(text)
        if score is None:
            score = 5.0  # Default middle score
        
        # Extract confidence
        confidence = self._extract_confidence_from_text(text)
        if confidence is None:
            confidence = 0.5  # Default confidence
        
        # Extract reasoning (take first substantial paragraph)
        reasoning = self._extract_reasoning_from_text(text)
        if not reasoning:
            reasoning = text[:200] + "..." if len(text) > 200 else text
        
        # Extract factors (look for bullet points or lists)
        factors = self._extract_factors_from_text(text)
        
        return AgentResponse(
            score=score,
            confidence=confidence,
            reasoning=reasoning,
            factors=factors,
            timestamp=datetime.now(timezone.utc).isoformat(),
            agent_type=agent_type,
            raw_response=text
        )
    
    def _extract_numeric_value(self, data: Dict[str, Any], keys: List[str]) -> Optional[float]:
        """Extract numeric value from dict using multiple possible keys"""
        
        for key in keys:
            if key in data:
                value = data[key]
                try:
                    return float(value)
                except (ValueError, TypeError):
                    continue
        
        return None
    
    def _extract_text_value(self, data: Dict[str, Any], keys: List[str]) -> str:
        """Extract text value from dict using multiple possible keys"""
        
        for key in keys:
            if key in data and isinstance(data[key], str):
                return data[key].strip()
        
        return ""
    
    def _extract_list_value(self, data: Dict[str, Any], keys: List[str]) -> List[str]:
        """Extract list value from dict using multiple possible keys"""
        
        for key in keys:
            if key in data:
                value = data[key]
                if isinstance(value, list):
                    return [str(item) for item in value]
                elif isinstance(value, str):
                    # Try to parse comma-separated values
                    return [item.strip() for item in value.split(',') if item.strip()]
        
        return []
    
    def _extract_score_from_text(self, text: str) -> Optional[float]:
        """Extract score using regex patterns"""
        
        for pattern in self.score_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            
            for match in matches:
                try:
                    score = float(match)
                    if 0 <= score <= 10:
                        return score
                except ValueError:
                    continue
        
        return None
    
    def _extract_confidence_from_text(self, text: str) -> Optional[float]:
        """Extract confidence using regex patterns"""
        
        for pattern in self.confidence_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            
            for match in matches:
                try:
                    confidence = float(match)
                    # Handle percentage format
                    if confidence > 1.0:
                        confidence = confidence / 100.0
                    
                    if 0 <= confidence <= 1.0:
                        return confidence
                        
                except ValueError:
                    continue
        
        return None
    
    def _extract_reasoning_from_text(self, text: str) -> str:
        """Extract reasoning from text"""
        
        # Look for sentences that explain the reasoning
        sentences = re.split(r'[.!?]+', text)
        reasoning_sentences = []
        
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 20:  # Filter out very short sentences
                reasoning_sentences.append(sentence)
        
        if reasoning_sentences:
            return '. '.join(reasoning_sentences[:3])  # Take first 3 substantial sentences
        
        return text[:200]  # Fallback to first 200 characters
    
    def _extract_factors_from_text(self, text: str) -> List[str]:
        """Extract factors from text using common list patterns"""
        
        factors = []
        
        # Look for bullet points
        bullet_patterns = [
            r'[•\-\*]\s+(.+)',
            r'\d+\.\s+(.+)',
            r'[^\w\s]\s+(.+)',
        ]
        
        for pattern in bullet_patterns:
            matches = re.findall(pattern, text, re.MULTILINE)
            if matches:
                factors.extend([match.strip() for match in matches])
                break
        
        # If no bullet points found, look for comma-separated items
        if not factors:
            # Look for patterns like "factors include: x, y, z"
            factor_match = re.search(r'(?:factors?|reasons?|elements?).*?:\s*(.+)', text, re.IGNORECASE)
            if factor_match:
                factor_text = factor_match.group(1)
                factors = [item.strip() for item in factor_text.split(',') if item.strip()]
        
        return factors[:10]  # Limit to 10 factors
    
    def _normalize_score(self, score: float) -> float:
        """Normalize score to 0-10 range"""
        return max(0.0, min(10.0, score))
    
    def _normalize_confidence(self, confidence: float) -> float:
        """Normalize confidence to 0-1 range"""
        # Handle percentage format
        if confidence > 1.0:
            confidence = confidence / 100.0
        
        return max(0.0, min(1.0, confidence))
    
    def validate_response(self, response: AgentResponse) -> List[str]:
        """
        Validate agent response and return list of issues
        
        Args:
            response: AgentResponse to validate
            
        Returns:
            List of validation issues (empty if valid)
        """
        issues = []
        
        # Score validation
        if not (0.0 <= response.score <= 10.0):
            issues.append(f"Score {response.score} not in valid range [0.0, 10.0]")
        
        # Confidence validation
        if not (0.0 <= response.confidence <= 1.0):
            issues.append(f"Confidence {response.confidence} not in valid range [0.0, 1.0]")
        
        # Reasoning validation
        if not response.reasoning or len(response.reasoning.strip()) < 10:
            issues.append("Reasoning too short or missing")
        
        # Factors validation
        if len(response.factors) > 10:
            issues.append(f"Too many factors: {len(response.factors)} (max 10)")
        
        # Timestamp validation
        try:
            datetime.fromisoformat(response.timestamp.replace('Z', '+00:00'))
        except ValueError:
            issues.append("Invalid timestamp format")
        
        return issues

# Global parser instance
_parser = ResponseParser()

def parse_response(response_text: str, agent_type: str) -> AgentResponse:
    """
    Parse agent response using global parser
    
    Args:
        response_text: Raw LLM response
        agent_type: Type of agent
        
    Returns:
        Parsed AgentResponse
    """
    return _parser.parse_agent_response(response_text, agent_type)

def validate_response(response: AgentResponse) -> List[str]:
    """
    Validate agent response using global parser
    
    Args:
        response: AgentResponse to validate
        
    Returns:
        List of validation issues
    """
    return _parser.validate_response(response)