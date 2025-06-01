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
const DISTRIBUTION_PERCENTAGE = parseFloat(process.env.DISTRIBUTION_PERCENTAGE);
const TOP_N = parseInt(process.env.TOP_N, 10);

// Mock hospital addresses (in reality these would come from your database)
const hospitalAddresses = [
  "addr_test1qp9mj0zwva7c2s8qcnpxkk5dnavft4jwz8xseq0ufzm74qg50ngw60xhcdwhuvqkasjz7md5mwmkwuj64hx982x4a5vql4c3tu",
  "addr_test1qrw75dr8nz5hzax2szh5e5jwhtrg2w40m987vgstt8r9nuq4cp36wndwt9xynm3urpt676pvnccj5huen5p9v4c98esrjr4yd",
  "addr_test1qzhs3ntzf4nektywgoxvwa9adv7yc6qz02v5h95s0c63fmgays6y4upy34kge6c76jd6tq8e9wg4dstk2twpsyuf4l2srqh5gx",
];

// Mock triage scores (in reality these would be from your AI models)
const triageScores = [0.85, 0.72, 0.91];

// Format ADA amounts from lovelace
function formatAda(lovelaceAmount) {
  return (lovelaceAmount / 1000000).toFixed(6) + " ₳";
}

/**
 * Create a distribution transaction using Cardano Serialization Lib
 */
async function createDistribution() {
  console.log(chalk.blue.bold("\n⚖️ CREATING DISTRIBUTION TRANSACTION\n"));

  try {
    // 1. Get pool UTxOs
    console.log("Fetching pool UTXOs...");
    const poolUtxos = await api.addressesUtxos(SCRIPT_ADDRESS);

    if (poolUtxos.length === 0) {
      throw new Error("No UTXOs found in pool");
    }

    // 2. Calculate current pool value
    let totalPoolValue = 0;
    poolUtxos.forEach((utxo) => {
      totalPoolValue += parseInt(utxo.amount[0].quantity, 10);
    });

    console.log(`Current pool value: ${formatAda(totalPoolValue)}`);

    // 3. Calculate distribution amount
    const distributionAmount = Math.floor(
      totalPoolValue * DISTRIBUTION_PERCENTAGE
    );
    console.log(`Amount to distribute: ${formatAda(distributionAmount)}`);

    // 4. Get top N hospitals by triage score
    const sortedHospitals = hospitalAddresses
      .map((addr, i) => ({ addr, score: triageScores[i] }))
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_N);

    console.log(chalk.yellow(`Top ${TOP_N} hospitals by triage score:`));

    // Calculate distribution for each hospital
    const distributions = [];
    let totalDistributed = 0;

    const totalScoreWeight = sortedHospitals.reduce(
      (sum, h) => sum + h.score,
      0
    );

    sortedHospitals.forEach((hospital, i) => {
      // Calculate distribution amount (weighted by score)
      const weight = hospital.score / totalScoreWeight;
      const hospitalAmount = Math.floor(distributionAmount * weight);

      console.log(`  ${i + 1}. Address: ${hospital.addr.substring(0, 20)}...`);
      console.log(
        `     Score: ${hospital.score.toFixed(2)}, Weight: ${(
          weight * 100
        ).toFixed(1)}%`
      );
      console.log(`     Receiving: ${formatAda(hospitalAmount)}`);

      distributions.push({
        address: hospital.addr,
        amount: hospitalAmount,
      });

      totalDistributed += hospitalAmount;
    });

    // 5. Calculate remainder to stay in pool
    const remainder = totalPoolValue - totalDistributed;
    console.log(`\nRemaining in pool: ${formatAda(remainder)}`);

    // 6. Update pool datum
    const poolDatum = {
      poolId: "pool1",
      totalAda: remainder,
      lastDistribution: Math.floor(Date.now() / 1000),
      hyperparams: {
        percent: DISTRIBUTION_PERCENTAGE,
        interval: 10,
        topN: TOP_N,
      },
    };

    // In a real implementation, you'd now:

    // 7. Build the transaction using cardano-serialization-lib
    // 8. Add inputs (pool UTxO)
    // 9. Add outputs for each hospital
    // 10. Add output back to pool with updated datum
    // 11. Calculate fee and adjust if needed
    // 12. Build final transaction
    // 13. Sign transaction with appropriate keys
    // 14. Submit transaction

    console.log(
      chalk.yellow("\nIn a real implementation, the transaction would now be:")
    );
    console.log("  1. Built with the pool UTxO as input");
    console.log("  2. Create outputs to each hospital recipient");
    console.log("  3. Create output back to the pool with updated datum");
    console.log("  4. Signed with the script's spending credential");
    console.log("  5. Submitted to the network");

    // Mock a transaction hash
    const txHash = "mock_tx_" + Math.random().toString(36).substring(2, 15);
    console.log(
      chalk.green(`\nTransaction would be submitted with hash: ${txHash}`)
    );

    return {
      txHash,
      distributed: totalDistributed,
      newPoolValue: remainder,
      recipients: distributions,
    };
  } catch (error) {
    console.error(chalk.red("Error creating distribution:"), error);
    return null;
  }
}

