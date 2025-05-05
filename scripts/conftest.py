# tests/conftest.py
import pytest
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import create_app, db
from app.models.user import User
from flask_jwt_extended import create_access_token

@pytest.fixture
def app():
    """Create and configure a Flask app for testing."""
    app = create_app('testing')
    
    # Create a test client using the Flask application
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture
def runner(app):
    """A test CLI runner for the app."""
    return app.test_cli_runner()

@pytest.fixture
def auth_headers(app):
    """Generate headers with JWT token."""
    with app.app_context():
        # Create a test admin user
        admin = User(
            email='admin@test.com',
            first_name='Admin',
            last_name='User',
            role='admin'
        )
        admin.set_password('password123')
        db.session.add(admin)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=admin.id)
        
    return {'Authorization': f'Bearer {access_token}'}

@pytest.fixture
def donor_user(app):
    """Create a test donor user."""
    with app.app_context():
        donor = User(
            email='donor@test.com',
            first_name='Donor',
            last_name='User',
            role='donor'
        )
        donor.set_password('password123')
        db.session.add(donor)
        db.session.commit()
        return donor

@pytest.fixture
def patient_user(app):
    """Create a test patient user."""
    with app.app_context():
        patient = User(
            email='patient@test.com',
            first_name='Patient',
            last_name='User',
            role='patient'
        )
        patient.set_password('password123')
        db.session.add(patient)
        db.session.commit()
        return patient

@pytest.fixture
def hospital_user(app):
    """Create a test hospital user."""
    with app.app_context():
        hospital = User(
            email='hospital@test.com',
            first_name='Hospital',
            last_name='Admin',
            role='hospital'
        )
        hospital.set_password('password123')
        db.session.add(hospital)
        db.session.commit()
        return hospital