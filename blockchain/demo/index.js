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

// Main donation pool script address
const SCRIPT_ADDRESS = process.env.SCRIPT_ADDRESS;
const PAYMENT_ADDR = process.env.PAYMENT_ADDR;
const PAYMENT_SKEY_PATH = process.env.PAYMENT_SKEY_PATH;
const DONATION_AMOUNT = parseInt(process.env.DONATION_AMOUNT, 10);
const DISTRIBUTION_PERCENTAGE = parseFloat(process.env.DISTRIBUTION_PERCENTAGE);
const TOP_N = parseInt(process.env.TOP_N, 10);

// Mock hospital addresses (in reality these would come from your database)
const hospitalAddresses = [
  "addr_test1qp9mj0zwva7c2s8qcnpxkk5dnavft4jwz8xseq0ufzm74qg50ngw60xhcdwhuvqkasjz7md5mwmkwuj64hx982x4a5vql4c3tu",
  "addr_test1qrw75dr8nz5hzax2szh5e5jwhtrg2w40m987vgstt8r9nuq4cp36wndwt9xynm3urpt676pvnccj5huen5p9v4c98esrjr4yd",
  "addr_test1qzhs3ntzf4nektywgoxvwa9adv7yc6qz02v5h95s0c63fmgays6y4upy34kge6c76jd6tq8e9wg4dstk2twpsyuf4l2srqh5gx",
];

// Mock triage scores (in reality these would be calculated from AI models)
const triageScores = [0.85, 0.72, 0.91];

/**
 * Format ADA amounts from lovelace
 */
function formatAda(lovelaceAmount) {
  return (lovelaceAmount / 1000000).toFixed(6) + " ₳";
}

/**
 * Display UTxO information
 */
async function displayUtxoInfo() {
  console.log(chalk.blue.bold("\n📊 CURRENT UTxO STATE\n"));

  try {
    // Get pool UTxO
    const poolUtxos = await api.addressesUtxos(SCRIPT_ADDRESS);
    console.log(chalk.green(`Pool Script Address (${SCRIPT_ADDRESS}) UTxOs:`));

    if (poolUtxos.length === 0) {
      console.log(chalk.yellow("  No UTxOs found at pool address"));
    } else {
      let totalInPool = 0;
      poolUtxos.forEach((utxo) => {
        console.log(chalk.cyan(`  UTxO: ${utxo.tx_hash}#${utxo.output_index}`));
        console.log(`    Amount: ${formatAda(utxo.amount[0].quantity)}`);
        totalInPool += parseInt(utxo.amount[0].quantity, 10);

        if (utxo.data_hash) {
          console.log(`    Datum Hash: ${utxo.data_hash}`);
        }
      });
      console.log(chalk.green(`  Total in Pool: ${formatAda(totalInPool)}`));
    }

    // Get donor wallet UTxOs
    const walletUtxos = await api.addressesUtxos(PAYMENT_ADDR);
    console.log(chalk.green(`\nDonor Wallet (${PAYMENT_ADDR}) UTxOs:`));

    if (walletUtxos.length === 0) {
      console.log(chalk.yellow("  No UTxOs found in wallet"));
    } else {
      let totalInWallet = 0;
      walletUtxos.forEach((utxo) => {
        console.log(chalk.cyan(`  UTxO: ${utxo.tx_hash}#${utxo.output_index}`));
        console.log(`    Amount: ${formatAda(utxo.amount[0].quantity)}`);
        totalInWallet += parseInt(utxo.amount[0].quantity, 10);
      });
      console.log(
        chalk.green(`  Total in Wallet: ${formatAda(totalInWallet)}`)
      );
    }
  } catch (error) {
    console.error(chalk.red("Error fetching UTxO information:"), error);
  }
}

/**
 * Mock donation transaction (in a real system this would use cardano-serialization-lib)
 */
