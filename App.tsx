
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { ProductCard } from './components/ProductCard';
import Dashboard from './components/Dashboard';
import PaymentModal from './components/PaymentModal';
import AiChat from './components/AiChat';
import { AdminPanel } from './components/AdminPanel';
import { fetchDeliveryRates } from './services/deliveryApi';
import { MOCK_PRODUCTS } from './services/mockData';
import { Product, CartItem, DeliveryOption, SiteConfig, PaymentSettings, User, Address, DeliveryProviderConfig } from './types';
import { ShoppingCart, Trash2, ArrowLeft, Truck, Package, MapPin, Home, Play, Volume2, Maximize2, Check, Bell, User as UserIcon, Loader2 } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // --- CATEGORY STATE ---
  const [categories, setCategories] = useState<string[]>(['Electronics', 'Fashion', 'Home & Living', 'Gadgets']);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const [isPaymentOpen, setPaymentOpen] = useState(false);
  
  // Authentication State
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Notification / Toast State
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  
  // Checkout & Delivery State
  const [shippingAddress, setShippingAddress] = useState<Address>({
    fullName: '', street: '', city: '', state: '', zipCode: '', country: '', phone: ''
  });
  const [isAddressSet, setIsAddressSet] = useState(false);
  const [loadingRates, setLoadingRates] = useState(false);
  const [calculatedDeliveryOptions, setCalculatedDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOption | null>(null);

  // Delivery Providers Configuration (Admin Managed)
  const [deliveryProviders, setDeliveryProviders] = useState<DeliveryProviderConfig[]>([
    { id: 'local_post', name: 'PiPost Standard', enabled: true, baseRate: 0, perKmRate: 0.1, speedLabel: '5-7 Days' },
    { id: 'express_courier', name: 'FastTrack Express', enabled: true, baseRate: 15, perKmRate: 0.5, speedLabel: '1-2 Days' },
    { id: 'drone', name: 'AeroDrone Instant', enabled: true, baseRate: 40, perKmRate: 0, speedLabel: '2 Hours' }
  ]);

  // --- DYNAMIC CONTENT STATE (CMS) ---
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    storeName: "PiShop AI",
    currency: 'USD',
    currencySymbol: '$',
    theme: 'light',
    hero: {
      title: "Summer Tech Sale",
      subtitle: "Upgrade your Raspberry Pi setup with our latest gadgets. Limited stock available.",
      buttonText: "Shop Now",
      gradient: "indigo"
    },
    brands: ['TechCorp', 'PiGadgets', 'SmartHome', 'FutureWear', 'EcoLife', 'AudioMax'],
    videoAd: {
      enabled: true,
      title: "Next Gen Raspberry Pi Hosting",
      subtitle: "Discover how our cloud solutions scale with your business needs. Watch the full keynote now.",
      imageUrl: "https://picsum.photos/1200/400?grayscale"
    },
    integrations: {
      googleAnalyticsId: '',
      adSenseId: '',
      metaPixelId: ''
    }
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    gateways: [
      { id: 'gpay', name: 'Google Pay', enabled: true, type: 'wallet' },
      { id: 'phonepe', name: 'PhonePe', enabled: true, type: 'upi' },
      { id: 'card', name: 'Credit / Debit Card', enabled: true, type: 'card' },
      { id: 'razorpay', name: 'Razorpay Secure', enabled: false, type: 'netbanking' },
    ]
  });

  // Helper to show notifications
  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000); // Hide after 5 seconds
  };

  // Pre-fill address on login
  useEffect(() => {
    if (user?.savedAddress) {
      setShippingAddress(user.savedAddress);
      setIsAddressSet(true);
    } else {
      setIsAddressSet(false);
      setCalculatedDeliveryOptions([]);
    }
  }, [user]);

  // Suppress ResizeObserver Loop Error
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      if (
        e.message.includes('ResizeObserver loop limit exceeded') || 
        e.message.includes('ResizeObserver loop completed with undelivered notifications')
      ) {
        e.stopImmediatePropagation();
        const resizeObserverErrDiv = document.getElementById('webpack-dev-server-client-overlay-div');
        const resizeObserverErr = document.getElementById('webpack-dev-server-client-overlay');
        if (resizeObserverErr) resizeObserverErr.style.display = 'none';
        if (resizeObserverErrDiv) resizeObserverErrDiv.style.display = 'none';
      }
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showNotification(`Added ${product.name} to cart`, 'info');
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    showNotification("Admin mode enabled. You can now edit the shop.", 'info');
  };

  const handleUserLogin = (provider: 'google' | 'facebook') => {
    // Simulate Login with Mock Data
    const mockUser: User = {
        id: Date.now().toString(),
        name: 'Demo User',
        email: 'user@example.com',
        provider: provider,
        // Mock saved address
        savedAddress: {
           fullName: 'Demo User',
           street: '123 Raspberry Lane',
           city: 'Silicon Valley',
           state: 'CA',
           zipCode: '94025',
           country: 'USA',
           phone: '555-0199'
        }
    };
    setUser(mockUser);
    
    // Simulate Welcome Automations
    setTimeout(() => {
        showNotification(`📧 Welcome email sent to user@example.com`, 'success');
    }, 1500);
    setTimeout(() => {
        showNotification(`💬 Welcome WhatsApp message sent via PiShop Bot`, 'success');
    }, 3000);
  };

  const handleCalculateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.zipCode || !shippingAddress.city) {
      showNotification("Please enter a valid city and zip code.", 'info');
      return;
    }
    
    setLoadingRates(true);
    setIsAddressSet(true);
    
    try {
      // Filter only enabled providers to send to the API simulation
      const activeProviders = deliveryProviders.filter(p => p.enabled);
      const rates = await fetchDeliveryRates(shippingAddress, activeProviders);
      setCalculatedDeliveryOptions(rates);
      if (rates.length > 0) setSelectedDelivery(rates[0]);
    } catch (error) {
      showNotification("Failed to fetch delivery rates. Try again.", 'info');
    } finally {
      setLoadingRates(false);
    }
  };

  const handleResetAddress = () => {
    setIsAddressSet(false);
    setCalculatedDeliveryOptions([]);
    setSelectedDelivery(null);
  };

  const cartSubTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = selectedDelivery ? selectedDelivery.price : 0;
  const cartTotal = cartSubTotal + shippingCost;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const clearCart = () => {
    const orderId = Math.floor(Math.random() * 100000);
    setCart([]);
    setSelectedDelivery(null);
    setPaymentOpen(false);
    // Keep address for next time if it was typed, or use saved
    
    // Simulate Post-Purchase Communication
    alert(`Order #${orderId} Placed Successfully!`);
    
    setTimeout(() => {
        showNotification(`📧 Order Confirmation #${orderId} sent to ${user?.email || 'your email'}.`, 'success');
    }, 1000);

    setTimeout(() => {
        showNotification(`📱 WhatsApp: "Your Order #${orderId} is confirmed! Track here: bit.ly/pi-${orderId}"`, 'success');
    }, 2500);
  };

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const getGradient = (gradientType: string) => {
    switch(gradientType) {
      case 'purple': return 'from-purple-600 to-pink-600';
      case 'orange': return 'from-orange-500 to-red-600';
      case 'emerald': return 'from-emerald-500 to-teal-600';
      case 'rose': return 'from-rose-500 to-orange-500';
      default: return 'from-indigo-500 to-purple-600'; // indigo
    }
  };

  const RestrictedAccess = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-fade-in">
        <div className="p-6 bg-red-100 text-red-600 rounded-full shadow-lg"><MapPin size={48} /></div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Restricted Access</h2>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">This secured area is for store administrators only. You must verify your identity to proceed.</p>
        </div>
        
        <div className="flex gap-4">
            <Link to="/" className="px-6 py-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
              Return Home
            </Link>
            <button 
              onClick={() => document.getElementById('admin-login-trigger')?.click()} 
              className="px-6 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 shadow-md hover:shadow-lg transition-all"
            >
              Login as Admin
            </button>
        </div>
    </div>
  );

  return (
    <HashRouter>
      <Layout 
        cartCount={cartCount} 
        isAdmin={isAdmin}
        user={user}
        onAdminLogin={handleAdminLogin}
        onAdminLogout={() => setIsAdmin(false)}
        onUserLogin={handleUserLogin}
        onUserLogout={() => setUser(null)}
        siteConfig={siteConfig}
      >
        <Routes>
          <Route path="/" element={
            <div className="space-y-8 pb-20">
              {/* Dynamic Promo Banner */}
              <div className={`bg-gradient-to-r ${getGradient(siteConfig.hero.gradient)} rounded-2xl p-6 md:p-10 text-white shadow-lg relative overflow-hidden transition-colors duration-500`}>
                <div className="absolute right-0 top-0 h-full w-1/2 bg-white/5 skew-x-12 transform translate-x-20"></div>
                <div className="max-w-2xl relative z-10">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-4 inline-block backdrop-blur-sm">FEATURED</span>
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">{siteConfig.hero.title}</h2>
                    <p className="text-indigo-100 mb-6 max-w-lg">{siteConfig.hero.subtitle}</p>
                    <button 
                      onClick={() => setSelectedCategory('All')} 
                      className="bg-white text-slate-900 px-6 py-3 rounded-lg font-bold hover:bg-slate-50 transition-colors shadow-lg"
                    >
                      {siteConfig.hero.buttonText}
                    </button>
                </div>
              </div>

              {/* Dynamic Brand Ads Section */}
              <div className="space-y-3">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trusted Partners</h3>
                 <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {siteConfig.brands.map((brand, i) => (
                       <div key={i} className="min-w-[120px] h-16 bg-white border border-slate-100 rounded-lg flex items-center justify-center shadow-sm text-slate-400 font-bold hover:border-indigo-200 hover:text-indigo-600 transition-colors cursor-pointer">
                          {brand}
                       </div>
                    ))}
                 </div>
              </div>

              {/* Sticky Filter Bar */}
              <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md py-4 border-b border-slate-200 transition-all shadow-sm -mx-4 px-4 md:-mx-8 md:px-8">
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setSelectedCategory('All')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${selectedCategory === 'All' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                  >
                    All
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${selectedCategory === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={addToCart} 
                    currencySymbol={siteConfig.currencySymbol}
                  />
                ))}
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-slate-500">No products found in this category.</p>
                </div>
              )}

              {/* Dynamic Video Ads Section */}
              {siteConfig.videoAd.enabled && (
                <div className="mt-12 bg-black rounded-2xl overflow-hidden shadow-xl relative group cursor-pointer border border-slate-800">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                    <img src={siteConfig.videoAd.imageUrl} alt="Video Ad Background" className="w-full h-64 md:h-80 object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                    
                    <div className="absolute inset-0 z-20 flex flex-col justify-end p-8">
                       <span className="bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded w-fit mb-2">SPONSORED</span>
                       <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{siteConfig.videoAd.title}</h3>
                       <p className="text-slate-300 mb-6 max-w-lg">{siteConfig.videoAd.subtitle}</p>
                       
                       <div className="flex items-center gap-4">
                          <button className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                             <Play size={18} fill="black" /> Watch Now
                          </button>
                          <button className="p-3 bg-white/10 rounded-full text-white backdrop-blur-md hover:bg-white/20">
                             <Volume2 size={20} />
                          </button>
                       </div>
                    </div>
                </div>
              )}
            </div>
          } />

          <Route path="/cart" element={
            <div className="max-w-5xl mx-auto pb-20">
              <div className="flex items-center gap-4 mb-6">
                 <Link to="/" className="p-2 hover:bg-slate-200 rounded-full transition-colors" aria-label="Back to Home">
                    <Home size={24} className="text-slate-700"/>
                 </Link>
                 <h2 className="text-2xl font-bold text-slate-900">Checkout</h2>
              </div>
              
              {cart.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                  <ShoppingCart className="mx-auto text-slate-300 mb-4" size={48} />
                  <p className="text-slate-500 mb-6">Your cart is empty.</p>
                  <Link to="/" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
                     Continue Shopping
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* 1. SHIPPING ADDRESS */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                           <h3 className="font-bold text-slate-800 flex items-center gap-2">
                              <MapPin size={20} className="text-indigo-600" /> Shipping Details
                           </h3>
                           {isAddressSet && (
                             <button onClick={handleResetAddress} className="text-xs text-indigo-600 font-bold hover:underline">Edit</button>
                           )}
                        </div>

                        {!isAddressSet ? (
                          <form onSubmit={handleCalculateShipping} className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                   <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                                   <input type="text" required className="w-full bg-white border border-slate-300 rounded p-2 mt-1" value={shippingAddress.fullName} onChange={e => setShippingAddress({...shippingAddress, fullName: e.target.value})} />
                                </div>
                                <div>
                                   <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                                   <input type="tel" required className="w-full bg-white border border-slate-300 rounded p-2 mt-1" value={shippingAddress.phone} onChange={e => setShippingAddress({...shippingAddress, phone: e.target.value})} />
                                </div>
                                <div className="md:col-span-2">
                                   <label className="text-xs font-bold text-slate-500 uppercase">Street Address</label>
                                   <input type="text" required className="w-full bg-white border border-slate-300 rounded p-2 mt-1" value={shippingAddress.street} onChange={e => setShippingAddress({...shippingAddress, street: e.target.value})} />
                                </div>
                                <div>
                                   <label className="text-xs font-bold text-slate-500 uppercase">City</label>
                                   <input type="text" required className="w-full bg-white border border-slate-300 rounded p-2 mt-1" value={shippingAddress.city} onChange={e => setShippingAddress({...shippingAddress, city: e.target.value})} />
                                </div>
                                <div>
                                   <label className="text-xs font-bold text-slate-500 uppercase">Zip / Post Code</label>
                                   <input type="text" required className="w-full bg-white border border-slate-300 rounded p-2 mt-1" value={shippingAddress.zipCode} onChange={e => setShippingAddress({...shippingAddress, zipCode: e.target.value})} />
                                </div>
                             </div>
                             <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
                                Calculate Shipping Rates
                             </button>
                          </form>
                        ) : (
                          <div className="text-sm text-slate-600">
                             <p className="font-bold text-slate-900">{shippingAddress.fullName}</p>
                             <p>{shippingAddress.street}</p>
                             <p>{shippingAddress.city}, {shippingAddress.zipCode}</p>
                             <p>{shippingAddress.phone}</p>
                          </div>
                        )}
                    </div>

                    {/* 2. DELIVERY METHODS */}
                    {isAddressSet && (
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 animate-fade-in">
                          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                              <Truck size={20} className="text-indigo-600" /> Select Delivery
                          </h3>
                          
                          {loadingRates ? (
                             <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                                <Loader2 size={32} className="animate-spin mb-2 text-indigo-600" />
                                <p>Fetching live rates from carriers...</p>
                             </div>
                          ) : (
                             <div className="space-y-3">
                                {calculatedDeliveryOptions.length === 0 ? (
                                    <div className="text-center py-4 text-red-500">No delivery options available for this location.</div>
                                ) : (
                                  calculatedDeliveryOptions.map(option => (
                                    <label 
                                      key={option.id} 
                                      className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                        selectedDelivery?.id === option.id 
                                          ? 'border-indigo-600 bg-indigo-50' 
                                          : 'border-slate-100 hover:border-slate-300'
                                      }`}
                                    >
                                        <div className="flex items-center gap-3">
                                          <input 
                                            type="radio" 
                                            name="delivery"
                                            className="accent-indigo-600 w-5 h-5"
                                            checked={selectedDelivery?.id === option.id}
                                            onChange={() => setSelectedDelivery(option)}
                                          />
                                          <div>
                                            <p className="font-bold text-slate-800">{option.name}</p>
                                            <p className="text-xs text-slate-500">{option.duration} via {option.provider}</p>
                                          </div>
                                        </div>
                                        <span className="font-bold text-slate-900">
                                          {option.price === 0 ? 'Free' : `${siteConfig.currencySymbol}${option.price.toFixed(2)}`}
                                        </span>
                                    </label>
                                  ))
                                )}
                             </div>
                          )}
                      </div>
                    )}

                    {/* 3. CART ITEMS */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-4 opacity-75 hover:opacity-100 transition-opacity">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                           <h3 className="font-bold text-slate-700">Order Items</h3>
                           <span className="text-xs text-slate-500">{cartCount} items</span>
                        </div>
                        {cart.map(item => (
                        <div key={item.id} className="flex items-center gap-4">
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-slate-100" />
                            <div className="flex-1">
                            <h3 className="font-bold text-slate-800 text-sm">{item.name}</h3>
                            <p className="text-slate-500 text-xs">{siteConfig.currencySymbol}{item.price}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono bg-slate-100 px-2 py-1 rounded text-xs">Qty: {item.quantity}</span>
                              <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600">
                                  <Trash2 size={16} />
                              </button>
                            </div>
                        </div>
                        ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit sticky top-24">
                        <h3 className="font-bold text-slate-800 mb-4 text-lg">Order Summary</h3>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>{siteConfig.currencySymbol}{cartSubTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Shipping</span>
                                <span className={shippingCost === 0 && selectedDelivery ? 'text-green-600 font-medium' : ''}>
                                    {!selectedDelivery ? '--' : shippingCost === 0 ? 'Free' : `${siteConfig.currencySymbol}${shippingCost.toFixed(2)}`}
                                </span>
                            </div>
                            <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-slate-900 text-lg">
                                <span>Total</span>
                                <span>{siteConfig.currencySymbol}{cartTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => setPaymentOpen(true)}
                            disabled={!selectedDelivery}
                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                        >
                            {selectedDelivery ? 'Proceed to Payment' : 'Enter Address & Select Shipping'}
                        </button>
                        
                         <Link to="/" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                           <ArrowLeft size={16} /> Continue Shopping
                        </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          } />

          <Route path="/dashboard" element={
            isAdmin ? <Dashboard currencySymbol={siteConfig.currencySymbol} siteConfig={siteConfig} /> : <RestrictedAccess />
          } />
          
          <Route path="/admin" element={
            isAdmin ? (
              <AdminPanel 
                products={products} 
                setProducts={setProducts} 
                categories={categories}
                setCategories={setCategories}
                siteConfig={siteConfig}
                setSiteConfig={setSiteConfig}
                paymentSettings={paymentSettings}
                setPaymentSettings={setPaymentSettings}
                deliveryProviders={deliveryProviders}
                setDeliveryProviders={setDeliveryProviders}
              />
            ) : (
              <RestrictedAccess />
            )
          } />

          <Route path="/ai-assistant" element={<AiChat />} />

        </Routes>

        <PaymentModal 
          isOpen={isPaymentOpen} 
          onClose={() => setPaymentOpen(false)} 
          total={cartTotal}
          onSuccess={clearCart}
          paymentSettings={paymentSettings}
          currencySymbol={siteConfig.currencySymbol}
        />

        {/* NOTIFICATION TOAST OVERLAY */}
        {notification && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in w-[90%] max-w-md">
                <div className={`shadow-2xl rounded-xl p-4 flex items-start gap-3 ${notification.type === 'success' ? 'bg-slate-900 text-white' : 'bg-white text-slate-800 border border-slate-200'}`}>
                    <div className={`p-1 rounded-full ${notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'} text-white shrink-0`}>
                        {notification.type === 'success' ? <Check size={14} strokeWidth={3} /> : <Bell size={14} />}
                    </div>
                    <div>
                        <p className="font-medium text-sm">{notification.message}</p>
                    </div>
                </div>
            </div>
        )}

      </Layout>
    </HashRouter>
  );
}
