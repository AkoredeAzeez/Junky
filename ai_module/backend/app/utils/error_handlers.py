# backend/app/utils/error_handlers.py

from flask import jsonify
from werkzeug.exceptions import HTTPException


def register_error_handlers(app):
    """Register error handlers for the Flask app"""

    @app.errorhandler(400)
    def bad_request(e):
        """Handle 400 Bad Request errors"""
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Bad request",
                    "errors": getattr(e, "description", str(e)),
                }
            ),
            400,
        )

    @app.errorhandler(401)
    def unauthorized(e):
        """Handle 401 Unauthorized errors"""
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Unauthorized",
                    "errors": getattr(e, "description", str(e)),
                }
            ),
            401,
        )

    @app.errorhandler(403)
    def forbidden(e):
        """Handle 403 Forbidden errors"""
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Forbidden",
                    "errors": getattr(e, "description", str(e)),
                }
            ),
            403,
        )

    @app.errorhandler(404)
    def not_found(e):
        """Handle 404 Not Found errors"""
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Resource not found",
                    "errors": getattr(e, "description", str(e)),
                }
            ),
            404,
        )

    @app.errorhandler(422)
    def unprocessable_entity(e):
        """Handle 422 Unprocessable Entity errors"""
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Validation error",
                    "errors": getattr(e, "description", str(e)),
                }
            ),
            422,
        )

    @app.errorhandler(500)
    def internal_server_error(e):
        """Handle 500 Internal Server Error errors"""
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Internal server error",
                    "errors": getattr(e, "description", "An unexpected error occurred"),
                }
            ),
            500,
        )

    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        """Handle all other HTTP exceptions"""
        return (
            jsonify({"status": "error", "message": e.name, "errors": e.description}),
            e.code,
        )


# Custom API exceptions
class APIError(Exception):
    """Base API error class"""

    def __init__(self, message, status_code=400, payload=None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or {})
        rv["message"] = self.message
        rv["status"] = "error"
        return rv


class ValidationError(APIError):
    """Validation error"""

    def __init__(self, errors, message="Validation error", status_code=422):
        super().__init__(message, status_code, {"errors": errors})


class NotFoundError(APIError):
    """Resource not found error"""

    def __init__(self, message="Resource not found", status_code=404):
        super().__init__(message, status_code)


class AuthenticationError(APIError):
    """Authentication error"""

    def __init__(self, message="Authentication error", status_code=401):
        super().__init__(message, status_code)


class AuthorizationError(APIError):
    """Authorization error"""

    def __init__(
        self,
        message="You don't have permission to access this resource",
        status_code=403,
    ):
        super().__init__(message, status_code)


class DatabaseError(APIError):
    """Database error"""

    def __init__(self, message="Database error", status_code=500):
        super().__init__(message, status_code)
