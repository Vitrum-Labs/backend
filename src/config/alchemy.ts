import { Alchemy, Network } from 'alchemy-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Supported Networks for Multichain Analysis
export const SUPPORTED_NETWORKS = {
  ETHEREUM: {
    name: 'Ethereum',
    network: Network.ETH_MAINNET,
    chainId: 1,
  },
  POLYGON: {
    name: 'Polygon',
    network: Network.MATIC_MAINNET,
    chainId: 137,
  },
  ARBITRUM: {
    name: 'Arbitrum',
    network: Network.ARB_MAINNET,
    chainId: 42161,
  },
  OPTIMISM: {
    name: 'Optimism',
    network: Network.OPT_MAINNET,
    chainId: 10,
  },
  BASE: {
    name: 'Base',
    network: Network.BASE_MAINNET,
    chainId: 8453,
  },
  POLYGON_ZKEVM: {
    name: 'Polygon zkEVM',
    network: Network.POLYGONZKEVM_MAINNET,
    chainId: 1101,
  },
};

// Initialize Alchemy clients for each network
export const alchemyClients: Map<string, Alchemy> = new Map();

// Initialize all Alchemy clients
export function initializeAlchemyClients() {
  const apiKey = process.env.ALCHEMY_API_KEY;

  if (!apiKey) {
    throw new Error('ALCHEMY_API_KEY is not set in environment variables');
  }

  Object.entries(SUPPORTED_NETWORKS).forEach(([key, config]) => {
    const client = new Alchemy({
      apiKey,
      network: config.network,
    });
    alchemyClients.set(key, client);
  });

  console.log(`Initialized ${alchemyClients.size} Alchemy clients for multichain support`);
}

// Get Alchemy client for specific network
export function getAlchemyClient(networkKey: string): Alchemy {
  const client = alchemyClients.get(networkKey);
  if (!client) {
    throw new Error(`Alchemy client not found for network: ${networkKey}`);
  }
  return client;
}

// Validate configuration
export function validateConfig() {
  if (!process.env.ALCHEMY_API_KEY) {
    throw new Error('ALCHEMY_API_KEY is not set in environment variables');
  }
}
