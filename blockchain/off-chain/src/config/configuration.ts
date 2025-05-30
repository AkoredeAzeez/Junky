export default () => ({
  port: parseInt(process.env.PORT || '3000'),
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'junky_blockchain',
  },
  blockfrost: {
    projectId: process.env.BLOCKFROST_PROJECT_ID || '',
    network: process.env.CARDANO_NETWORK || 'testnet',
  },
})