async function createDonation() {
  console.log(chalk.blue.bold("\n💰 CREATING DONATION TRANSACTION\n"));

  try {
    console.log(
      chalk.green(
        `Creating donation of ${formatAda(DONATION_AMOUNT)} to the pool`
      )
    );

    // In a real implementation, you would:
    // 1. Build a transaction using cardano-serialization-lib
    // 2. Read the current pool datum
    // 3. Create a new datum with updated total
    // 4. Create transaction inputs and outputs
    // 5. Sign the transaction with donor's key
    // 6. Submit to the network

    console.log(chalk.yellow("Transaction building (mock):"));
    console.log("  1. Reading current pool UTxO");
    console.log("  2. Creating new datum with updated total");
    console.log("  3. Adding payment inputs and outputs");
    console.log("  4. Signing transaction");

    // Mock a transaction hash
    const txHash = "mock_tx_" + Math.random().toString(36).substring(2, 15);
    console.log(chalk.green(`Transaction submitted with hash: ${txHash}`));

    return txHash;
  } catch (error) {
    console.error(chalk.red("Error creating donation:"), error);
    return null;
  }
}

/**
 * Mock distribution transaction
 */
async function createDistribution() {
  console.log(chalk.blue.bold("\n⚖️ CREATING DISTRIBUTION TRANSACTION\n"));

  try {
    // Simulate getting current pool value
    const poolUtxos = await api.addressesUtxos(SCRIPT_ADDRESS);
    let totalInPool = 0;
    poolUtxos.forEach((utxo) => {
      totalInPool += parseInt(utxo.amount[0].quantity, 10);
    });

    const distributionAmount = Math.floor(
      totalInPool * DISTRIBUTION_PERCENTAGE
    );
    console.log(
      chalk.green(
        `Creating distribution of ${formatAda(
          distributionAmount
        )} from the pool`
      )
    );

    // Get top N hospitals by triage score
    const sortedHospitals = hospitalAddresses
      .map((addr, i) => ({ addr, score: triageScores[i] }))
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_N);

    console.log(chalk.yellow(`Top ${TOP_N} hospitals by triage score:`));
    sortedHospitals.forEach((hospital, i) => {
      console.log(
        `  ${i + 1}. Address: ${hospital.addr.substring(0, 20)}... Score: ${
          hospital.score
        }`
      );

      // Calculate distribution amount (weighted by score)
      const weight =
        hospital.score / sortedHospitals.reduce((sum, h) => sum + h.score, 0);
      const hospitalAmount = Math.floor(distributionAmount * weight);
      console.log(`     Receiving: ${formatAda(hospitalAmount)}`);
    });

    // Mock a transaction hash
    const txHash = "mock_tx_" + Math.random().toString(36).substring(2, 15);
    console.log(
      chalk.green(`Distribution transaction submitted with hash: ${txHash}`)
    );

    return txHash;
  } catch (error) {
    console.error(chalk.red("Error creating distribution:"), error);
    return null;
  }
}

/**
 * Run the complete demo
 */
async function runDemo() {
  console.log(chalk.blue.bold("🚀 CARDANO UTxO DONATION POOL DEMO 🚀"));
  console.log(chalk.gray("======================================"));

  // Initial state
  console.log(chalk.blue.bold("\n📝 INITIAL STATE"));
  await displayUtxoInfo();

  // Step 1: Create a donation
  console.log(chalk.blue.bold("\n📝 STEP 1: DONATION"));
  const donateTx = await createDonation();

  // Wait for "confirmation" (mock)
  console.log(chalk.yellow("\nWaiting for transaction confirmation..."));
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Show state after donation
  console.log(chalk.blue.bold("\n📝 DONATION CONFIRMED"));
  await displayUtxoInfo();

  // Step 2: Create a distribution
  console.log(chalk.blue.bold("\n📝 STEP 2: DISTRIBUTION"));
  const distributeTx = await createDistribution();

  // Wait for "confirmation" (mock)
  console.log(chalk.yellow("\nWaiting for transaction confirmation..."));
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Show final state
  console.log(chalk.blue.bold("\n📝 DISTRIBUTION CONFIRMED"));
  await displayUtxoInfo();

  console.log(chalk.green.bold("\n✅ DEMO COMPLETED SUCCESSFULLY"));
}

// Run the demo
runDemo().catch((err) => {
  console.error(chalk.red("Demo failed:"), err);
});
