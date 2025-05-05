# backend/app/models/patient.py
from datetime import datetime
from app import db
from app.models.user import User

class Patient(db.Model):
    """Patient model for those seeking medical funding"""
    __tablename__ = 'patients'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=True)
    gender = db.Column(db.String(20), nullable=True)
    address = db.Column(db.String(256), nullable=True)
    city = db.Column(db.String(64), nullable=True)
    state = db.Column(db.String(64), nullable=True)
    country = db.Column(db.String(64), nullable=True)
    postal_code = db.Column(db.String(20), nullable=True)
    medical_history = db.Column(db.Text, nullable=True)
    insurance_status = db.Column(db.String(64), nullable=True)
    insurance_provider = db.Column(db.String(128), nullable=True)
    insurance_id = db.Column(db.String(128), nullable=True)
    emergency_contact_name = db.Column(db.String(128), nullable=True)
    emergency_contact_phone = db.Column(db.String(20), nullable=True)
    emergency_contact_relation = db.Column(db.String(64), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', back_populates='patient')
    applications = db.relationship('Application', back_populates='patient')
    
    def __init__(self, user_id, **kwargs):
        super(Patient, self).__init__(**kwargs)
        self.user_id = user_id
    
    def __repr__(self):
        return f'<Patient {self.id}>'
    
    @property
    def full_name(self):
        """Get patient's full name"""
        user = User.query.get(self.user_id)
        return f"{user.first_name} {user.last_name}" if user else "Unknown"
    
    @property
    def age(self):
        """Calculate patient's age based on date of birth"""
        if self.date_of_birth:
            today = datetime.utcnow().date()
            return today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        return None