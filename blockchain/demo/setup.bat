@echo off
echo Installing dependencies for Cardano UTxO Flow Demo...
npm install
echo.
echo Creating .env file...
copy .env.example .env
echo.
echo Setup complete! Please edit the .env file with your Blockfrost API key and wallet information.
echo.
echo Run the demo with: npm run demo
echo Or try individual components: npm run donate or npm run distribute
echo.
