
import { Product, SalesData, DeliveryOption } from '../types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'UltraWidget Pro X',
    price: 299.99,
    category: 'Electronics',
    description: 'The latest in widget technology with AI capabilities.',
    image: 'https://picsum.photos/400/400?random=1',
    rating: 4.8,
    stock: 15
  },
  {
    id: '2',
    name: 'Eco-Cotton Hoodie',
    price: 49.50,
    category: 'Fashion',
    description: 'Sustainable fashion for the modern minimalist.',
    image: 'https://picsum.photos/400/400?random=2',
    rating: 4.5,
    stock: 100
  },
  {
    id: '3',
    name: 'Smart Home Hub',
    price: 129.00,
    category: 'Gadgets',
    description: 'Control your entire home from a Raspberry Pi.',
    image: 'https://picsum.photos/400/400?random=3',
    rating: 4.2,
    stock: 45
  },
  {
    id: '4',
    name: 'Ceramic Vase Set',
    price: 85.00,
    category: 'Home & Living',
    description: 'Handcrafted ceramic vases for elegant interiors.',
    image: 'https://picsum.photos/400/400?random=4',
    rating: 4.9,
    stock: 8
  },
  {
    id: '5',
    name: 'Noise Cancel Headphones',
    price: 199.99,
    category: 'Electronics',
    description: 'Immersive sound experience with 40h battery.',
    image: 'https://picsum.photos/400/400?random=5',
    rating: 4.6,
    stock: 22
  },
  {
    id: '6',
    name: 'Smart Watch Series 5',
    price: 249.00,
    category: 'Gadgets',
    description: 'Track your health and notifications on the go.',
    image: 'https://picsum.photos/400/400?random=6',
    rating: 4.7,
    stock: 30
  }
];

export const MOCK_ANALYTICS: SalesData[] = [
  { name: 'Jan', revenue: 4000, ads: 2400, referral: 2400 },
  { name: 'Feb', revenue: 3000, ads: 1398, referral: 2210 },
  { name: 'Mar', revenue: 2000, ads: 9800, referral: 2290 },
  { name: 'Apr', revenue: 2780, ads: 3908, referral: 2000 },
  { name: 'May', revenue: 1890, ads: 4800, referral: 2181 },
  { name: 'Jun', revenue: 2390, ads: 3800, referral: 2500 },
  { name: 'Jul', revenue: 3490, ads: 4300, referral: 2100 },
];

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  { id: '1', name: 'PiPost Standard', price: 0, duration: '5-7 Business Days', provider: 'Local Post', providerId: 'local_post' },
  { id: '2', name: 'FastTrack Express', price: 12.50, duration: '2-3 Business Days', provider: 'FedEx Integration', providerId: 'express_courier' },
  { id: '3', name: 'AeroDrone Instant', price: 29.99, duration: '2 Hours', provider: 'Drone API', providerId: 'drone' },
];