/**
 * Display UTxO information
 */
async function displayUtxoInfo() {
  console.log(chalk.blue.bold("\n📊 CURRENT UTxO STATE\n"));

  try {
    // Get pool UTxOs
    const poolUtxos = await api.addressesUtxos(SCRIPT_ADDRESS);
    console.log(
      chalk.green(`Pool Script (${SCRIPT_ADDRESS.substring(0, 20)}...) UTxOs:`)
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

    // Get hospital UTxOs (just the first one for example)
    if (hospitalAddresses.length > 0) {
      const hospitalAddr = hospitalAddresses[0];
      const hospitalUtxos = await api.addressesUtxos(hospitalAddr);
      console.log(
        chalk.green(`\nHospital (${hospitalAddr.substring(0, 20)}...) UTxOs:`)
      );

      if (hospitalUtxos.length === 0) {
        console.log(chalk.yellow("  No UTxOs found at hospital address"));
      } else {
        let totalInHospital = 0;
        hospitalUtxos.slice(0, 3).forEach((utxo) => {
          console.log(
            chalk.cyan(
              `  UTxO: ${utxo.tx_hash.substring(0, 10)}...#${utxo.output_index}`
            )
          );
          console.log(`    Amount: ${formatAda(utxo.amount[0].quantity)}`);
          totalInHospital += parseInt(utxo.amount[0].quantity, 10);
        });

        if (hospitalUtxos.length > 3) {
          console.log(`  ... and ${hospitalUtxos.length - 3} more UTxOs`);
        }

        console.log(
          chalk.green(
            `  Total in Hospital wallet: ${formatAda(totalInHospital)}`
          )
        );
      }
    }
  } catch (error) {
    console.error(chalk.red("Error fetching UTxO information:"), error);
  }
}

// Main function
async function main() {
  console.log(chalk.blue.bold("🚀 CARDANO UTxO DISTRIBUTION DEMO 🚀"));
  console.log(chalk.gray("=================================="));

  // Show initial state
  console.log(chalk.blue.bold("\n📝 INITIAL STATE"));
  await displayUtxoInfo();

  // Create distribution
  console.log(chalk.blue.bold("\n📝 DISTRIBUTION PROCESS"));
  const result = await createDistribution();

  if (result) {
    console.log(
      chalk.green(
        `\nDistribution of ${formatAda(result.distributed)} processed!`
      )
    );
    console.log(`New pool value would be: ${formatAda(result.newPoolValue)}`);
    console.log(`Transaction ID: ${result.txHash}`);

    console.log(chalk.cyan("\nDetail of distribution:"));
    result.recipients.forEach((recipient, i) => {
      console.log(`  Hospital ${i + 1}: ${formatAda(recipient.amount)}`);
    });
  } else {
    console.log(chalk.red("\nDistribution failed."));
  }

  // In a real implementation, we would wait for confirmation here
  console.log(
    chalk.yellow(
      "\nNote: In a real implementation, we would wait for transaction confirmation"
    )
  );
  console.log(chalk.yellow("      before showing the updated UTxO state."));

  console.log(chalk.green.bold("\n✅ DISTRIBUTION DEMO COMPLETED"));
}

// Run the distribution demo
main().catch((err) => {
  console.error(chalk.red("Distribution demo failed:"), err);
});
