
import React, { useState } from 'react';
import { Product, SiteConfig, PaymentSettings, DeliveryProviderConfig } from '../types';
import { Trash2, Plus, Image as ImageIcon, Save, X, Pen, RefreshCw, Package, Megaphone, CreditCard, DollarSign, Layout, MonitorPlay, ToggleLeft, ToggleRight, Smartphone, Truck, Settings, Upload, List, Globe, BarChart3, Radio, Share2, MapPin, Users, Send, Loader2 } from 'lucide-react';
import { syncCatalogToMeta } from '../services/socialSyncApi';

interface AdminPanelProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  paymentSettings: PaymentSettings;
  setPaymentSettings: React.Dispatch<React.SetStateAction<PaymentSettings>>;
  deliveryProviders: DeliveryProviderConfig[];
  setDeliveryProviders: React.Dispatch<React.SetStateAction<DeliveryProviderConfig[]>>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  products, setProducts, 
  categories, setCategories,
  siteConfig, setSiteConfig,
  paymentSettings, setPaymentSettings,
  deliveryProviders, setDeliveryProviders
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'marketing' | 'payments' | 'delivery' | 'settings' | 'integrations'>('inventory');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // --- INVENTORY STATE ---
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: categories[0],
    description: '',
    image: 'https://picsum.photos/400/400?random=10',
    stock: 10,
    rating: 5.0
  });

  const [newCategoryName, setNewCategoryName] = useState('');

  // --- DELIVERY PROVIDER FORM STATE ---
  const [providerForm, setProviderForm] = useState<Partial<DeliveryProviderConfig>>({
    name: '', baseRate: 0, perKmRate: 0, speedLabel: '', enabled: true
  });
  const [isProviderFormOpen, setIsProviderFormOpen] = useState(false);

  // --- SYNC STATE ---
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<string | null>(null);

  // --- HANDLERS FOR CATEGORIES ---
  const handleAddCategory = () => {
    if (newCategoryName && !categories.includes(newCategoryName)) {
      setCategories([...categories, newCategoryName]);
      setNewCategoryName('');
    }
  };

  const handleDeleteCategory = (cat: string) => {
    if (window.confirm(`Delete category "${cat}"? Products in this category may need updating.`)) {
      setCategories(categories.filter(c => c !== cat));
    }
  };

  // --- HANDLERS FOR INVENTORY ---
  const resetForm = () => {
    setFormData({
        name: '',
        price: 0,
        category: categories[0] || '',
        description: '',
        image: `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 100)}`,
        stock: 10,
        rating: 5.0
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setEditingId(product.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this listing?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price === undefined) return;

    if (editingId) {
      setProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...formData } as Product : p));
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name!,
        price: Number(formData.price),
        category: formData.category || 'Uncategorized',
        description: formData.description || 'No description provided.',
        image: formData.image!,
        rating: formData.rating || 5,
        stock: formData.stock || 0
      };
      setProducts(prev => [newProduct, ...prev]);
    }
    resetForm();
  };

  // --- HANDLERS FOR DELIVERY PROVIDERS ---
  const toggleProvider = (id: string) => {
      setDeliveryProviders(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const deleteProvider = (id: string) => {
    if (window.confirm('Delete this delivery provider integration?')) {
        setDeliveryProviders(prev => prev.filter(p => p.id !== id));
    }
  };

  const updateProvider = (id: string, field: keyof DeliveryProviderConfig, value: any) => {
     setDeliveryProviders(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleAddProvider = (e: React.FormEvent) => {
      e.preventDefault();
      if (!providerForm.name || !providerForm.speedLabel) return;
      
      const newProvider: DeliveryProviderConfig = {
          id: `custom_${Date.now()}`,
          name: providerForm.name,
          baseRate: Number(providerForm.baseRate) || 0,
          perKmRate: Number(providerForm.perKmRate) || 0,
          speedLabel: providerForm.speedLabel,
          enabled: true
      };

      setDeliveryProviders([...deliveryProviders, newProvider]);
      setIsProviderFormOpen(false);
      setProviderForm({ name: '', baseRate: 0, perKmRate: 0, speedLabel: '', enabled: true });
  };

  // --- HANDLERS FOR PAYMENTS ---
  const toggleGateway = (id: string) => {
    setPaymentSettings(prev => ({
      gateways: prev.gateways.map(g => g.id === id ? { ...g, enabled: !g.enabled } : g)
    }));
  };

  const updateApiKey = (id: string, key: string) => {
    setPaymentSettings(prev => ({
        gateways: prev.gateways.map(g => g.id === id ? { ...g, apiKey: key } : g)
    }));
  };

  // --- HANDLERS FOR SETTINGS / MARKETING / INTEGRATIONS ---
  const updateHero = (field: string, value: string) => {
    setSiteConfig(prev => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
  };

  const updateVideoAd = (field: string, value: any) => {
    setSiteConfig(prev => ({ ...prev, videoAd: { ...prev.videoAd, [field]: value } }));
  };
  
  const updateBrands = (value: string) => {
      const brandsList = value.split(',').map(s => s.trim()).filter(s => s);
      setSiteConfig(prev => ({ ...prev, brands: brandsList }));
  };

  const handleCurrencyChange = (currency: 'USD' | 'INR' | 'EUR' | 'GBP') => {
      const symbols: Record<string, string> = { 'USD': '$', 'INR': '₹', 'EUR': '€', 'GBP': '£' };
      setSiteConfig(prev => ({
          ...prev,
          currency,
          currencySymbol: symbols[currency]
      }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setSiteConfig(prev => ({ ...prev, logoUrl: objectUrl }));
    }
  };

  const updateIntegration = (field: keyof typeof siteConfig.integrations, value: string) => {
      setSiteConfig(prev => ({
          ...prev,
          integrations: {
              ...prev.integrations,
              [field]: value
          }
      }));
  };

  const updateOrigin = (field: string, value: string) => {
      setSiteConfig(prev => ({
          ...prev,
          origin: {
              ...prev.origin,
              [field]: value
          }
      }));
  };

  const updateCommunity = (field: 'whatsapp' | 'telegram', value: string) => {
      setSiteConfig(prev => ({
          ...prev,
          community: {
              ...prev.community,
              [field]: value
          }
      }));
  };

  const handleSocialSync = async () => {
    setIsSyncing(true);
    setLastSyncResult(null);
    try {
        const result = await syncCatalogToMeta(products, siteConfig.integrations);
        setLastSyncResult(`Success! ${result.syncedCount} items pushed to Meta Commerce Manager.`);
    } catch (e: any) {
        setLastSyncResult(`Error: ${e.message}`);
    } finally {
        setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[80vh] pb-20">
       
       {/* SIDEBAR NAVIGATION */}
       <div className="w-full lg:w-64 flex flex-col gap-2 shrink-0">
           <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 mb-2">
               <h2 className="text-lg font-bold text-slate-800">Admin Console</h2>
               <p className="text-xs text-slate-500">v3.4.0 • Pi-Host</p>
           </div>
           
           <button 
             onClick={() => setActiveTab('inventory')}
             className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 transition-all ${activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'}`}
           >
              <Package size={20} /> Inventory
           </button>
           <button 
             onClick={() => setActiveTab('delivery')}
             className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 transition-all ${activeTab === 'delivery' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'}`}
           >
              <Truck size={20} /> Delivery APIs
           </button>
           <button 
             onClick={() => setActiveTab('integrations')}
             className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 transition-all ${activeTab === 'integrations' ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'}`}
           >
              <BarChart3 size={20} /> Integrations
           </button>
           <button 
             onClick={() => setActiveTab('marketing')}
             className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 transition-all ${activeTab === 'marketing' ? 'bg-pink-600 text-white shadow-lg shadow-pink-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'}`}
           >
              <Megaphone size={20} /> Marketing
           </button>
           <button 
             onClick={() => setActiveTab('payments')}
             className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 transition-all ${activeTab === 'payments' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'}`}
           >
              <CreditCard size={20} /> Payments
           </button>
           <button 
             onClick={() => setActiveTab('settings')}
             className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 transition-all ${activeTab === 'settings' ? 'bg-slate-800 text-white shadow-lg shadow-slate-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'}`}
           >
              <Settings size={20} /> Settings
           </button>
       </div>

       {/* CONTENT AREA */}
       <div className="flex-1">
          
          {/* --- INVENTORY TAB --- */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-fade-in">
                
                {/* CATEGORY MANAGER */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><List size={18} /> Manage Categories</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {categories.map(cat => (
                            <span key={cat} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                {cat}
                                <button onClick={() => handleDeleteCategory(cat)} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={newCategoryName} 
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="New category name..."
                            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button onClick={handleAddCategory} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-900">Add</button>
                    </div>
                </div>

                <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Product List</h2>
                        <p className="text-slate-500">Total Products: {products.length}</p>
                    </div>
                    <button 
                        onClick={() => { resetForm(); setIsFormOpen(true); }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} /> Add Product
                    </button>
                </div>

                {/* PRODUCT TABLE */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="p-4 font-bold text-slate-700 text-xs uppercase tracking-wider">Product</th>
                                    <th className="p-4 font-bold text-slate-700 text-xs uppercase tracking-wider">Category</th>
                                    <th className="p-4 font-bold text-slate-700 text-xs uppercase tracking-wider">Price</th>
                                    <th className="p-4 font-bold text-slate-700 text-xs uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {products.map(product => (
                                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 overflow-hidden">
                                                <img src={product.image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="font-bold text-slate-800">{product.name}</span>
                                        </td>
                                        <td className="p-4"><span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">{product.category}</span></td>
                                        <td className="p-4 font-mono text-slate-900">{siteConfig.currencySymbol}{product.price.toFixed(2)}</td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <button onClick={() => handleEdit(product)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"><Pen size={16}/></button>
                                            <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
          )}

          {/* --- DELIVERY TAB (PROVIDERS) --- */}
          {activeTab === 'delivery' && (
              <div className="space-y-6 animate-fade-in">
                   <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm mb-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Delivery API Integrations</h2>
                            <p className="text-slate-500">Manage connected shipping partners and custom delivery methods.</p>
                        </div>
                        <button 
                            onClick={() => setIsProviderFormOpen(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Plus size={18} /> Add New Service
                        </button>
                   </div>

                   {/* ORIGIN SETTINGS */}
                   <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm mb-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><MapPin size={20} className="text-blue-600"/> Shop Origin Address</h3>
                        <p className="text-xs text-slate-500 mb-4">Shipping distance is calculated from this location.</p>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">City</label>
                                <input 
                                    type="text" 
                                    value={siteConfig.origin.city}
                                    onChange={(e) => updateOrigin('city', e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded p-2 mt-1"
                                />
                             </div>
                             <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Zip / Post Code</label>
                                <input 
                                    type="text" 
                                    value={siteConfig.origin.zipCode}
                                    onChange={(e) => updateOrigin('zipCode', e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded p-2 mt-1"
                                />
                             </div>
                        </div>
                   </div>

                    <div className="grid grid-cols-1 gap-4">
                        {deliveryProviders.map(provider => (
                             <div key={provider.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className={`p-3 rounded-lg ${provider.enabled ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                        <Truck size={24} />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="text" 
                                                value={provider.name}
                                                onChange={(e) => updateProvider(provider.id, 'name', e.target.value)}
                                                className="font-bold text-slate-800 text-lg bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none"
                                            />
                                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">ID: {provider.id}</span>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <span>Base Rate:</span>
                                                <input 
                                                    type="number" 
                                                    value={provider.baseRate}
                                                    onChange={(e) => updateProvider(provider.id, 'baseRate', parseFloat(e.target.value))}
                                                    className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>Per KM:</span>
                                                <input 
                                                    type="number" 
                                                    value={provider.perKmRate}
                                                    onChange={(e) => updateProvider(provider.id, 'perKmRate', parseFloat(e.target.value))}
                                                    className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>Speed Label:</span>
                                                <input 
                                                    type="text" 
                                                    value={provider.speedLabel}
                                                    onChange={(e) => updateProvider(provider.id, 'speedLabel', e.target.value)}
                                                    className="w-32 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 border-t pt-4 md:border-t-0 md:pt-0">
                                    <button onClick={() => deleteProvider(provider.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={20} />
                                    </button>
                                    <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
                                    <button onClick={() => toggleProvider(provider.id)}>
                                        {provider.enabled ? <ToggleRight className="text-blue-600 w-12 h-12" /> : <ToggleLeft className="text-slate-300 w-12 h-12" />}
                                    </button>
                                </div>
                             </div>
                        ))}
                    </div>
              </div>
          )}

          {/* --- INTEGRATIONS TAB --- */}
          {activeTab === 'integrations' && (
              <div className="space-y-6 animate-fade-in">
                  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm mb-6">
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">External Integrations</h2>
                      <p className="text-slate-500">Connect Google, Meta, and other third-party services.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* SOCIAL CATALOG SYNC */}
                      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4 md:col-span-2">
                          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
                              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                  <Share2 size={24} />
                              </div>
                              <div>
                                  <h3 className="font-bold text-slate-800">Catalog Sync Center</h3>
                                  <p className="text-xs text-slate-500">Push your {products.length} products to Meta (Facebook & Instagram).</p>
                              </div>
                          </div>
                          <div className="flex items-center justify-between">
                              <div className="text-sm text-slate-600">
                                  <p>Ensure a valid Pixel ID is set below.</p>
                                  {lastSyncResult && (
                                      <p className={`mt-2 font-bold ${lastSyncResult.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>
                                          {lastSyncResult}
                                      </p>
                                  )}
                              </div>
                              <button 
                                onClick={handleSocialSync} 
                                disabled={isSyncing || !siteConfig.integrations.metaPixelId}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                {isSyncing ? <Loader2 className="animate-spin" size={18} /> : <Share2 size={18} />}
                                {isSyncing ? 'Syncing...' : 'Sync Catalog Now'}
                              </button>
                          </div>
                      </div>

                      {/* GOOGLE ANALYTICS */}
                      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
                              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                                  <BarChart3 size={24} />
                              </div>
                              <div>
                                  <h3 className="font-bold text-slate-800">Google Analytics 4</h3>
                                  <p className="text-xs text-slate-500">Track impressions and user activity</p>
                              </div>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">Measurement ID</label>
                              <input 
                                  type="text" 
                                  placeholder="G-XXXXXXXXXX"
                                  value={siteConfig.integrations.googleAnalyticsId}
                                  onChange={(e) => updateIntegration('googleAnalyticsId', e.target.value)}
                                  className="w-full bg-white border border-slate-300 rounded p-3 mt-1 font-mono text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                              />
                              <p className="text-xs text-slate-400 mt-2">Found in GA Admin {'>'} Data Streams.</p>
                          </div>
                      </div>

                      {/* GOOGLE ADSENSE */}
                      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
                              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                  <DollarSign size={24} />
                              </div>
                              <div>
                                  <h3 className="font-bold text-slate-800">Google AdSense</h3>
                                  <p className="text-xs text-slate-500">Monetize with display ads</p>
                              </div>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">Publisher ID</label>
                              <input 
                                  type="text" 
                                  placeholder="pub-XXXXXXXXXXXXXXXX"
                                  value={siteConfig.integrations.adSenseId}
                                  onChange={(e) => updateIntegration('adSenseId', e.target.value)}
                                  className="w-full bg-white border border-slate-300 rounded p-3 mt-1 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                              <p className="text-xs text-slate-400 mt-2">Found in AdSense Account Information.</p>
                          </div>
                      </div>

                      {/* META PIXEL */}
                      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4 md:col-span-2">
                          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
                              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                  <Globe size={24} />
                              </div>
                              <div>
                                  <h3 className="font-bold text-slate-800">Meta Pixel (Facebook/Instagram)</h3>
                                  <p className="text-xs text-slate-500">Track conversions from social ads</p>
                              </div>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">Pixel ID</label>
                              <input 
                                  type="text" 
                                  placeholder="123456789012345"
                                  value={siteConfig.integrations.metaPixelId}
                                  onChange={(e) => updateIntegration('metaPixelId', e.target.value)}
                                  className="w-full bg-white border border-slate-300 rounded p-3 mt-1 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                              />
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* --- MARKETING TAB --- */}
          {activeTab === 'marketing' && (
            <div className="space-y-6 animate-fade-in">
               <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Content Management</h2>
                    <p className="text-slate-500">Control your homepage banners, ads, and branding.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* HERO BANNER EDIT */}
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 text-indigo-600 font-bold border-b border-slate-100 pb-2 mb-2">
                            <Layout size={20} /> Homepage Hero Banner
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                            <input 
                                type="text" 
                                value={siteConfig.hero.title}
                                onChange={(e) => updateHero('title', e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded p-2 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Subtitle</label>
                            <textarea 
                                value={siteConfig.hero.subtitle}
                                onChange={(e) => updateHero('subtitle', e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded p-2 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none h-20"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Theme</label>
                            <select 
                                value={siteConfig.hero.gradient}
                                onChange={(e) => updateHero('gradient', e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded p-2 mt-1"
                            >
                                <option value="indigo">Indigo/Purple (Default)</option>
                                <option value="orange">Orange/Red (Summer)</option>
                                <option value="emerald">Emerald/Teal (Eco)</option>
                                <option value="rose">Rose/Pink (Valentines)</option>
                            </select>
                        </div>
                    </div>

                    {/* COMMUNITY LINKS */}
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                         <div className="flex items-center gap-2 text-green-600 font-bold border-b border-slate-100 pb-2 mb-2">
                            <Users size={20} /> Community Groups
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">WhatsApp Group Link</label>
                            <input 
                                type="text" 
                                placeholder="https://chat.whatsapp.com/..."
                                value={siteConfig.community.whatsapp}
                                onChange={(e) => updateCommunity('whatsapp', e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded p-2 mt-1 focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Telegram Channel Link</label>
                            <input 
                                type="text" 
                                placeholder="https://t.me/..."
                                value={siteConfig.community.telegram}
                                onChange={(e) => updateCommunity('telegram', e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded p-2 mt-1 focus:ring-2 focus:ring-blue-400 outline-none"
                            />
                        </div>
                    </div>

                    {/* VIDEO AD EDIT */}
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                            <div className="flex items-center gap-2 text-pink-600 font-bold">
                                <MonitorPlay size={20} /> Video Ad Slot
                            </div>
                            <button onClick={() => updateVideoAd('enabled', !siteConfig.videoAd.enabled)}>
                                {siteConfig.videoAd.enabled ? <ToggleRight className="text-green-500" size={32} /> : <ToggleLeft className="text-slate-300" size={32} />}
                            </button>
                        </div>
                        
                        <div className={!siteConfig.videoAd.enabled ? 'opacity-50 pointer-events-none' : ''}>
                             <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Campaign Title</label>
                                <input 
                                    type="text" 
                                    value={siteConfig.videoAd.title}
                                    onChange={(e) => updateVideoAd('title', e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded p-2 mt-1"
                                />
                            </div>
                            <div className="mt-4">
                                <label className="text-xs font-bold text-slate-500 uppercase">Thumbnail URL</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={siteConfig.videoAd.imageUrl}
                                        onChange={(e) => updateVideoAd('imageUrl', e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded p-2 mt-1 text-sm text-slate-600"
                                    />
                                    <button 
                                        onClick={() => updateVideoAd('imageUrl', `https://picsum.photos/1200/400?random=${Date.now()}`)}
                                        className="mt-1 p-2 bg-slate-100 rounded hover:bg-slate-200"
                                    >
                                        <RefreshCw size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BRANDS EDIT */}
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4 md:col-span-2">
                        <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-2 mb-2">
                            <Package size={20} /> Partner Brands (Comma Separated)
                        </div>
                        <textarea 
                            value={siteConfig.brands.join(', ')}
                            onChange={(e) => updateBrands(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-3 font-mono text-sm h-24 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <p className="text-xs text-slate-400">Example: Apple, Samsung, Sony, Bose</p>
                    </div>
                </div>
            </div>
          )}

          {/* --- PAYMENTS TAB --- */}
          {activeTab === 'payments' && (
            <div className="space-y-6 animate-fade-in">
               <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Gateways</h2>
                    <p className="text-slate-500">Configure accepted payment methods and API keys.</p>
                </div>

                <div className="space-y-4">
                    {paymentSettings.gateways.map(gateway => (
                        <div key={gateway.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
                            <div className={`p-3 rounded-xl ${gateway.enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                <DollarSign size={24} />
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-bold text-lg text-slate-800">{gateway.name}</h3>
                                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono uppercase">{gateway.type}</span>
                                </div>
                                <p className="text-sm text-slate-500">
                                    {gateway.enabled ? 'Currently active and accepting payments.' : 'Disabled at checkout.'}
                                </p>
                            </div>

                            {gateway.enabled && (
                                <div className="w-full md:w-64">
                                     <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">API Key / Merchant ID</label>
                                     <input 
                                        type="password" 
                                        value={gateway.apiKey || ''}
                                        onChange={(e) => updateApiKey(gateway.id, e.target.value)}
                                        placeholder="pk_test_..."
                                        className="w-full border border-slate-200 bg-white rounded px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                     />
                                </div>
                            )}

                            <button onClick={() => toggleGateway(gateway.id)} className="shrink-0">
                                {gateway.enabled ? <ToggleRight className="text-emerald-500 w-12 h-12 hover:opacity-80 transition-opacity" /> : <ToggleLeft className="text-slate-300 w-12 h-12 hover:text-slate-400 transition-colors" />}
                            </button>
                        </div>
                    ))}
                    
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center gap-3 text-indigo-800 text-sm">
                        <Smartphone size={20} />
                        <p><strong>Dev Note:</strong> Changes to payment settings reflect immediately in the user checkout modal.</p>
                    </div>
                </div>
            </div>
          )}

          {/* --- SETTINGS TAB --- */}
          {activeTab === 'settings' && (
              <div className="space-y-6 animate-fade-in">
                  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">General Settings</h2>
                        <p className="text-slate-500">Configure store identity, currency, and themes.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* BRANDING SECTION */}
                      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                          <h3 className="font-bold text-slate-800 flex items-center gap-2"><Package size={18}/> Branding</h3>
                          <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">Store Name</label>
                              <input 
                                type="text" 
                                value={siteConfig.storeName}
                                onChange={(e) => setSiteConfig({...siteConfig, storeName: e.target.value})}
                                className="w-full bg-white border border-slate-300 rounded p-2 mt-1 focus:ring-2 focus:ring-indigo-500"
                              />
                          </div>
                          
                          {/* LOGO UPLOADER */}
                          <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">Store Logo</label>
                              <div className="mt-2 flex items-start gap-4">
                                  <div className="w-20 h-20 rounded-lg bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                      {siteConfig.logoUrl ? (
                                        <img src={siteConfig.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                      ) : (
                                        <ImageIcon className="text-slate-300" />
                                      )}
                                  </div>
                                  <div className="flex-1">
                                      <input 
                                        type="text" 
                                        placeholder="Image URL..." 
                                        className="w-full bg-white border border-slate-300 rounded p-2 text-sm mb-2"
                                        value={siteConfig.logoUrl || ''}
                                        onChange={(e) => setSiteConfig({...siteConfig, logoUrl: e.target.value})}
                                      />
                                      <div className="relative">
                                          <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                          />
                                          <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 rounded text-sm flex items-center justify-center gap-2 transition-colors">
                                            <Upload size={14} /> Upload Image
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                          <h3 className="font-bold text-slate-800 flex items-center gap-2"><DollarSign size={18}/> Currency</h3>
                          <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">Base Currency</label>
                              <select 
                                value={siteConfig.currency}
                                onChange={(e) => handleCurrencyChange(e.target.value as any)}
                                className="w-full bg-white border border-slate-300 rounded p-2 mt-1"
                              >
                                  <option value="USD">USD ($) - US Dollar</option>
                                  <option value="INR">INR (₹) - Indian Rupee</option>
                                  <option value="EUR">EUR (€) - Euro</option>
                                  <option value="GBP">GBP (£) - British Pound</option>
                              </select>
                          </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4 md:col-span-2">
                          <h3 className="font-bold text-slate-800 flex items-center gap-2"><Layout size={18}/> Appearance Theme</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {['light', 'dark', 'festive', 'seasonal'].map(theme => (
                                    <button 
                                        key={theme}
                                        onClick={() => setSiteConfig({...siteConfig, theme: theme as any})}
                                        className={`p-4 rounded-xl border-2 text-center capitalize font-bold transition-all ${siteConfig.theme === theme ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-slate-300 text-slate-600'}`}
                                    >
                                        {theme}
                                    </button>
                                ))}
                          </div>
                      </div>
                  </div>
              </div>
          )}
       </div>

      {/* --- ADD NEW DELIVERY SERVICE MODAL --- */}
      {isProviderFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl animate-scale-up">
                 <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h3 className="font-bold text-xl text-slate-900">Add Delivery Integration</h3>
                    <button onClick={() => setIsProviderFormOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500"><X size={20}/></button>
                </div>
                <form onSubmit={handleAddProvider} className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-slate-700">Service Name</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="e.g., HyperLocal Drone"
                            className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 mt-1"
                            value={providerForm.name} 
                            onChange={e => setProviderForm({...providerForm, name: e.target.value})} 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="text-sm font-bold text-slate-700">Base Rate</label>
                             <input 
                                type="number" 
                                required 
                                min="0"
                                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 mt-1"
                                value={providerForm.baseRate} 
                                onChange={e => setProviderForm({...providerForm, baseRate: parseFloat(e.target.value)})} 
                             />
                        </div>
                         <div>
                             <label className="text-sm font-bold text-slate-700">Per KM Rate</label>
                             <input 
                                type="number" 
                                required 
                                min="0" step="0.1"
                                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 mt-1"
                                value={providerForm.perKmRate} 
                                onChange={e => setProviderForm({...providerForm, perKmRate: parseFloat(e.target.value)})} 
                             />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-slate-700">Speed Label</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="e.g., 30-45 Mins"
                            className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 mt-1"
                            value={providerForm.speedLabel} 
                            onChange={e => setProviderForm({...providerForm, speedLabel: e.target.value})} 
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 mt-2">
                        Create Service
                    </button>
                </form>
            </div>
          </div>
      )}

      {/* --- ADD/EDIT PRODUCT MODAL --- */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl w-full max-w-2xl shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h3 className="font-bold text-xl text-slate-900">{editingId ? 'Edit Product' : 'New Product'}</h3>
                    <button onClick={resetForm} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500"><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Name</label>
                        <input type="text" required className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Category</label>
                        <select className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Price ({siteConfig.currencySymbol})</label>
                        <input type="number" required min="0" step="0.01" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Stock</label>
                        <input type="number" required min="0" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-slate-700">Image URL</label>
                        <div className="flex gap-2">
                             <input type="text" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                             <button type="button" onClick={() => setFormData({...formData, image: `https://picsum.photos/400/400?random=${Date.now()}`})} className="bg-slate-100 px-3 rounded border border-slate-200"><RefreshCw size={16}/></button>
                        </div>
                    </div>
                    <div className="md:col-span-2 pt-4 flex justify-end gap-3 border-t border-slate-100">
                        <button type="button" onClick={resetForm} className="px-6 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-2"><Save size={18} /> Save</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
