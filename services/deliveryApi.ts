
import { Address, DeliveryOption, DeliveryProviderConfig } from '../types';

// Simulate calling external APIs like FedEx, DHL, or Local Post
export const fetchDeliveryRates = async (
  address: Address, 
  activeProviders: DeliveryProviderConfig[]
): Promise<DeliveryOption[]> => {
  
  // Simulate Network Latency
  await new Promise(resolve => setTimeout(resolve, 1500));

  const rates: DeliveryOption[] = [];
  const zipFactor = parseInt(address.zipCode.replace(/\D/g, '').substring(0, 3)) || 100;
  
  // Logic: Calculate simulated shipping cost based on "distance" (zip code) and provider base rates
  activeProviders.forEach(provider => {
    // Random variance to simulate dynamic API pricing
    const dynamicVariance = Math.floor(Math.random() * 5); 
    const distanceCost = (zipFactor % 20) * provider.perKmRate;
    const finalPrice = provider.baseRate + distanceCost + dynamicVariance;

    let duration = provider.speedLabel;
    
    // Adjust duration based on distance simulation
    if (distanceCost > 10 && provider.id !== 'drone') {
        duration = duration.replace('1-2', '2-3').replace('3-5', '5-7');
    }

    rates.push({
      id: `${provider.id}-${Date.now()}`,
      providerId: provider.id,
      name: provider.name,
      provider: provider.name,
      price: parseFloat(finalPrice.toFixed(2)),
      duration: duration
    });
  });

  return rates.sort((a, b) => a.price - b.price);
};
