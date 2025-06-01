# Cardano UTxO Flow Demo

This demo showcases the UTxO-based donation pooling and distribution flow using the Cardano testnet.

## Prerequisites

1. Node.js 18+ installed
2. Blockfrost API key for Cardano testnet (preprod)
3. A funded testnet wallet

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file and update with your values:

```bash
cp .env.example .env
```

3. Add your Cardano testnet wallet keys to the directory:

```
payment.skey  # Your signing key
payment.vkey  # Your verification key (optional)
```

## Running the Demo

The demo contains three main scripts:

### 1. Full Demo

```bash
npm run demo
```

This runs the complete flow:

1. Display current UTxOs
2. Create a donation transaction
3. Show updated UTxOs
4. Create a distribution transaction
5. Show final UTxOs

### 2. Individual Components

Donation only:

```bash
npm run donate
```

Distribution only:

```bash
npm run distribute
```

## UTxO Flow Explanation

1. **Initial State**:

   - Pool UTxO contains donation pool datum with total ADA and metadata
   - Your wallet contains ADA for donation

2. **Donation Flow**:

   - Read the current pool UTxO datum
   - Create transaction that updates the pool datum with new total + your donation
   - Submit transaction

3. **Distribution Flow**:
   - Read the current pool UTxO datum
   - Calculate how much to distribute (percentage × total)
   - Create outputs to top-N recipients
   - Create output back to pool script with updated datum
   - Submit transaction
