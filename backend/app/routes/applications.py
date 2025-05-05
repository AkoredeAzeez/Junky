 # backend/app/routes/applications.py
from flask import Blueprint, request, jsonify, g
from app.models.application import Application
from app.models.patient import Patient
from app.models.hospital import Hospital
from app.services.application_service import ApplicationService
from app.utils.helpers import validate_request, token_required, role_required

applications_bp = Blueprint('applications', __name__)

@applications_bp.route('/', methods=['POST'])
@token_required
def create_application(current_user):
    """
    Create a new funding application.
    """
    # Validate request data
    data, error = validate_request(request, [
        'hospital_id', 
        'treatment_description', 
        'amount_requested'
    ])
    
    if error:
        return jsonify({'success': False, 'message': error}), 400
    
    # Check if user has a patient profile
    patient = Patient.query.filter_by(user_id=current_user.id).first()
    if not patient:
        return jsonify({
            'success': False,
            'message': 'Patient profile not found. Please create a patient profile first.'
        }), 400
    
    # Validate hospital exists
    hospital = Hospital.query.get(data['hospital_id'])
    if not hospital:
        return jsonify({
            'success': False,
            'message': 'Hospital not found'
        }), 400
    
    # Process supporting documents
    supporting_documents = data.get('supporting_documents', {})
    
    # Create application
    result = ApplicationService.create_application(
        patient_id=patient.id,
        hospital_id=data['hospital_id'],
        treatment_description=data['treatment_description'],
        amount_requested=float(data['amount_requested']),
        supporting_documents=supporting_documents
    )
    
    if result['success']:
        return jsonify(result), 201
    else:
        return jsonify(result), 400

@applications_bp.route('/', methods=['GET'])
@token_required
def get_applications(current_user):
    """
    Get applications based on user role.
    """
    # Get query parameters
    status = request.args.get('status')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    
    # Get applications based on role
    result = ApplicationService.get_applications(
        user=current_user,
        status=status,
        page=page,
        per_page=per_page
    )
    
    return jsonify(result), 200

@applications_bp.route('/<int:application_id>', methods=['GET'])
@token_required
def get_application(current_user, application_id):
    """
    Get a specific application by ID.
    """
    result = ApplicationService.get_application_by_id(
        application_id=application_id,
        user=current_user
    )
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 404

@applications_bp.route('/<int:application_id>', methods=['PUT'])
@token_required
def update_application(current_user, application_id):
    """
    Update an application (only if it's pending).
    """
    # Validate request data
    data, error = validate_request(request, [])
    if error:
        return jsonify({'success': False, 'message': error}), 400
    
    # Update application
    result = ApplicationService.update_application(
        application_id=application_id,
        user=current_user,
        update_data=data
    )
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), result.get('status_code', 400)

@applications_bp.route('/<int:application_id>/evaluate', methods=['POST'])
@role_required(['admin'])
def evaluate_application(current_user, application_id):
    """
    Trigger AI evaluation for an application.
    """
    result = ApplicationService.evaluate_application(application_id)
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 400
