
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
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
  baseRate: number; 
  perKmRate: number; 
  speedLabel: string;
}

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
  googleAnalyticsId: string;
  adSenseId: string;
  metaPixelId: string;
}

export interface CommunityLinks {
  whatsapp: string;
  telegram: string;
}

export interface ThemeColors {
  primary: string;       // Buttons, Highlights
  background: string;    // Main Page Background
  card: string;          // Cards, Modals, Sidebar elements
  text: string;          // Main Text Color
  sidebar: string;       // Sidebar/Header Background
  border: string;        // Borders
}

export interface SiteConfig {
  storeName: string;
  logoUrl?: string;
  origin: OriginAddress;
  currency: 'USD' | 'INR' | 'EUR' | 'GBP';
  currencySymbol: string;
  themeMode: 'light' | 'dark' | 'festive' | 'custom'; // For UI Reference
  colors: ThemeColors;   // ACTUAL SOURCE OF TRUTH FOR STYLING
  hero: HeroConfig;
  brands: string[];
  videoAd: VideoAdConfig;
  integrations: IntegrationsConfig;
  community: CommunityLinks;
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
