/**
 * Helper functions for the Cardano UTxO demonstration
 */

const fs = require("fs");
const path = require("path");

/**
 * Read a signing key from file
 * @param {string} filePath Path to the signing key file
 * @returns The parsed signing key content
 */
function readSigningKey(filePath) {
  try {
    const skeyContent = fs.readFileSync(filePath, "utf8");
    return JSON.parse(skeyContent);
  } catch (error) {
    console.error(`Error reading signing key from ${filePath}:`, error);
    throw error;
  }
}

/**
 * Create a datum object for the donation pool
 * @param {string} poolId Unique ID of the pool
 * @param {number} totalAda Total ADA in the pool (in lovelace)
 * @param {number} lastDistribution Timestamp of last distribution
 * @param {object} hyperparams Distribution hyperparameters
 * @returns {object} The datum object
 */
function createPoolDatum(poolId, totalAda, lastDistribution, hyperparams = {}) {
  return {
    poolId,
    totalAda,
    lastDistribution: lastDistribution || Math.floor(Date.now() / 1000),
    hyperparams: {
      percent: hyperparams.percent || 0.2, // 20% per distribution
      interval: hyperparams.interval || 10, // days between distributions
      topN: hyperparams.topN || 5, // number of recipients
    },
  };
}

/**
 * Calculate distribution amounts based on triage scores
 * @param {number} totalAmount Total amount to distribute
 * @param {Array<{addr: string, score: number}>} recipients Recipients with triage scores
 * @returns {Array<{addr: string, score: number, amount: number}>} Recipients with distribution amounts
 */
function calculateDistribution(totalAmount, recipients) {
  // Calculate total score weight
  const totalWeight = recipients.reduce((sum, r) => sum + r.score, 0);

  // Calculate proportional amounts
  const result = recipients.map((r) => ({
    addr: r.addr,
    score: r.score,
    amount: Math.floor(totalAmount * (r.score / totalWeight)),
  }));

  // Adjust for rounding errors to ensure total is correct
  const distributedTotal = result.reduce((sum, r) => sum + r.amount, 0);
  const difference = totalAmount - distributedTotal;

  if (difference !== 0 && result.length > 0) {
    result[0].amount += difference;
  }

  return result;
}

module.exports = {
  readSigningKey,
  createPoolDatum,
  calculateDistribution,
};
