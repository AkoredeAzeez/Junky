# backend/scripts/init_db.py
import os
import sys
import click
from flask_migrate import init, migrate, upgrade
from flask.cli import with_appcontext

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app, db
from app.models.user import User, UserRole
from werkzeug.security import generate_password_hash
from datetime import datetime


@click.command("init-db")
@click.option(
    "--with-sample-data", is_flag=True, help="Add sample data to the database"
)
@with_appcontext
def init_db_command(with_sample_data):
    """Initialize the database with tables and optional sample data."""
    app = create_app()

    with app.app_context():
        # Check if migration directory exists
        migrations_dir = os.path.join(os.path.dirname(__file__), "..", "migrations")
        if not os.path.exists(migrations_dir):
            click.echo("Initializing migrations directory...")
            init()

        # Create migration
        click.echo("Creating migration...")
        migrate(message="Initial migration")

        # Apply migration
        click.echo("Applying migration...")
        upgrade()

        if with_sample_data:
            click.echo("Adding sample data...")
            add_sample_data()

        click.echo("Database initialization complete!")


def add_sample_data():
    """Add sample users and other data for development."""
    # Create admin user
    admin = User(
        email="admin@example.com",
        password=generate_password_hash("Admin@123"),
        first_name="Admin",
        last_name="User",
        role=UserRole.ADMIN,
        created_at=datetime.utcnow(),
        is_active=True,
    )

    # Create hospital user
    hospital = User(
        email="hospital@example.com",
        password=generate_password_hash("Hospital@123"),
        first_name="Hospital",
        last_name="Admin",
        role=UserRole.HOSPITAL,
        created_at=datetime.utcnow(),
        is_active=True,
    )

    # Create patient user
    patient = User(
        email="patient@example.com",
        password=generate_password_hash("Patient@123"),
        first_name="Patient",
        last_name="User",
        role=UserRole.PATIENT,
        created_at=datetime.utcnow(),
        is_active=True,
    )

    # Create donor user
    donor = User(
        email="donor@example.com",
        password=generate_password_hash("Donor@123"),
        first_name="Donor",
        last_name="User",
        role=UserRole.DONOR,
        created_at=datetime.utcnow(),
        is_active=True,
    )

    # Add users to session
    db.session.add(admin)
    db.session.add(hospital)
    db.session.add(patient)
    db.session.add(donor)

    # Flush to get IDs
    db.session.flush()

    # Create profiles for each user type
    from app.models.patient import Patient
    from app.models.hospital import Hospital

    # Hospital profile
    hospital_profile = Hospital(
        user_id=hospital.id,
        hospital_name="City General Hospital",
        hospital_address="123 Healthcare Blvd, Medical City, MC 12345",
        license_number="MC123456789",
        specializations=["Cardiology", "Oncology", "Neurology"],
        is_verified=True,
    )

    # Patient profile
    patient_profile = Patient(
        user_id=patient.id,
        date_of_birth="1990-05-15",
        medical_condition="Type 1 Diabetes",
        contact_number="+1234567890",
        is_verified=True,
    )

    db.session.add(hospital_profile)
    db.session.add(patient_profile)

    # Commit all changes
    db.session.commit()

    print("Sample data added successfully!")


if __name__ == "__main__":
    init_db_command()
