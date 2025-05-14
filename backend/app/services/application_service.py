# backend/app/services/application_service.py
from datetime import datetime
from app import db
from app.models.application import Application
from app.models.patient import Patient
from app.models.hospital import Hospital
from sqlalchemy import desc


class ApplicationService:
    @staticmethod
    def create_application(
        patient_id,
        hospital_id,
        treatment_description,
        amount_requested,
        supporting_documents=None,
    ):
        """
        Create a new funding application.
        """
        try:
            # Validate patient and hospital
            patient = Patient.query.get(patient_id)
            hospital = Hospital.query.get(hospital_id)

            if not patient or not hospital:
                return {"success": False, "message": "Invalid patient or hospital ID"}

            # Create new application
            new_application = Application(
                patient_id=patient_id,
                hospital_id=hospital_id,
                treatment_description=treatment_description,
                amount_requested=amount_requested,
                supporting_documents=supporting_documents or {},
                status="pending",
            )

            db.session.add(new_application)
            db.session.commit()

            # Return the created application
            return {
                "success": True,
                "message": "Application created successfully",
                "application": new_application.to_dict(),
            }

        except Exception as e:
            db.session.rollback()
            return {
                "success": False,
                "message": f"Error creating application: {str(e)}",
            }

    @staticmethod
    def get_applications(user, status=None, page=1, per_page=10):
        """
        Get applications based on user role.
        """
        try:
            query = Application.query

            # Filter based on user role
            if user.role == "admin":
                # Admins can see all applications
                pass
            elif user.role == "hospital":
                # Hospitals can only see applications for their hospital
                hospital = Hospital.query.filter_by(user_id=user.id).first()
                if hospital:
                    query = query.filter_by(hospital_id=hospital.id)
                else:
                    return {"success": False, "message": "Hospital profile not found"}
            else:
                # Regular users can only see their own applications
                patient = Patient.query.filter_by(user_id=user.id).first()
                if patient:
                    query = query.filter_by(patient_id=patient.id)
                else:
                    return {"success": False, "message": "Patient profile not found"}

            # Filter by status if provided
            if status:
                query = query.filter_by(status=status)

            # Sort by created_at in descending
        except Exception as e:
            return {
                "success": False,
                "message": f"Error retrieving applications: {str(e)}",
            }
