#!/bin/bash

echo "Installing dependencies for Cardano UTxO Flow Demo..."
npm install

echo -e "\nCreating .env file..."
cp .env.example .env

echo -e "\nSetup complete! Please edit the .env file with your Blockfrost API key and wallet information."
echo -e "\nRun the demo with: npm run demo"
echo "Or try individual components: npm run donate or npm run distribute"
echo
