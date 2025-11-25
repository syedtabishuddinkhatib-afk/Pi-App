
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string; // Changed from enum to string for dynamic categories
  description: string;
  image: string;
  rating: number;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface SalesData {
  name: string;
  revenue: number;
  ads: number;
  referral: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Address {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface OriginAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface DeliveryOption {
  id: string;
  name: string;
  price: number;
  duration: string;
  provider: string;
  providerId: string;
}

export interface DeliveryProviderConfig {
  id: string;
  name: string;
  enabled: boolean;
  baseRate: number; // Base cost for simulation
  perKmRate: number; // Multiplier for simulation
  speedLabel: string;
}

// --- NEW CONFIGURATION TYPES ---

export interface HeroConfig {
  title: string;
  subtitle: string;
  buttonText: string;
  gradient: 'indigo' | 'purple' | 'orange' | 'emerald' | 'rose';
}

export interface VideoAdConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  imageUrl: string;
}

export interface IntegrationsConfig {
  googleAnalyticsId: string; // e.g., G-XXXXXXXX
  adSenseId: string; // e.g., pub-XXXXXXXX
  metaPixelId: string; // e.g., 1234567890
}

export interface CommunityLinks {
  whatsapp: string;
  telegram: string;
}

export type Theme = 'light' | 'dark' | 'festive' | 'seasonal';

export interface SiteConfig {
  storeName: string;
  logoUrl?: string;
  origin: OriginAddress; // NEW: For shipping calculations
  currency: 'USD' | 'INR' | 'EUR' | 'GBP';
  currencySymbol: string;
  theme: Theme;
  hero: HeroConfig;
  brands: string[];
  videoAd: VideoAdConfig;
  integrations: IntegrationsConfig;
  community: CommunityLinks; // NEW: For WhatsApp/Telegram
}

export interface PaymentGateway {
  id: string;
  name: string;
  enabled: boolean;
  apiKey?: string;
  type: 'wallet' | 'card' | 'upi' | 'netbanking';
}

export interface PaymentSettings {
  gateways: PaymentGateway[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'facebook' | 'email';
  savedAddress?: Address;
}
