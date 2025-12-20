import { ethers } from 'ethers';
import { AssetTransfersCategory, SortingOrder } from 'alchemy-sdk';
import {
  SUPPORTED_NETWORKS,
  getAlchemyClient,
  alchemyClients,
} from '../config/alchemy';
import { cache, CacheKeys } from '../utils/cache';

export interface NetworkActivity {
  network: string;
  chainId: number;
  transactionCount: number;
  firstTransaction: number | null;
  lastTransaction: number | null;
  error?: string;
}

export interface WalletAnalysis {
  walletAddress: string;
  walletAge: number; // in days
  firstTransactionTimestamp: number | null;
  totalTransactions: number;
  activeNetworks: number;
  networkActivities: NetworkActivity[];
  analyzedAt: number;
}

export class WalletAnalysisService {
  /**
   * Get transaction count for a wallet on a specific network
   */
  private async getNetworkActivity(
    walletAddress: string,
    networkKey: string
  ): Promise<NetworkActivity> {
    const cacheKey = CacheKeys.networkTx(walletAddress, networkKey);
    const cached = cache.get<NetworkActivity>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const client = getAlchemyClient(networkKey);
      const networkConfig = SUPPORTED_NETWORKS[networkKey as keyof typeof SUPPORTED_NETWORKS];

      // Get transaction count
      const txCount = await client.core.getTransactionCount(walletAddress);

      let firstTxTimestamp: number | null = null;
      let lastTxTimestamp: number | null = null;

      // Get first and last transaction timestamps if wallet has transactions
      if (txCount > 0) {
        try {
          // 'internal' category only supported on ETH and MATIC (Polygon)
          const supportsInternal = networkKey === 'ETHEREUM' || networkKey === 'POLYGON';
          const categories = supportsInternal
            ? [
                AssetTransfersCategory.EXTERNAL,
                AssetTransfersCategory.INTERNAL,
                AssetTransfersCategory.ERC20,
                AssetTransfersCategory.ERC721,
                AssetTransfersCategory.ERC1155,
              ]
            : [
                AssetTransfersCategory.EXTERNAL,
                AssetTransfersCategory.ERC20,
                AssetTransfersCategory.ERC721,
                AssetTransfersCategory.ERC1155,
              ];

          // Get BOTH incoming (toAddress) and outgoing (fromAddress) transfers
          // to find the actual first transaction
          const [outgoingTransfers, incomingTransfers] = await Promise.all([
            client.core.getAssetTransfers({
              fromAddress: walletAddress,
              category: categories,
              maxCount: 1,
              order: SortingOrder.ASCENDING,
            }),
            client.core.getAssetTransfers({
              toAddress: walletAddress,
              category: categories,
              maxCount: 1,
              order: SortingOrder.ASCENDING,
            }),
          ]);

          // Find the oldest transaction from both incoming and outgoing
          const candidates = [];
          if (outgoingTransfers.transfers.length > 0) {
            candidates.push({
              blockNum: outgoingTransfers.transfers[0].blockNum,
              hash: outgoingTransfers.transfers[0].hash,
            });
          }
          if (incomingTransfers.transfers.length > 0) {
            candidates.push({
              blockNum: incomingTransfers.transfers[0].blockNum,
              hash: incomingTransfers.transfers[0].hash,
            });
          }

          if (candidates.length > 0) {
            // Get the oldest block (earliest transaction)
            const oldestBlock = candidates.sort((a, b) =>
              parseInt(a.blockNum, 16) - parseInt(b.blockNum, 16)
            )[0].blockNum;

            const firstBlockData = await client.core.getBlock(oldestBlock);
            firstTxTimestamp = firstBlockData.timestamp;
          }

          // Get last transaction (check both incoming and outgoing)
          const [latestOutgoing, latestIncoming] = await Promise.all([
            client.core.getAssetTransfers({
              fromAddress: walletAddress,
              category: categories,
              maxCount: 1,
              order: SortingOrder.DESCENDING,
            }),
            client.core.getAssetTransfers({
              toAddress: walletAddress,
              category: categories,
              maxCount: 1,
              order: SortingOrder.DESCENDING,
            }),
          ]);

          const latestCandidates = [];
          if (latestOutgoing.transfers.length > 0) {
            latestCandidates.push({
              blockNum: latestOutgoing.transfers[0].blockNum,
              hash: latestOutgoing.transfers[0].hash,
            });
          }
          if (latestIncoming.transfers.length > 0) {
            latestCandidates.push({
              blockNum: latestIncoming.transfers[0].blockNum,
              hash: latestIncoming.transfers[0].hash,
            });
          }

          if (latestCandidates.length > 0) {
            // Get the newest block (latest transaction)
            const newestBlock = latestCandidates.sort((a, b) =>
              parseInt(b.blockNum, 16) - parseInt(a.blockNum, 16)
            )[0].blockNum;

            const lastBlockData = await client.core.getBlock(newestBlock);
            lastTxTimestamp = lastBlockData.timestamp;
          }
        } catch (error) {
          console.warn(`Failed to get transaction timestamps for ${networkKey}:`, error);
        }
      }

      const activity: NetworkActivity = {
        network: networkConfig.name,
        chainId: networkConfig.chainId,
        transactionCount: txCount,
        firstTransaction: firstTxTimestamp,
        lastTransaction: lastTxTimestamp,
      };

      // Cache for 5 minutes
      cache.set(cacheKey, activity, 5 * 60 * 1000);

      return activity;
    } catch (error: any) {
      console.error(`Error getting activity for ${networkKey}:`, error.message);
      const networkConfig = SUPPORTED_NETWORKS[networkKey as keyof typeof SUPPORTED_NETWORKS];
      return {
        network: networkConfig.name,
        chainId: networkConfig.chainId,
        transactionCount: 0,
        firstTransaction: null,
        lastTransaction: null,
        error: error.message,
      };
    }
  }

  /**
   * Analyze wallet across all supported networks
   */
  async analyzeWallet(walletAddress: string): Promise<WalletAnalysis> {
    // Validate wallet address
    if (!ethers.isAddress(walletAddress)) {
      throw new Error('Invalid wallet address');
    }

    // Check cache first
    const cacheKey = CacheKeys.walletAnalysis(walletAddress);
    const cached = cache.get<WalletAnalysis>(cacheKey);

    if (cached) {
      return cached;
    }

    // Analyze all networks in parallel
    const networkKeys = Object.keys(SUPPORTED_NETWORKS);
    const activities = await Promise.all(
      networkKeys.map((key) => this.getNetworkActivity(walletAddress, key))
    );

    // Calculate total transactions
    const totalTransactions = activities.reduce(
      (sum, activity) => sum + activity.transactionCount,
      0
    );

    // Find earliest transaction timestamp across all networks
    const firstTransactionTimestamp = activities
      .filter((a) => a.firstTransaction !== null)
      .map((a) => a.firstTransaction!)
      .sort((a, b) => a - b)[0] || null;

    // Calculate wallet age in days
    const walletAge = firstTransactionTimestamp
      ? Math.floor((Date.now() / 1000 - firstTransactionTimestamp) / (24 * 60 * 60))
      : 0;

    // Count active networks (networks with at least 1 transaction)
    const activeNetworks = activities.filter((a) => a.transactionCount > 0).length;

    const analysis: WalletAnalysis = {
      walletAddress,
      walletAge,
      firstTransactionTimestamp,
      totalTransactions,
      activeNetworks,
      networkActivities: activities,
      analyzedAt: Date.now(),
    };

    // Cache for 5 minutes
    cache.set(cacheKey, analysis, 5 * 60 * 1000);

    return analysis;
  }

  /**
   * Get quick stats for a wallet (faster, less detailed)
   */
  async getQuickStats(walletAddress: string) {
    if (!ethers.isAddress(walletAddress)) {
      throw new Error('Invalid wallet address');
    }

    // Only check main networks for quick stats
    const mainNetworks = ['ETHEREUM', 'ARBITRUM', 'POLYGON', 'OPTIMISM', 'BASE'];

    const activities = await Promise.all(
      mainNetworks.map((key) => this.getNetworkActivity(walletAddress, key))
    );

    const totalTransactions = activities.reduce(
      (sum, activity) => sum + activity.transactionCount,
      0
    );

    const firstTransactionTimestamp = activities
      .filter((a) => a.firstTransaction !== null)
      .map((a) => a.firstTransaction!)
      .sort((a, b) => a - b)[0] || null;

    const walletAge = firstTransactionTimestamp
      ? Math.floor((Date.now() / 1000 - firstTransactionTimestamp) / (24 * 60 * 60))
      : 0;

    return {
      walletAddress,
      walletAge,
      totalTransactions,
      activeNetworks: activities.filter((a) => a.transactionCount > 0).length,
    };
  }
}

export const walletAnalysisService = new WalletAnalysisService();
