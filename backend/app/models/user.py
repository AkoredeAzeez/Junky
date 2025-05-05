# backend/app/models/user.py
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from app import db

class User(db.Model):
    """Base user model for authentication and shared properties"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    username = db.Column(db.String(64), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'patient', 'hospital', 'donor', 'dao_member', 'admin'
    first_name = db.Column(db.String(64), nullable=True)
    last_name = db.Column(db.String(64), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    wallet_address = db.Column(db.String(128), nullable=True, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    
    # Relationships
    # Relationship with Patient model using SQLAlchemy's joined table inheritance
    patient = db.relationship('Patient', uselist=False, back_populates='user')
    
    # Relationship with Hospital model
    hospital = db.relationship('Hospital', uselist=False, back_populates='user')
    
    # Donations made by this user (if donor)
    donations = db.relationship('Donation', back_populates='donor')
    
    # Votes cast by this user (if DAO member)
    votes = db.relationship('Vote', back_populates='voter')
    
    __mapper_args__ = {
        'polymorphic_on': role,
        'polymorphic_identity': 'user'
    }
    
    def __init__(self, email, username, password, role='donor', **kwargs):
        super(User, self).__init__(**kwargs)
        self.email = email
        self.username = username
        self.set_password(password)
        self.role = role
    
    def set_password(self, password):
        """Set user password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check password against stored hash"""
        return check_password_hash(self.password_hash, password)
    
    def generate_auth_token(self, expires_delta=None):
        """Generate JWT token for authentication"""
        return create_access_token(identity=self.id, expires_delta=expires_delta)
    
    def __repr__(self):
        return f'<User {self.username}>'