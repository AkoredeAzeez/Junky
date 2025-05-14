# backend/config.py
import os
from datetime import timedelta


class Config:
    """Base configuration class with settings common to all environments"""

    # Flask settings
    SECRET_KEY = os.environ.get("SECRET_KEY") or "dev-key-please-change-in-production"

    # SQLAlchemy settings
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = (
        os.environ.get("DATABASE_URL") or "sqlite:///healthcare_donation.db"
    )

    # JWT settings
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # Blockchain settings
    CARDANO_NETWORK = os.environ.get("CARDANO_NETWORK") or "testnet"
    BLOCKFROST_PROJECT_ID = os.environ.get("BLOCKFROST_PROJECT_ID") or ""

    # AI model settings
    AI_MODEL_PATH = os.environ.get("AI_MODEL_PATH") or "ai_module/models/trained"

    # File upload settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload
    UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
    ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "doc", "docx"}


class DevelopmentConfig(Config):
    """Development environment configuration"""

    DEBUG = True
    SQLALCHEMY_ECHO = True
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)  # Longer expiry for development

    # Enable CORS for all domains in development
    CORS_ORIGINS = "*"

    # Mock blockchain in development
    USE_MOCK_BLOCKCHAIN = True


class TestingConfig(Config):
    """Testing environment configuration"""

    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"

    # Use shorter token expiry for tests
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(minutes=10)

    # Mock services for testing
    USE_MOCK_BLOCKCHAIN = True
    USE_MOCK_AI = True

    # Disable CSRF protection in tests
    WTF_CSRF_ENABLED = False


class ProductionConfig(Config):
    """Production environment configuration"""

    DEBUG = False
    TESTING = False

    # Ensure these are set in production
    SQLALCHEMY_DATABASE_URI = (
        os.environ.get("DATABASE_URL")
        or "postgresql://user:password@localhost/healthcare_donation"
    )
    SECRET_KEY = os.environ.get("SECRET_KEY") or None
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or None

    if not SECRET_KEY or not JWT_SECRET_KEY:
        raise ValueError("SECRET_KEY and JWT_SECRET_KEY must be set in production")

    # CORS settings for production
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "").split(",")

    # Set to False in production
    USE_MOCK_BLOCKCHAIN = False
    USE_MOCK_AI = False

    # Production-specific logging
    LOG_LEVEL = "INFO"
    LOG_TO_FILE = True
    LOG_FILE_PATH = "/var/log/healthcare_donation/app.log"

    # SSL settings
    SESSION_COOKIE_SECURE = True
    REMEMBER_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True


# Configuration mapping
config = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}
