use aiken/collection/list
use cardano/transaction.{OutputReference, Transaction}
use types.{HyperParams, PoolAction, PoolDatum}

/// Main donation pool validator
/// This validator protects the pool UTxO and ensures all operations
/// follow the correct rules
validator donation_pool {
  spend(
    optionDatum: Option<PoolDatum>,
    redeemer: PoolAction,
    _utxo: OutputReference,
    _self: Transaction,
  ) {
    expect Some(datum) = optionDatum

    when redeemer is {
      // Donation action - relatively simple validation
      PoolAction.Donate { donor: _donor, amount: _amount, req_id: _req_id } ->
        // TODO: Implement donation validation
        // For donations, we might want to ensure:
        // 1. The amount being added matches the transaction inputs
        // 2. The output datum is correctly updated with the new total
        // 3. Optionally log the request_id if voting for a specific request
        True

      // Distribution action - requires more complex validation
      PoolAction.Distribute { results } -> {
        // Calculate total distribution amount 
        let total_distribution =
          list.foldl(
            results,
            0,
            fn(pair, acc) {
              let (_, amount) = pair
              acc + amount
            },
          )
        // Check that the distribution amount matches the expected percentage
        let expected_amount = datum.total_ada * datum.hyperparams.percent / 100

        // TODO: Implement full validation:
        // 1. Verify distribution interval constraints
        // 2. Check that results contain only top-N highest weighted requests
        // 3. Ensure the remaining ADA stays in the pool
        total_distribution == expected_amount
      }
    }
  }

  else(_) {
    fail
  }
}
