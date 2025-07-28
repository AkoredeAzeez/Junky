# backend/app/models/application.py
from datetime import datetime
import uuid
from app import db


class Application(db.Model):
    """Application model for funding requests"""

    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True)
    application_number = db.Column(
        db.String(32), unique=True, nullable=False, index=True
    )
    patient_id = db.Column(db.Integer, db.ForeignKey("patients.id"), nullable=False)
    hospital_id = db.Column(db.Integer, db.ForeignKey("hospitals.id"), nullable=False)
    medical_condition = db.Column(db.String(256), nullable=False)
    diagnosis = db.Column(db.Text, nullable=False)
    treatment_plan = db.Column(db.Text, nullable=False)
    estimated_cost = db.Column(db.Float, nullable=False)
    insurance_coverage = db.Column(db.Float, default=0.0)
    requested_amount = db.Column(db.Float, nullable=False)
    urgency_level = db.Column(
        db.String(20), nullable=False
    )  # low, medium, high, critical
    supporting_documents = db.Column(
        db.String(256), nullable=True
    )  # Path to uploaded documents
    doctor_name = db.Column(db.String(128), nullable=False)
    doctor_specialization = db.Column(db.String(128), nullable=False)
    treatment_duration = db.Column(db.Integer, nullable=True)  # in days
    treatment_start_date = db.Column(db.Date, nullable=True)
    ai_severity_score = db.Column(db.Float, nullable=True)
    ai_financial_need_score = db.Column(db.Float, nullable=True)
    ai_resource_match_score = db.Column(db.Float, nullable=True)
    ai_overall_score = db.Column(db.Float, nullable=True)
    status = db.Column(
        db.String(20), default="pending"
    )  # pending, verified, approved, funded, completed, rejected
    hospital_verified = db.Column(db.Boolean, default=False)
    hospital_verification_date = db.Column(db.DateTime, nullable=True)
    hospital_notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    patient = db.relationship("Patient", back_populates="applications")
    hospital = db.relationship("Hospital", back_populates="applications")
    funding_proposals = db.relationship("Proposal", back_populates="application")
    donations = db.relationship("Donation", back_populates="application")
    transactions = db.relationship("Transaction", back_populates="application")

    def __init__(
        self,
        patient_id,
        hospital_id,
        medical_condition,
        diagnosis,
        treatment_plan,
        estimated_cost,
        requested_amount,
        urgency_level,
        doctor_name,
        doctor_specialization,
        **kwargs,
    ):
        super(Application, self).__init__(**kwargs)
        self.application_number = f"APP-{uuid.uuid4().hex[:8].upper()}"
        self.patient_id = patient_id
        self.hospital_id = hospital_id
        self.medical_condition = medical_condition
        self.diagnosis = diagnosis
        self.treatment_plan = treatment_plan
        self.estimated_cost = estimated_cost
        self.requested_amount = requested_amount
        self.urgency_level = urgency_level
        self.doctor_name = doctor_name
        self.doctor_specialization = doctor_specialization

    def __repr__(self):
        return f"<Application {self.application_number}>"

    @property
    def funded_amount(self):
        """Calculate total funded amount from donations"""
        funded = sum(
            donation.amount
            for donation in self.donations
            if donation.status == "completed"
        )
        return funded

    @property
    def funding_percentage(self):
        """Calculate funding progress percentage"""
        if self.requested_amount > 0:
            return (self.funded_amount / self.requested_amount) * 100
        return 0

    @property
    def remaining_amount(self):
        """Calculate remaining amount needed"""
        return max(0, self.requested_amount - self.funded_amount)


class Donation(db.Model):
    """Donation model for tracking contributions"""

    __tablename__ = "donations"

    id = db.Column(db.Integer, primary_key=True)
    transaction_id = db.Column(db.String(128), unique=True, nullable=False)
    donor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    application_id = db.Column(
        db.Integer, db.ForeignKey("applications.id"), nullable=True
    )
    general_fund = db.Column(
        db.Boolean, default=False
    )  # True if donation to general fund
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), default="ADA")  # Cardano's native token
    status = db.Column(
        db.String(20), default="pending"
    )  # pending, completed, failed, refunded
    anonymous = db.Column(db.Boolean, default=False)
    message = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    donor = db.relationship("User", back_populates="donations")
    application = db.relationship("Application", back_populates="donations")

    def __init__(
        self,
        transaction_id,
        donor_id,
        amount,
        application_id=None,
        general_fund=False,
        **kwargs,
    ):
        super(Donation, self).__init__(**kwargs)
        self.transaction_id = transaction_id
        self.donor_id = donor_id
        self.amount = amount
        self.application_id = application_id
        self.general_fund = general_fund

    def __repr__(self):
        return f"<Donation {self.id}>"


class Transaction(db.Model):
    """Transaction model for blockchain transactions"""

    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True)
    transaction_hash = db.Column(db.String(128), unique=True, nullable=False)
    application_id = db.Column(
        db.Integer, db.ForeignKey("applications.id"), nullable=False
    )
    transaction_type = db.Column(
        db.String(20), nullable=False
    )  # donation, disbursement
    amount = db.Column(db.Float, nullable=False)
    sender_address = db.Column(db.String(128), nullable=False)
    recipient_address = db.Column(db.String(128), nullable=False)
    status = db.Column(db.String(20), default="pending")  # pending, confirmed, failed
    block_height = db.Column(db.Integer, nullable=True)
    confirmation_time = db.Column(db.DateTime, nullable=True)
    metadata = db.Column(db.Text, nullable=True)  # JSON string with additional info
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    application = db.relationship("Application", back_populates="transactions")

    def __init__(
        self,
        transaction_hash,
        application_id,
        transaction_type,
        amount,
        sender_address,
        recipient_address,
        **kwargs,
    ):
        super(Transaction, self).__init__(**kwargs)
        self.transaction_hash = transaction_hash
        self.application_id = application_id
        self.transaction_type = transaction_type
        self.amount = amount
        self.sender_address = sender_address
        self.recipient_address = recipient_address

    def __repr__(self):
        return f"<Transaction {self.transaction_hash[:10]}>"
