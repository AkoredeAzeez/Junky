# backend/app/routes/auth.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.services.auth_service import AuthService, AuthenticationError
from app.models.user import UserRole
import logging

auth_bp = Blueprint("auth", __name__)
logger = logging.getLogger(__name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user"""
    try:
        data = request.get_json()

        # Extract required fields
        email = data.get("email")
        password = data.get("password")
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        role_name = data.get("role", "DONOR")  # Default to DONOR if not specified

        # Validate role
        try:
            role = UserRole[role_name.upper()]
        except (KeyError, AttributeError):
            return jsonify({"error": "Invalid role specified"}), 400

        # Additional fields based on role
        kwargs = {}
        if role == UserRole.PATIENT:
            kwargs = {
                "date_of_birth": data.get("date_of_birth"),
                "medical_condition": data.get("medical_condition"),
                "contact_number": data.get("contact_number"),
            }
        elif role == UserRole.HOSPITAL:
            kwargs = {
                "hospital_name": data.get("hospital_name"),
                "hospital_address": data.get("hospital_address"),
                "license_number": data.get("license_number"),
                "specializations": data.get("specializations", []),
            }

        # Register the user
        user = AuthService.register_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=role,
            **kwargs
        )

        return (
            jsonify(
                {
                    "message": "Registration successful",
                    "user_id": user.id,
                    "role": user.role.name,
                }
            ),
            201,
        )

    except AuthenticationError as e:
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        logger.exception("Registration error")
        return jsonify({"error": "An unexpected error occurred"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate a user and issue JWT"""
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        # Authenticate user
        auth_data = AuthService.authenticate(email, password)

        return (
            jsonify(
                {
                    "message": "Login successful",
                    "user": {
                        "id": auth_data["id"],
                        "email": auth_data["email"],
                        "first_name": auth_data["first_name"],
                        "last_name": auth_data["last_name"],
                        "role": auth_data["role"],
                    },
                    "access_token": auth_data["access_token"],
                    "refresh_token": auth_data["refresh_token"],
                }
            ),
            200,
        )

    except AuthenticationError as e:
        return jsonify({"error": str(e)}), 401

    except Exception as e:
        logger.exception("Login error")
        return jsonify({"error": "An unexpected error occurred"}), 500


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """Issue a new access token using refresh token"""
    try:
        user_id = get_jwt_identity()
        token_data = AuthService.refresh_token(user_id)

        return jsonify({"access_token": token_data["access_token"]}), 200

    except AuthenticationError as e:
        return jsonify({"error": str(e)}), 401

    except Exception as e:
        logger.exception("Token refresh error")
        return jsonify({"error": "An unexpected error occurred"}), 500


@auth_bp.route("/password", methods=["PUT"])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        current_password = data.get("current_password")
        new_password = data.get("new_password")

        if not current_password or not new_password:
            return jsonify({"error": "Current and new passwords are required"}), 400

        AuthService.change_password(user_id, current_password, new_password)

        return jsonify({"message": "Password changed successfully"}), 200

    except AuthenticationError as e:
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        logger.exception("Password change error")
        return jsonify({"error": "An unexpected error occurred"}), 500


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_profile():
    """Get current user profile"""
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()

        # Here you would typically fetch the full user profile
        # For now, we'll just return the claims from the token
        return (
            jsonify(
                {
                    "id": user_id,
                    "email": claims.get("email"),
                    "role": claims.get("role"),
                }
            ),
            200,
        )

    except Exception as e:
        logger.exception("Profile retrieval error")
        return jsonify({"error": "An unexpected error occurred"}), 500
