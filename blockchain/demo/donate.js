require("dotenv").config();
const { BlockFrostAPI } = require("@blockfrost/blockfrost-js");
const CardanoWasm = require("@emurgo/cardano-serialization-lib-nodejs");
const fs = require("fs");
const chalk = require("chalk");

// Initialize Blockfrost API
const api = new BlockFrostAPI({
  projectId: process.env.BLOCKFROST_API_KEY,
  network: process.env.BLOCKFROST_NETWORK,
});

// Configuration
const SCRIPT_ADDRESS = process.env.SCRIPT_ADDRESS;
const PAYMENT_ADDR = process.env.PAYMENT_ADDR;
const PAYMENT_SKEY_PATH = process.env.PAYMENT_SKEY_PATH;
const DONATION_AMOUNT = parseInt(process.env.DONATION_AMOUNT, 10);

// Format ADA amounts from lovelace
function formatAda(lovelaceAmount) {
  return (lovelaceAmount / 1000000).toFixed(6) + " ₳";
}

/**
 * Create a real donation transaction using Cardano Serialization Lib
 * This is a simplified example and would need more error handling in production
 */
async function createDonation() {
  console.log(chalk.blue.bold("\n💰 CREATING REAL DONATION TRANSACTION\n"));

  try {
    // 1. Get network parameters
    console.log("Fetching network parameters...");
    const latestEpoch = await api.epochsLatest();
    const protocolParams = await api.epochsParameters(latestEpoch.epoch);
    const latestBlock = await api.blocksLatest();

    // 2. Get wallet UTXOs to use as inputs
    console.log("Fetching wallet UTXOs...");
    const walletUtxos = await api.addressesUtxos(PAYMENT_ADDR);

    if (walletUtxos.length === 0) {
      throw new Error("No UTXOs found in wallet");
    }

    // 3. Get current pool UTxO (if it exists)
    console.log("Fetching pool UTXOs...");
    const poolUtxos = await api.addressesUtxos(SCRIPT_ADDRESS);

    // 4. Calculate current pool value
    let currentPoolValue = 0;
    let poolDatum = {
      poolId: "pool1",
      totalAda: 0,
      lastDistribution: Math.floor(Date.now() / 1000),
      hyperparams: {
        percent: 0.2,
        interval: 10,
        topN: 5,
      },
    };

    if (poolUtxos.length > 0) {
      // Get the pool UTxO with datum
      const poolUtxo = poolUtxos[0];
      currentPoolValue = parseInt(poolUtxo.amount[0].quantity, 10);

      // In a real implementation, you would decode the datum here
      console.log(`Current pool value: ${formatAda(currentPoolValue)}`);
    }

    // 5. Create updated datum with new total
    poolDatum.totalAda = currentPoolValue + DONATION_AMOUNT;
    console.log(`New pool value will be: ${formatAda(poolDatum.totalAda)}`);

    // In a real implementation, you'd now:

    // 6. Build the transaction
    // const linearFee = CardanoWasm.LinearFee.new(
    //   CardanoWasm.BigNum.from_str(protocolParams.min_fee_a.toString()),
    //   CardanoWasm.BigNum.from_str(protocolParams.min_fee_b.toString())
    // );
    // const txBuilderConfig = CardanoWasm.TransactionBuilderConfigBuilder.new()
    //   .fee_algo(linearFee)
    //   .coins_per_utxo_word(CardanoWasm.BigNum.from_str(protocolParams.coins_per_utxo_size || "34482"))
    //   .pool_deposit(CardanoWasm.BigNum.from_str(protocolParams.pool_deposit))
    //   .key_deposit(CardanoWasm.BigNum.from_str(protocolParams.key_deposit))
    //   .max_value_size(parseInt(protocolParams.max_val_size || 5000, 10))
    //   .max_tx_size(parseInt(protocolParams.max_tx_size, 10))
    //   .build();
    // const txBuilder = CardanoWasm.TransactionBuilder.new(txBuilderConfig);

    // 7. Add inputs from wallet
    // 8. Add outputs to pool script
    // 9. Calculate fee and adjust change
    // 10. Build final transaction

    // 11. Sign transaction
    // const txBody = txBuilder.build();
    // const txHash = CardanoWasm.hash_transaction(txBody);
    // const witnesses = CardanoWasm.TransactionWitnessSet.new();
    // const vkeyWitnesses = CardanoWasm.Vkeywitnesses.new();
    // const txWitness = CardanoWasm.make_vkey_witness(txHash, privateKey);
    // vkeyWitnesses.add(txWitness);
    // witnesses.set_vkeys(vkeyWitnesses);
    // const signedTx = CardanoWasm.Transaction.new(
    //   txBody,
    //   witnesses,
    //   undefined // transaction metadata
    // );

    // 12. Submit transaction
    // const txBytes = Buffer.from(signedTx.to_bytes());
    // const txResponse = await api.txSubmit(txBytes);

    // For demo: mock a transaction submission
    console.log(
      chalk.yellow("In a real implementation, the transaction would now be:")
    );
    console.log("  1. Built with correct inputs and outputs");
    console.log("  2. Signed with the payment key");
    console.log("  3. Submitted to the network");

    // Mock a transaction hash
    const txHash = "mock_tx_" + Math.random().toString(36).substring(2, 15);
    console.log(
      chalk.green(`Transaction would be submitted with hash: ${txHash}`)
    );

    return {
      txHash,
      newPoolValue: poolDatum.totalAda,
    };
  } catch (error) {
    console.error(chalk.red("Error creating donation:"), error);
    return null;
  }
}

