# backend/app/utils/validators.py

from marshmallow import Schema, fields, validate, ValidationError
import re
from datetime import datetime


# Custom validators
def validate_ada_address(address):
    """Validate Cardano ADA address format"""
    # Basic validation - in production this would be more comprehensive
    if not (address.startswith("addr") and len(address) >= 58):
        raise ValidationError("Invalid Cardano address format")
    return address


def validate_future_date(date):
    """Validate that a date is in the future"""
    if date <= datetime.now().date():
        raise ValidationError("Date must be in the future")
    return date


def validate_phone_number(phone):
    """Validate phone number format"""
    pattern = r"^\+?[1-9]\d{1,14}$"
    if not re.match(pattern, phone):
        raise ValidationError("Invalid phone number format")
    return phone


def validate_email(email):
    """Validate email format"""
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    if not re.match(pattern, email):
        raise ValidationError("Invalid email format")
    return email


# Schema definitions for model validation
class UserSchema(Schema):
    """Schema for validating User data"""

    email = fields.Email(required=True)
    username = fields.String(required=True, validate=validate.Length(min=3, max=50))
    password = fields.String(required=True, validate=validate.Length(min=8))
    role = fields.String(
        required=True,
        validate=validate.OneOf(
            ["patient", "hospital", "donor", "dao_member", "admin"]
        ),
    )
    first_name = fields.String(validate=validate.Length(max=50))
    last_name = fields.String(validate=validate.Length(max=50))
    phone = fields.String(validate=validate_phone_number)
    wallet_address = fields.String(validate=validate_ada_address)


class PatientSchema(Schema):
    """Schema for validating Patient data"""

    user_id = fields.Integer(required=True)
    date_of_birth = fields.Date(required=True)
    medical_condition = fields.String(required=True)
    condition_severity = fields.Integer(
        required=True, validate=validate.Range(min=1, max=10)
    )
    medical_history = fields.String()
    current_medications = fields.String()
    insurance_status = fields.String(
        validate=validate.OneOf(["uninsured", "underinsured", "insured"])
    )
    financial_status = fields.String(required=True)
    required_treatment = fields.String(required=True)
    estimated_cost = fields.Float(required=True, validate=validate.Range(min=0))


class HospitalSchema(Schema):
    """Schema for validating Hospital data"""

    user_id = fields.Integer(required=True)
    name = fields.String(required=True, validate=validate.Length(min=3, max=100))
    address = fields.String(required=True)
    registration_number = fields.String(required=True)
    verification_status = fields.String(
        required=True, validate=validate.OneOf(["pending", "verified", "rejected"])
    )
    specializations = fields.List(fields.String())
    available_resources = fields.Dict()
    contact_person = fields.String(required=True)


class ApplicationSchema(Schema):
    """Schema for validating Application data"""

    patient_id = fields.Integer(required=True)
    title = fields.String(required=True, validate=validate.Length(min=10, max=100))
    description = fields.String(required=True, validate=validate.Length(min=50))
    amount_requested = fields.Float(required=True, validate=validate.Range(min=1))
    treatment_deadline = fields.Date(required=True, validate=validate_future_date)
    supporting_documents = fields.List(fields.String())
    hospital_id = fields.Integer()
    hospital_verification = fields.Boolean(default=False)
    ai_score = fields.Float(validate=validate.Range(min=0, max=1))
    status = fields.String(
        validate=validate.OneOf(
            [
                "draft",
                "submitted",
                "under_review",
                "approved",
                "funded",
                "completed",
                "rejected",
            ]
        )
    )


class ProposalSchema(Schema):
    """Schema for validating Proposal data"""

    title = fields.String(required=True, validate=validate.Length(min=10, max=100))
    description = fields.String(required=True, validate=validate.Length(min=50))
    applications = fields.List(
        fields.Integer(), required=True
    )  # List of application IDs
    amount_total = fields.Float(required=True, validate=validate.Range(min=1))
    created_by = fields.Integer(required=True)  # User ID
    voting_deadline = fields.DateTime(required=True)
    status = fields.String(
        validate=validate.OneOf(["draft", "active", "approved", "rejected", "executed"])
    )
    votes_for = fields.Integer(default=0)
    votes_against = fields.Integer(default=0)


class VoteSchema(Schema):
    """Schema for validating Vote data"""

    user_id = fields.Integer(required=True)
    proposal_id = fields.Integer(required=True)
    vote_type = fields.String(
        required=True, validate=validate.OneOf(["for", "against"])
    )
    voting_power = fields.Float(required=True, validate=validate.Range(min=0))
    timestamp = fields.DateTime(default=datetime.utcnow)


class TransactionSchema(Schema):
    """Schema for validating Transaction data"""

    sender_address = fields.String(required=True, validate=validate_ada_address)
    receiver_address = fields.String(required=True, validate=validate_ada_address)
    amount = fields.Float(required=True, validate=validate.Range(min=0))
    transaction_hash = fields.String()
    status = fields.String(validate=validate.OneOf(["pending", "confirmed", "failed"]))
    transaction_type = fields.String(
        validate=validate.OneOf(["donation", "fund_disbursement", "refund"])
    )
    application_id = fields.Integer()
    proposal_id = fields.Integer()


# backend/app/utils/validators.py
import re
from enum import Enum


def validate_email(email):
    """
    Validate email format

    Args:
        email: Email address to validate

    Returns:
        bool: True if email is valid, False otherwise
    """
    if not email:
        return False

    # Simple regex for email validation
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def validate_password(password):
    """
    Validate password strength

    Args:
        password: Password to validate

    Returns:
        bool: True if password meets requirements, False otherwise
    """
    if not password or len(password) < 8:
        return False

    # Check for at least one letter, one number, and one special character
    has_letter = re.search(r"[a-zA-Z]", password)
    has_number = re.search(r"\d", password)
    has_special = re.search(r'[!@#$%^&*(),.?":{}|<>]', password)

    return bool(has_letter and has_number and has_special)


def validate_cardano_address(address):
    """
    Validate Cardano address format

    Args:
        address: Cardano address to validate

    Returns:
        bool: True if address format is valid, False otherwise
    """
    if not address:
        return False

    # Check for Shelley-era address format (starts with addr1)
    # Or Byron-era address format (starts with Ae2)
    return address.startswith("addr1") or address.startswith("Ae2")


def validate_date_format(date_str, format="%Y-%m-%d"):
    """
    Validate date string format

    Args:
        date_str: Date string to validate
        format: Expected date format

    Returns:
        bool: True if date format is valid, False otherwise
    """
    from datetime import datetime

    if not date_str:
        return False

    try:
        datetime.strptime(date_str, format)
        return True
    except ValueError:
        return False


class ValidationResult(Enum):
    """Enumeration for validation results"""

    VALID = "valid"
    INVALID = "invalid"
    MISSING = "missing"
