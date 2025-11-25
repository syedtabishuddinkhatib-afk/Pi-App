
import { Address, DeliveryOption, DeliveryProviderConfig, OriginAddress } from '../types';

// Simulate calling external APIs like FedEx, DHL, or Local Post
// Now takes ORIGIN into account for distance calculation
export const fetchDeliveryRates = async (
  destination: Address, 
  origin: OriginAddress,
  activeProviders: DeliveryProviderConfig[]
): Promise<DeliveryOption[]> => {
  
  // Simulate Network Latency
  await new Promise(resolve => setTimeout(resolve, 1500));

  const rates: DeliveryOption[] = [];
  
  // LOGIC: Calculate "Zone" based on Zip Code difference
  // This simulates distance. 
  // Small diff = Local, Medium diff = Regional, Large diff = National
  
  const originZip = parseInt(origin.zipCode.replace(/\D/g, '')) || 10000;
  const destZip = parseInt(destination.zipCode.replace(/\D/g, '')) || 20000;
  
  const distanceMetric = Math.abs(originZip - destZip);
  
  // 0-1000: Local (Multiplier 1x)
  // 1000-5000: Regional (Multiplier 2x)
  // 5000+: National/International (Multiplier 4x)
  
  let distanceMultiplier = 1;
  let zoneLabel = "Local";

  if (distanceMetric > 5000) {
      distanceMultiplier = 4;
      zoneLabel = "National";
  } else if (distanceMetric > 1000) {
      distanceMultiplier = 2;
      zoneLabel = "Regional";
  }

  activeProviders.forEach(provider => {
    // Basic Algo: Base Rate + (PerKm * Multiplier)
    const variableCost = (provider.perKmRate * 10) * distanceMultiplier; // assuming 10 'units' per zone multiplier
    const finalPrice = provider.baseRate + variableCost;

    let duration = provider.speedLabel;

    // Adjust duration for distance
    if (zoneLabel === 'National' && provider.id !== 'drone') {
        duration = `+2 Days (${duration})`;
    }

    // Drone can only do Local
    if (provider.id === 'drone' && zoneLabel !== 'Local') {
        return; // Drone not available for long distance
    }

    rates.push({
      id: `${provider.id}-${Date.now()}`,
      providerId: provider.id,
      name: `${provider.name} (${zoneLabel})`,
      provider: provider.name,
      price: parseFloat(finalPrice.toFixed(2)),
      duration: duration
    });
  });

  return rates.sort((a, b) => a.price - b.price);
};
