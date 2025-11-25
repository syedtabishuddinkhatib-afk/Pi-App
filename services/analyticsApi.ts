
import { IntegrationsConfig, SalesData } from '../types';
import { MOCK_ANALYTICS } from './mockData';

// Simulate fetching "Live" impression data from Google Analytics API
export const fetchGoogleAnalyticsData = async (config: IntegrationsConfig) => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (!config.googleAnalyticsId) {
    throw new Error("Google Analytics ID not configured");
  }

  // Simulate dynamic data based on the ID presence
  const baseImpressions = 142000;
  const randomVariance = Math.floor(Math.random() * 5000);
  
  return {
    impressions: baseImpressions + randomVariance,
    activeUsers: Math.floor(Math.random() * 150) + 20,
    bounceRate: `${(35 + Math.random() * 10).toFixed(1)}%`
  };
};

// Simulate fetching "Revenue" data from Google AdSense API
export const fetchAdSenseData = async (config: IntegrationsConfig) => {
  await new Promise(resolve => setTimeout(resolve, 2000));

  if (!config.adSenseId) {
    throw new Error("AdSense Publisher ID not configured");
  }

  // Simulate getting the last 30 days revenue
  const baseRevenue = 1240;
  const randomVariance = Math.random() * 100;

  return {
    adRevenue: baseRevenue + randomVariance,
    clicks: Math.floor(800 + Math.random() * 200),
    cpc: (0.45 + Math.random() * 0.2).toFixed(2)
  };
};

// Combine internal sales data with external Ad data for the chart
export const fetchCombinedAnalytics = async (config: IntegrationsConfig): Promise<SalesData[]> => {
    // If AdSense is connected, boost the 'ads' column in the mock data to simulate live sync
    if (config.adSenseId) {
        return MOCK_ANALYTICS.map(item => ({
            ...item,
            ads: item.ads * 1.5 + Math.floor(Math.random() * 500) // Boosted revenue
        }));
    }
    return MOCK_ANALYTICS;
};
