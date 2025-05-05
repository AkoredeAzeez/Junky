# backend/app/services/auth_service.py
from datetime import datetime, timedelta
from flask_jwt_extended import create_access_token, create_refresh_token
from werkzeug.security import generate_password_hash, check_password_hash
from app.models.user import User, UserRole
from app import db
from app.utils.validators import validate_email, validate_password

class AuthenticationError(Exception):
    """Base exception for authentication errors"""
    pass

class AuthService:
    """Service for handling user authentication operations"""
    
    @staticmethod
    def register_user(email, password, first_name, last_name, role, **kwargs):
        """
        Register a new user with basic information
        
        Args:
            email: User's email address
            password: User's password
            first_name: User's first name
            last_name: User's last name
            role: UserRole enum value
            **kwargs: Additional role-specific information
            
        Returns:
            The newly created user object
            
        Raises:
            AuthenticationError: If registration fails
        """
        # Validate inputs
        if not validate_email(email):
            raise AuthenticationError("Invalid email format")
            
        if not validate_password(password):
            raise AuthenticationError("Password must be at least 8 characters with letters, numbers, and special characters")
            
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            raise AuthenticationError("Email already registered")
            
        # Create new user
        try:
            new_user = User(
                email=email,
                password=generate_password_hash(password),
                first_name=first_name,
                last_name=last_name,
                role=role,
                created_at=datetime.utcnow(),
                is_active=True
            )
            
            # Add role-specific information based on role
            if role == UserRole.PATIENT:
                # Link to patient profile
                from app.models.patient import Patient
                patient = Patient(user=new_user, **kwargs)
                db.session.add(patient)
                
            elif role == UserRole.HOSPITAL:
                # Link to hospital profile
                from app.models.hospital import Hospital
                hospital = Hospital(user=new_user, **kwargs)
                db.session.add(hospital)
                
            # Add and commit the new user
            db.session.add(new_user)
            db.session.commit()
            return new_user
            
        except Exception as e:
            db.session.rollback()
            raise AuthenticationError(f"Registration failed: {str(e)}")
    
    @staticmethod
    def authenticate(email, password):
        """
        Authenticate a user with email and password
        
        Args:
            email: User's email
            password: User's password
            
        Returns:
            dict: User information and tokens if authentication successful
            
        Raises:
            AuthenticationError: If authentication fails
        """
        # Find user by email
        user = User.query.filter_by(email=email).first()
        
        if not user or not check_password_hash(user.password, password):
            raise AuthenticationError("Invalid email or password")
            
        if not user.is_active:
            raise AuthenticationError("Account is deactivated")
            
        # Generate tokens
        access_token = create_access_token(
            identity=user.id,
            additional_claims={
                'role': user.role.name,
                'email': user.email
            }
        )
        
        refresh_token = create_refresh_token(
            identity=user.id
        )
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Return user data and tokens
        return {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role.name,
            'access_token': access_token,
            'refresh_token': refresh_token
        }
        
    @staticmethod
    def refresh_token(user_id):
        """
        Generate a new access token using a refresh token
        
        Args:
            user_id: ID of the user
            
        Returns:
            dict: New access token
            
        Raises:
            AuthenticationError: If refresh fails
        """
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            raise AuthenticationError("Invalid or inactive user")
            
        access_token = create_access_token(
            identity=user.id,
            additional_claims={
                'role': user.role.name,
                'email': user.email
            }
        )
        
        return {
            'access_token': access_token
        }
        
    @staticmethod
    def change_password(user_id, current_password, new_password):
        """
        Change a user's password
        
        Args:
            user_id: ID of the user
            current_password: Current password for verification
            new_password: New password to set
            
        Returns:
            bool: True if password change was successful
            
        Raises:
            AuthenticationError: If password change fails
        """
        user = User.query.get(user_id)
        
        if not user:
            raise AuthenticationError("User not found")
            
        if not check_password_hash(user.password, current_password):
            raise AuthenticationError("Current password is incorrect")
            
        if not validate_password(new_password):
            raise AuthenticationError("New password does not meet requirements")
            
        user.password = generate_password_hash(new_password)
        user.updated_at = datetime.utcnow()
        
        try:
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            raise AuthenticationError(f"Password change failed: {str(e)}")