# backend/app/models/hospital.py
from datetime import datetime
from app import db

class Hospital(db.Model):
    """Hospital model for healthcare providers"""
    __tablename__ = 'hospitals'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(256), nullable=False)
    hospital_type = db.Column(db.String(64), nullable=True)  # public, private, non-profit
    specialty = db.Column(db.String(128), nullable=True)
    address = db.Column(db.String(256), nullable=False)
    city = db.Column(db.String(64), nullable=False)
    state = db.Column(db.String(64), nullable=False)
    country = db.Column(db.String(64), nullable=False)
    postal_code = db.Column(db.String(20), nullable=False)
    registration_number = db.Column(db.String(64), nullable=False, unique=True)
    tax_id = db.Column(db.String(64), nullable=True)
    website = db.Column(db.String(128), nullable=True)
    contact_name = db.Column(db.String(128), nullable=False)
    contact_position = db.Column(db.String(64), nullable=True)
    verification_documents = db.Column(db.String(256), nullable=True)  # Path to uploaded verification docs
    verification_status = db.Column(db.String(20), default='pending')  # pending, verified, rejected
    verification_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', back_populates='hospital')
    applications = db.relationship('Application', back_populates='hospital')
    resources = db.relationship('HospitalResource', back_populates='hospital')
    
    def __init__(self, user_id, name, address, city, state, country, postal_code, 
                 registration_number, contact_name, **kwargs):
        super(Hospital, self).__init__(**kwargs)
        self.user_id = user_id
        self.name = name
        self.address = address
        self.city = city
        self.state = state
        self.country = country
        self.postal_code = postal_code
        self.registration_number = registration_number
        self.contact_name = contact_name
    
    def __repr__(self):
        return f'<Hospital {self.name}>'

class HospitalResource(db.Model):
    """Model for tracking hospital resources and availability"""
    __tablename__ = 'hospital_resources'
    
    id = db.Column(db.Integer, primary_key=True)
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'), nullable=False)
    resource_type = db.Column(db.String(64), nullable=False)  # beds, specialists, equipment
    resource_name = db.Column(db.String(128), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    available_quantity = db.Column(db.Integer, nullable=False)
    unit_cost = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    hospital = db.relationship('Hospital', back_populates='resources')
    
    def __init__(self, hospital_id, resource_type, resource_name, quantity, available_quantity, **kwargs):
        super(HospitalResource, self).__init__(**kwargs)
        self.hospital_id = hospital_id
        self.resource_type = resource_type
        self.resource_name = resource_name
        self.quantity = quantity
        self.available_quantity = available_quantity
    
    def __repr__(self):
        return f'<HospitalResource {self.resource_name}>'