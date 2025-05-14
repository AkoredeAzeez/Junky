/// Main data type for the donation pool UTxO
/// Contains all information about the pool state and configuration
pub type PoolDatum {
  /// Unique identifier for the pool
  pool_id: ByteArray,
  /// Total ADA amount currently in the pool
  total_ada: Int,
  /// Timestamp of the last distribution
  last_dist: Int,
  /// Configuration parameters for distribution
  hyperparams: HyperParams,
}

/// Configuration parameters for the donation distribution
pub type HyperParams {
  /// Percentage of the pool to distribute (as integer percentage)
  percent: Int,
  /// Time interval between distributions (in seconds)
  interval: Int,
  /// Number of top requests to consider for distribution
  top_n: Int,
}

/// Redeemer actions for the pool validator
pub type PoolAction {
  /// Action to add funds to the pool
  Donate {
    /// Address of the donor
    donor: ByteArray,
    /// Amount of ADA donated
    amount: Int,
    /// Optional request ID this donation votes for (can be empty)
    req_id: ByteArray,
  }
  /// Action to distribute funds from the pool to selected recipients
  Distribute {
    /// List of recipient addresses and amounts to distribute
    results: List<(ByteArray, Int)>,
  }
}

/// Represents a funding request in the system
pub type Request {
  /// Unique identifier for the request
  request_id: ByteArray,
  /// Address of the hospital that submitted the request
  hospital_addr: ByteArray,
  /// AI-generated triage score (0-100)
  triage_score: Int,
}

/// Represents voting weight for distribution calculation
pub type VoteWeight {
  /// Request this weight applies to
  request_id: ByteArray,
  /// Weight from AI triage scoring
  ai_weight: Int,
  /// Weight from donor votes
  donor_weight: Int,
  /// Combined total weight
  total_weight: Int,
}

/// Represents a distribution event
pub type Distribution {
  /// Unique identifier for this distribution
  distribution_id: ByteArray,
  /// Timestamp when the distribution occurred
  timestamp: Int,
  /// Percentage of pool that was distributed
  percent_pool: Int,
  /// List of recipient addresses and amounts
  recipients: List<(ByteArray, Int)>,
}
