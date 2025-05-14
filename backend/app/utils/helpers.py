# backend/app/utils/helpers.py
import json
from functools import wraps
from flask import request, jsonify, g
from app.services.auth_service import AuthService
from app.models.user import User


def validate_request(request, required_fields):
    """
    Validate that the request contains all required fields.

    Args:
        request: Flask request object
        required_fields: List of required field names

    Returns:
        Tuple of (data, error) where error is None if validation succeeds
    """
    try:
        # Get request data from JSON body
        if request.is_json:
            data = request.get_json()
        # Or from form data
        elif request.form:
            data = request.form.to_dict()
        # Or from query parameters
        elif request.args and required_fields:
            data = request.args.to_dict()
        else:
            return None, "No data provided"

        # Check for required fields
        for field in required_fields:
            if field not in data or not data[field]:
                return None, f"Missing required field: {field}"

        return data, None
    except Exception as e:
        return None, str(e)


def token_required(f):
    """
    Decorator to validate JWT token and add current user to request.
    """

    @wraps(f)
    def decorated(*args, **kwargs):
        # Get token from header
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"success": False, "message": "Token is missing"}), 401

        token = (
            auth_header.split(" ")[1]
            if len(auth_header.split(" ")) > 1
            else auth_header
        )

        # Decode token
        result = AuthService.decode_token(token)

        if not result["success"]:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": result.get("message", "Invalid token"),
                    }
                ),
                401,
            )

        # Get user from database
        current_user = User.query.get(result["user_id"])
        if not current_user:
            return jsonify({"success": False, "message": "User not found"}), 404

        if not current_user.is_active:
            return (
                jsonify({"success": False, "message": "User account is inactive"}),
                403,
            )

        # Add user to request context
        g.current_user = current_user

        return f(current_user, *args, **kwargs)

    return decorated


def role_required(roles):
    """
    Decorator to check if user has required role.

    Args:
        roles: List of allowed roles or single role string
    """

    def decorator(f):
        @wraps(f)
        @token_required
        def decorated(current_user, *args, **kwargs):
            # Convert single role to list
            allowed_roles = roles if isinstance(roles, list) else [roles]

            if current_user.role not in allowed_roles:
                return (
                    jsonify({"success": False, "message": "Insufficient permissions"}),
                    403,
                )

            return f(current_user, *args, **kwargs)

        return decorated

    return decorator


def format_response(data=None, message=None, success=True, status_code=200):
    """
    Format API response consistently.
    """
    response = {"success": success}

    if data is not None:
        response["data"] = data

    if message is not None:
        response["message"] = message

    return jsonify(response), status_code