/**
 * Display UTxO information
 */
async function displayUtxoInfo() {
  console.log(chalk.blue.bold("\n📊 CURRENT UTxO STATE\n"));

  try {
    // Get wallet UTxOs
    const walletUtxos = await api.addressesUtxos(PAYMENT_ADDR);
    console.log(
      chalk.green(`Wallet (${PAYMENT_ADDR.substring(0, 20)}...) UTxOs:`)
    );

    if (walletUtxos.length === 0) {
      console.log(chalk.yellow("  No UTxOs found in wallet"));
    } else {
      let totalInWallet = 0;
      walletUtxos.slice(0, 5).forEach((utxo) => {
        console.log(
          chalk.cyan(
            `  UTxO: ${utxo.tx_hash.substring(0, 10)}...#${utxo.output_index}`
          )
        );
        console.log(`    Amount: ${formatAda(utxo.amount[0].quantity)}`);
        totalInWallet += parseInt(utxo.amount[0].quantity, 10);
      });

      if (walletUtxos.length > 5) {
        console.log(`  ... and ${walletUtxos.length - 5} more UTxOs`);
      }

      console.log(
        chalk.green(`  Total in Wallet: ${formatAda(totalInWallet)}`)
      );
    }

    // Get pool UTxOs
    const poolUtxos = await api.addressesUtxos(SCRIPT_ADDRESS);
    console.log(
      chalk.green(
        `\nPool Script (${SCRIPT_ADDRESS.substring(0, 20)}...) UTxOs:`
      )
    );

    if (poolUtxos.length === 0) {
      console.log(chalk.yellow("  No UTxOs found at pool address"));
    } else {
      let totalInPool = 0;
      poolUtxos.forEach((utxo) => {
        console.log(
          chalk.cyan(
            `  UTxO: ${utxo.tx_hash.substring(0, 10)}...#${utxo.output_index}`
          )
        );
        console.log(`    Amount: ${formatAda(utxo.amount[0].quantity)}`);
        totalInPool += parseInt(utxo.amount[0].quantity, 10);
      });
      console.log(chalk.green(`  Total in Pool: ${formatAda(totalInPool)}`));
    }
  } catch (error) {
    console.error(chalk.red("Error fetching UTxO information:"), error);
  }
}

// Main function
async function main() {
  console.log(chalk.blue.bold("🚀 CARDANO UTxO DONATION DEMO 🚀"));
  console.log(chalk.gray("=============================="));

  // Show initial state
  console.log(chalk.blue.bold("\n📝 INITIAL STATE"));
  await displayUtxoInfo();

  // Create donation
  console.log(chalk.blue.bold("\n📝 DONATION PROCESS"));
  const result = await createDonation();

  if (result) {
    console.log(
      chalk.green(`\nDonation of ${formatAda(DONATION_AMOUNT)} processed!`)
    );
    console.log(`New pool value would be: ${formatAda(result.newPoolValue)}`);
    console.log(`Transaction ID: ${result.txHash}`);
  } else {
    console.log(chalk.red("\nDonation failed."));
  }

  // In a real implementation, we would wait for confirmation here
  console.log(
    chalk.yellow(
      "\nNote: In a real implementation, we would wait for transaction confirmation"
    )
  );
  console.log(chalk.yellow("      before showing the updated UTxO state."));

  console.log(chalk.green.bold("\n✅ DONATION DEMO COMPLETED"));
}

// Run the donation demo
main().catch((err) => {
  console.error(chalk.red("Donation demo failed:"), err);
});
