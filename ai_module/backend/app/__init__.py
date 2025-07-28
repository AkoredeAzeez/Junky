# backend/app/__init__.py (updated)
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import logging
from logging.handlers import RotatingFileHandler
import os

from config import config

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app(config_name="default"):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)

    # Register error handlers
    from app.utils.error_handlers import register_error_handlers

    register_error_handlers(app)

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.applications import applications_bp
    from app.routes.voting import voting_bp
    from app.routes.transactions import transactions_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(applications_bp, url_prefix="/api/applications")
    app.register_blueprint(voting_bp, url_prefix="/api/voting")
    app.register_blueprint(transactions_bp, url_prefix="/api/transactions")

    # Setup logging
    if not app.debug and not app.testing:
        # Ensure log directory exists
        if not os.path.exists("logs"):
            os.mkdir("logs")

        # Create file handler for logging
        file_handler = RotatingFileHandler(
            "logs/healthcare_donation.log", maxBytes=10240, backupCount=10
        )
        file_handler.setFormatter(
            logging.Formatter(
                "%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]"
            )
        )
        file_handler.setLevel(logging.INFO)

        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info("Healthcare Donation System startup")

    # Shell context for Flask CLI
    @app.shell_context_processor
    def make_shell_context():
        return {
            "db": db,
            "User": User,
            "Patient": Patient,
            "Hospital": Hospital,
            "Application": Application,
            "Proposal": Proposal,
            "Vote": Vote,
            "Transaction": Transaction,
        }

    # Import models for shell context
    from app.models.user import User
    from app.models.patient import Patient
    from app.models.hospital import Hospital
    from app.models.application import Application
    from app.models.proposal import Proposal
    from app.models.vote import Vote
    from app.models.transaction import Transaction

    # Health check route
    @app.route("/api/health")
    def health():
        return jsonify({"status": "healthy"})

    return app
