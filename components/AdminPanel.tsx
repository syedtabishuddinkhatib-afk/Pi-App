
import React, { useState } from 'react';
import { Product, SiteConfig, PaymentSettings, DeliveryProviderConfig, ThemeColors } from '../types';
import { Trash2, Plus, Image as ImageIcon, Save, X, Pen, RefreshCw, Package, Megaphone, CreditCard, DollarSign, Layout, MonitorPlay, ToggleLeft, ToggleRight, Smartphone, Truck, Settings, Upload, List, Globe, BarChart3, Radio, Share2, MapPin, Users, Send, Loader2, Palette } from 'lucide-react';
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

  // --- THEME COLOR HANDLER ---
  const updateThemeColor = (colorKey: keyof ThemeColors, value: string) => {
      setSiteConfig(prev => ({
          ...prev,
          themeMode: 'custom',
          colors: {
              ...prev.colors,
              [colorKey]: value
          }
      }));
  };

  const applyPresetTheme = (mode: 'light' | 'dark' | 'festive' | 'matrix') => {
      let colors: ThemeColors;
      switch (mode) {
          case 'dark':
              colors = { primary: '#6366F1', background: '#0F172A', card: '#1E293B', text: '#F1F5F9', sidebar: '#1E293B', border: '#334155' };
              break;
          case 'festive':
              colors = { primary: '#DC2626', background: '#FEF2F2', card: '#FFFFFF', text: '#450A0A', sidebar: '#FFFFFF', border: '#FECACA' };
              break;
          case 'matrix':
              colors = { primary: '#00FF00', background: '#000000', card: '#111111', text: '#00FF00', sidebar: '#000000', border: '#003300' };
              break;
          default: // light
              colors = { primary: '#4F46E5', background: '#F8FAFC', card: '#FFFFFF', text: '#0F172A', sidebar: '#FFFFFF', border: '#E2E8F0' };
      }
      setSiteConfig(prev => ({ ...prev, themeMode: mode === 'matrix' ? 'custom' : mode, colors }));
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
           <div className="p-4 bg-[var(--color-card)] rounded-xl shadow-sm border border-[var(--color-border)] mb-2">
               <h2 className="text-lg font-bold text-[var(--color-text)]">Admin Console</h2>
               <p className="text-xs text-[var(--color-text)] opacity-60">v3.5.0 • Pi-Host</p>
           </div>
           
           {[
             { id: 'inventory', label: 'Inventory', icon: <Package size={20} /> },
             { id: 'delivery', label: 'Delivery APIs', icon: <Truck size={20} /> },
             { id: 'integrations', label: 'Integrations', icon: <BarChart3 size={20} /> },
             { id: 'marketing', label: 'Marketing', icon: <Megaphone size={20} /> },
             { id: 'payments', label: 'Payments', icon: <CreditCard size={20} /> },
             { id: 'settings', label: 'Settings', icon: <Settings size={20} /> }
           ].map(tab => (
               <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`p-4 rounded-xl text-left font-bold flex items-center gap-3 transition-all ${activeTab === tab.id ? 'bg-[var(--color-primary)] text-white shadow-lg' : 'bg-[var(--color-card)] text-[var(--color-text)] hover:opacity-80 border border-[var(--color-border)]'}`}
               >
                  {tab.icon} {tab.label}
               </button>
           ))}
       </div>

       {/* CONTENT AREA */}
       <div className="flex-1">
          
          {/* --- INVENTORY TAB --- */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm">
                    <h3 className="font-bold text-[var(--color-text)] flex items-center gap-2 mb-4"><List size={18} /> Manage Categories</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {categories.map(cat => (
                            <span key={cat} className="bg-[var(--color-bg)] text-[var(--color-text)] px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 border border-[var(--color-border)]">
                                {cat}
                                <button onClick={() => handleDeleteCategory(cat)} className="text-[var(--color-text)] opacity-50 hover:text-red-500"><X size={14} /></button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={newCategoryName} 
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="New category name..."
                            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-slate-900"
                        />
                        <button onClick={handleAddCategory} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90">Add</button>
                    </div>
                </div>

                <div className="flex justify-between items-center bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--color-text)]">Product List</h2>
                        <p className="text-[var(--color-text)] opacity-60">Total Products: {products.length}</p>
                    </div>
                    <button 
                        onClick={() => { resetForm(); setIsFormOpen(true); }}
                        className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} /> Add Product
                    </button>
                </div>

                {/* PRODUCT TABLE */}
                <div className="bg-[var(--color-card)] rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[var(--color-text)]">
                            <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                                <tr>
                                    <th className="p-4 font-bold text-xs uppercase tracking-wider opacity-60">Product</th>
                                    <th className="p-4 font-bold text-xs uppercase tracking-wider opacity-60">Category</th>
                                    <th className="p-4 font-bold text-xs uppercase tracking-wider opacity-60">Price</th>
                                    <th className="p-4 font-bold text-xs uppercase tracking-wider opacity-60 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {products.map(product => (
                                    <tr key={product.id} className="hover:bg-[var(--color-bg)] transition-colors">
                                        <td className="p-4 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded bg-[var(--color-bg)] border border-[var(--color-border)] overflow-hidden">
                                                <img src={product.image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="font-bold">{product.name}</span>
                                        </td>
                                        <td className="p-4"><span className="text-xs font-bold bg-[var(--color-bg)] opacity-80 px-2 py-1 rounded">{product.category}</span></td>
                                        <td className="p-4 font-mono">{siteConfig.currencySymbol}{product.price.toFixed(2)}</td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <button onClick={() => handleEdit(product)} className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-bg)] rounded"><Pen size={16}/></button>
                                            <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-[var(--color-bg)] rounded"><Trash2 size={16}/></button>
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
                   <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm mb-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">Delivery API Integrations</h2>
                            <p className="text-[var(--color-text)] opacity-60">Manage connected shipping partners and custom delivery methods.</p>
                        </div>
                        <button 
                            onClick={() => setIsProviderFormOpen(true)}
                            className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-colors flex items-center gap-2"
                        >
                            <Plus size={18} /> Add New Service
                        </button>
                   </div>

                   {/* ORIGIN SETTINGS */}
                   <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm mb-6">
                        <h3 className="font-bold text-[var(--color-text)] flex items-center gap-2 mb-4"><MapPin size={20} className="text-[var(--color-primary)]"/> Shop Origin Address</h3>
                        <p className="text-xs text-[var(--color-text)] opacity-60 mb-4">Shipping distance is calculated from this location.</p>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase">City</label>
                                <input 
                                    type="text" 
                                    value={siteConfig.origin.city}
                                    onChange={(e) => updateOrigin('city', e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded p-2 mt-1 text-slate-900"
                                />
                             </div>
                             <div>
                                <label className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase">Zip / Post Code</label>
                                <input 
                                    type="text" 
                                    value={siteConfig.origin.zipCode}
                                    onChange={(e) => updateOrigin('zipCode', e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded p-2 mt-1 text-slate-900"
                                />
                             </div>
                        </div>
                   </div>

                    <div className="grid grid-cols-1 gap-4">
                        {deliveryProviders.map(provider => (
                             <div key={provider.id} className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className={`p-3 rounded-lg ${provider.enabled ? 'bg-blue-100 text-blue-600' : 'bg-[var(--color-bg)] text-[var(--color-text)] opacity-50'}`}>
                                        <Truck size={24} />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="text" 
                                                value={provider.name}
                                                onChange={(e) => updateProvider(provider.id, 'name', e.target.value)}
                                                className="font-bold text-[var(--color-text)] text-lg bg-transparent border-b border-transparent hover:border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none"
                                            />
                                            <span className="text-xs bg-[var(--color-bg)] text-[var(--color-text)] opacity-60 px-2 py-0.5 rounded font-mono">ID: {provider.id}</span>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-4 text-sm text-[var(--color-text)] opacity-80">
                                            <div className="flex items-center gap-2">
                                                <span>Base Rate:</span>
                                                <input 
                                                    type="number" 
                                                    value={provider.baseRate}
                                                    onChange={(e) => updateProvider(provider.id, 'baseRate', parseFloat(e.target.value))}
                                                    className="w-20 bg-white border border-slate-200 rounded px-2 py-1 text-slate-800"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>Per KM:</span>
                                                <input 
                                                    type="number" 
                                                    value={provider.perKmRate}
                                                    onChange={(e) => updateProvider(provider.id, 'perKmRate', parseFloat(e.target.value))}
                                                    className="w-20 bg-white border border-slate-200 rounded px-2 py-1 text-slate-800"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>Speed Label:</span>
                                                <input 
                                                    type="text" 
                                                    value={provider.speedLabel}
                                                    onChange={(e) => updateProvider(provider.id, 'speedLabel', e.target.value)}
                                                    className="w-32 bg-white border border-slate-200 rounded px-2 py-1 text-slate-800"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 border-t border-[var(--color-border)] pt-4 md:border-t-0 md:pt-0">
                                    <button onClick={() => deleteProvider(provider.id)} className="p-2 text-[var(--color-text)] opacity-40 hover:text-red-500 hover:opacity-100 transition-colors">
                                        <Trash2 size={20} />
                                    </button>
                                    <div className="h-8 w-px bg-[var(--color-border)] hidden md:block"></div>
                                    <button onClick={() => toggleProvider(provider.id)}>
                                        {provider.enabled ? <ToggleRight className="text-[var(--color-primary)] w-12 h-12" /> : <ToggleLeft className="text-[var(--color-text)] opacity-30 w-12 h-12" />}
                                    </button>
                                </div>
                             </div>
                        ))}
                    </div>
              </div>
          )}

          {/* --- SETTINGS TAB (THEME & BRANDING) --- */}
          {activeTab === 'settings' && (
              <div className="space-y-6 animate-fade-in">
                  <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm mb-6">
                        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">General Settings</h2>
                        <p className="text-[var(--color-text)] opacity-60">Configure store identity, currency, and customized themes.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* BRANDING SECTION */}
                      <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm space-y-4">
                          <h3 className="font-bold text-[var(--color-text)] flex items-center gap-2"><Package size={18}/> Branding</h3>
                          <div>
                              <label className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase">Store Name</label>
                              <input 
                                type="text" 
                                value={siteConfig.storeName}
                                onChange={(e) => setSiteConfig({...siteConfig, storeName: e.target.value})}
                                className="w-full bg-white border border-slate-300 rounded p-2 mt-1 focus:ring-2 focus:ring-[var(--color-primary)] text-slate-900"
                              />
                          </div>
                          
                          {/* LOGO UPLOADER */}
                          <div>
                              <label className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase">Store Logo</label>
                              <div className="mt-2 flex items-start gap-4">
                                  <div className="w-20 h-20 rounded-lg bg-[var(--color-bg)] border-2 border-dashed border-[var(--color-border)] flex items-center justify-center overflow-hidden shrink-0">
                                      {siteConfig.logoUrl ? (
                                        <img src={siteConfig.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                      ) : (
                                        <ImageIcon className="text-[var(--color-text)] opacity-30" />
                                      )}
                                  </div>
                                  <div className="flex-1">
                                      <input 
                                        type="text" 
                                        placeholder="Image URL..." 
                                        className="w-full bg-white border border-slate-300 rounded p-2 text-sm mb-2 text-slate-900"
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
                                          <button className="w-full bg-[var(--color-bg)] hover:opacity-80 text-[var(--color-text)] font-bold py-2 rounded text-sm flex items-center justify-center gap-2 transition-opacity border border-[var(--color-border)]">
                                            <Upload size={14} /> Upload Image
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* CURRENCY SECTION */}
                      <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm space-y-4">
                          <h3 className="font-bold text-[var(--color-text)] flex items-center gap-2"><DollarSign size={18}/> Currency</h3>
                          <div>
                              <label className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase">Base Currency</label>
                              <select 
                                value={siteConfig.currency}
                                onChange={(e) => handleCurrencyChange(e.target.value as any)}
                                className="w-full bg-white border border-slate-300 rounded p-2 mt-1 text-slate-900"
                              >
                                  <option value="USD">USD ($) - US Dollar</option>
                                  <option value="INR">INR (₹) - Indian Rupee</option>
                                  <option value="EUR">EUR (€) - Euro</option>
                                  <option value="GBP">GBP (£) - British Pound</option>
                              </select>
                          </div>
                      </div>

                      {/* APPEARANCE SECTION - REBUILT FOR CUSTOM COLORS */}
                      <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm space-y-4 md:col-span-2">
                          <h3 className="font-bold text-[var(--color-text)] flex items-center gap-2"><Palette size={18}/> Appearance Theme</h3>
                          
                          {/* QUICK PRESETS */}
                          <div>
                              <p className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase mb-2">Quick Presets</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {[
                                        { id: 'light', label: 'Light' },
                                        { id: 'dark', label: 'Dark' },
                                        { id: 'festive', label: 'Festive' },
                                        { id: 'matrix', label: 'Matrix' },
                                    ].map(theme => (
                                        <button 
                                            key={theme.id}
                                            onClick={() => applyPresetTheme(theme.id as any)}
                                            className={`p-3 rounded-xl border-2 text-center capitalize font-bold transition-all ${siteConfig.themeMode === theme.id ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white' : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]'}`}
                                        >
                                            {theme.label}
                                        </button>
                                    ))}
                              </div>
                          </div>

                          {/* CUSTOM COLOR PICKERS */}
                          <div>
                              <p className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase mb-3">Custom Color Palette</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                                  <div>
                                      <label className="text-[10px] uppercase font-bold text-[var(--color-text)] opacity-50 block mb-1">Primary</label>
                                      <div className="flex items-center gap-2">
                                          <input type="color" value={siteConfig.colors.primary} onChange={(e) => updateThemeColor('primary', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none p-0" />
                                          <span className="text-xs font-mono text-[var(--color-text)]">{siteConfig.colors.primary}</span>
                                      </div>
                                  </div>
                                   <div>
                                      <label className="text-[10px] uppercase font-bold text-[var(--color-text)] opacity-50 block mb-1">Background</label>
                                      <div className="flex items-center gap-2">
                                          <input type="color" value={siteConfig.colors.background} onChange={(e) => updateThemeColor('background', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none p-0" />
                                          <span className="text-xs font-mono text-[var(--color-text)]">{siteConfig.colors.background}</span>
                                      </div>
                                  </div>
                                  <div>
                                      <label className="text-[10px] uppercase font-bold text-[var(--color-text)] opacity-50 block mb-1">Card / Panel</label>
                                      <div className="flex items-center gap-2">
                                          <input type="color" value={siteConfig.colors.card} onChange={(e) => updateThemeColor('card', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none p-0" />
                                          <span className="text-xs font-mono text-[var(--color-text)]">{siteConfig.colors.card}</span>
                                      </div>
                                  </div>
                                  <div>
                                      <label className="text-[10px] uppercase font-bold text-[var(--color-text)] opacity-50 block mb-1">Text Color</label>
                                      <div className="flex items-center gap-2">
                                          <input type="color" value={siteConfig.colors.text} onChange={(e) => updateThemeColor('text', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none p-0" />
                                          <span className="text-xs font-mono text-[var(--color-text)]">{siteConfig.colors.text}</span>
                                      </div>
                                  </div>
                                  <div>
                                      <label className="text-[10px] uppercase font-bold text-[var(--color-text)] opacity-50 block mb-1">Sidebar</label>
                                      <div className="flex items-center gap-2">
                                          <input type="color" value={siteConfig.colors.sidebar} onChange={(e) => updateThemeColor('sidebar', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none p-0" />
                                          <span className="text-xs font-mono text-[var(--color-text)]">{siteConfig.colors.sidebar}</span>
                                      </div>
                                  </div>
                                  <div>
                                      <label className="text-[10px] uppercase font-bold text-[var(--color-text)] opacity-50 block mb-1">Border</label>
                                      <div className="flex items-center gap-2">
                                          <input type="color" value={siteConfig.colors.border} onChange={(e) => updateThemeColor('border', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none p-0" />
                                          <span className="text-xs font-mono text-[var(--color-text)]">{siteConfig.colors.border}</span>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          )}
       </div>

      {/* --- ADD NEW DELIVERY SERVICE MODAL --- */}
      {isProviderFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[var(--color-card)] p-6 rounded-2xl w-full max-w-md shadow-2xl animate-scale-up border border-[var(--color-border)]">
                 <div className="flex justify-between items-center mb-6 border-b border-[var(--color-border)] pb-4">
                    <h3 className="font-bold text-xl text-[var(--color-text)]">Add Delivery Integration</h3>
                    <button onClick={() => setIsProviderFormOpen(false)} className="p-2 bg-[var(--color-bg)] rounded-full hover:opacity-80 text-[var(--color-text)] opacity-50"><X size={20}/></button>
                </div>
                <form onSubmit={handleAddProvider} className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-[var(--color-text)]">Service Name</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="e.g., HyperLocal Drone"
                            className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 mt-1 text-slate-900"
                            value={providerForm.name} 
                            onChange={e => setProviderForm({...providerForm, name: e.target.value})} 
                        />
                    </div>
                    {/* ... (rest of provider form inputs) ... */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="text-sm font-bold text-[var(--color-text)]">Base Rate</label>
                             <input 
                                type="number" 
                                required 
                                min="0"
                                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 mt-1 text-slate-900"
                                value={providerForm.baseRate} 
                                onChange={e => setProviderForm({...providerForm, baseRate: parseFloat(e.target.value)})} 
                             />
                        </div>
                         <div>
                             <label className="text-sm font-bold text-[var(--color-text)]">Per KM Rate</label>
                             <input 
                                type="number" 
                                required 
                                min="0" step="0.1"
                                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 mt-1 text-slate-900"
                                value={providerForm.perKmRate} 
                                onChange={e => setProviderForm({...providerForm, perKmRate: parseFloat(e.target.value)})} 
                             />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-[var(--color-text)]">Speed Label</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="e.g., 30-45 Mins"
                            className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 mt-1 text-slate-900"
                            value={providerForm.speedLabel} 
                            onChange={e => setProviderForm({...providerForm, speedLabel: e.target.value})} 
                        />
                    </div>
                    <button type="submit" className="w-full bg-[var(--color-primary)] text-white font-bold py-3 rounded-lg hover:opacity-90 mt-2">
                        Create Service
                    </button>
                </form>
            </div>
          </div>
      )}

      {/* --- ADD/EDIT PRODUCT MODAL --- */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[var(--color-card)] p-6 rounded-2xl w-full max-w-2xl shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto border border-[var(--color-border)]">
                <div className="flex justify-between items-center mb-6 border-b border-[var(--color-border)] pb-4">
                    <h3 className="font-bold text-xl text-[var(--color-text)]">{editingId ? 'Edit Product' : 'New Product'}</h3>
                    <button onClick={resetForm} className="p-2 bg-[var(--color-bg)] rounded-full hover:opacity-80 text-[var(--color-text)] opacity-50"><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--color-text)]">Name</label>
                        <input type="text" required className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--color-text)]">Category</label>
                        <select className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--color-text)]">Price ({siteConfig.currencySymbol})</label>
                        <input type="number" required min="0" step="0.01" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[var(--color-text)]">Stock</label>
                        <input type="number" required min="0" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-[var(--color-text)]">Image URL</label>
                        <div className="flex gap-2">
                             <input type="text" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-900" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                             <button type="button" onClick={() => setFormData({...formData, image: `https://picsum.photos/400/400?random=${Date.now()}`})} className="bg-[var(--color-bg)] px-3 rounded border border-[var(--color-border)] text-[var(--color-text)]"><RefreshCw size={16}/></button>
                        </div>
                    </div>
                    <div className="md:col-span-2 pt-4 flex justify-end gap-3 border-t border-[var(--color-border)]">
                        <button type="button" onClick={resetForm} className="px-6 py-2 text-[var(--color-text)] opacity-70 hover:opacity-100 rounded-lg font-medium">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-[var(--color-primary)] text-white font-bold rounded-lg hover:opacity-90 flex items-center gap-2"><Save size={18} /> Save</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
