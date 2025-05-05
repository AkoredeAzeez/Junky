# backend/app/models/proposal.py
from datetime import datetime, timedelta
import uuid
from app import db

class Proposal(db.Model):
    """DAO Proposal model for funding decisions"""
    __tablename__ = 'proposals'
    
    id = db.Column(db.Integer, primary_key=True)
    proposal_number = db.Column(db.String(32), unique=True, nullable=False, index=True)
    title = db.Column(db.String(256), nullable=False)
    description = db.Column(db.Text, nullable=False)
    proposal_type = db.Column(db.String(20), nullable=False)  # funding, governance, parameter
    application_id = db.Column(db.Integer, db.ForeignKey('applications.id'), nullable=True)
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    requested_amount = db.Column(db.Float, nullable=True)  # For funding proposals
    parameter_key = db.Column(db.String(64), nullable=True)  # For parameter change proposals
    parameter_value = db.Column(db.String(256), nullable=True)  # For parameter change proposals
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, active, passed, rejected, executed
    execution_date = db.Column(db.DateTime, nullable=True)
    quorum_reached = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    application = db.relationship('Application', back_populates='funding_proposals')
    creator = db.relationship('User', foreign_keys=[creator_id])
    votes = db.relationship('Vote', back_populates='proposal')
    
    def __init__(self, title, description, proposal_type, creator_id, 
                 voting_duration_days=3, application_id=None, requested_amount=None, 
                 parameter_key=None, parameter_value=None, **kwargs):
        super(Proposal, self).__init__(**kwargs)
        self.proposal_number = f"PROP-{uuid.uuid4().hex[:8].upper()}"
        self.title = title
        self.description = description
        self.proposal_type = proposal_type
        self.creator_id = creator_id
        self.application_id = application_id
        self.requested_amount = requested_amount
        self.parameter_key = parameter_key
        self.parameter_value = parameter_value
        self.start_date = datetime.utcnow()
        self.end_date = self.start_date + timedelta(days=voting_duration_days)
    
    def __repr__(self):
        return f'<Proposal {self.proposal_number}>'
    
    @property
    def is_active(self):
        """Check if proposal is currently active for voting"""
        now = datetime.utcnow()
        return self.start_date <= now <= self.end_date and self.status == 'active'
    
    @property
    def time_remaining(self):
        """Calculate remaining time for voting in hours"""
        if not self.is_active:
            return 0
        
        remaining = self.end_date - datetime.utcnow()
        return max(0, remaining.total_seconds() / 3600)  # Convert to hours
    
    @property
    def vote_count(self):
        """Get total number of votes"""
        return len(self.votes)
    
    @property
    def yes_votes(self):
        """Get count of YES votes"""
        return sum(1 for vote in self.votes if vote.vote_type == 'yes')
    
    @property
    def no_votes(self):
        """Get count of NO votes"""
        return sum(1 for vote in self.votes if vote.vote_type == 'no')
    
    @property
    def abstain_votes(self):
        """Get count of ABSTAIN votes"""
        return sum(1 for vote in self.votes if vote.vote_type == 'abstain')
    
    @property
    def total_voting_power(self):
        """Get total voting power cast"""
        return sum(vote.voting_power for vote in self.votes)
    
    @property
    def yes_voting_power(self):
        """Get total YES voting power"""
        return sum(vote.voting_power for vote in self.votes if vote.vote_type == 'yes')
    
    @property
    def no_voting_power(self):
        """Get total NO voting power"""
        return sum(vote.voting_power for vote in self.votes if vote.vote_type == 'no')


class Vote(db.Model):
    """Vote model for DAO governance"""
    __tablename__ = 'votes'
    
    id = db.Column(db.Integer, primary_key=True)
    proposal_id = db.Column(db.Integer, db.ForeignKey('proposals.id'), nullable=False)
    voter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    vote_type = db.Column(db.String(10), nullable=False)  # yes, no, abstain
    voting_power = db.Column(db.Float, nullable=False)  # Based on token holdings
    reason = db.Column(db.Text, nullable=True)
    transaction_hash = db.Column(db.String(128), nullable=True)  # If votes are recorded on blockchain
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    proposal = db.relationship('Proposal', back_populates='votes')
    voter = db.relationship('User', back_populates='votes')
    
    # Enforce one vote per user per proposal
    __table_args__ = (
        db.UniqueConstraint('proposal_id', 'voter_id', name='unique_vote'),
    )
    
    def __init__(self, proposal_id, voter_id, vote_type, voting_power, **kwargs):
        super(Vote, self).__init__(**kwargs)
        self.proposal_id = proposal_id
        self.voter_id = voter_id
        self.vote_type = vote_type
        self.voting_power = voting_power
    
    def __repr__(self):
        return f'<Vote {self.id}>'