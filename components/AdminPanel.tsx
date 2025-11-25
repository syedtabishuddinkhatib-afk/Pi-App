
import React, { useState } from 'react';
import { Product, SiteConfig, PaymentSettings, DeliveryProviderConfig, ThemeColors, DatabaseConfig, CustomerLead, MarketingConfig } from '../types';
import { Trash2, Plus, Image as ImageIcon, Save, X, Pen, RefreshCw, Package, Megaphone, CreditCard, DollarSign, Layout, MonitorPlay, ToggleLeft, ToggleRight, Smartphone, Truck, Settings, Upload, List, Globe, BarChart3, Radio, Share2, MapPin, Users, Send, Loader2, Palette, Database, Server, Terminal, ShieldCheck, Mail, Download, Key, AtSign, CheckSquare, Square } from 'lucide-react';
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
  customers: CustomerLead[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  products, setProducts, 
  categories, setCategories,
  siteConfig, setSiteConfig,
  paymentSettings, setPaymentSettings,
  deliveryProviders, setDeliveryProviders,
  customers
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'marketing' | 'payments' | 'delivery' | 'settings' | 'integrations' | 'system'>('inventory');
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
  const [dbStatus, setDbStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');

  // --- CAMPAIGN STATE ---
  const [campaignMessage, setCampaignMessage] = useState('');
  const [campaignMedia, setCampaignMedia] = useState('');
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set());

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

  const updateDatabase = (field: keyof DatabaseConfig, value: any) => {
      setSiteConfig(prev => ({
          ...prev,
          database: {
              ...prev.database,
              [field]: value
          }
      }));
  };

  const updateMarketing = (field: keyof MarketingConfig, value: any) => {
    setSiteConfig(prev => ({
        ...prev,
        marketing: {
            ...prev.marketing,
            [field]: value
        }
    }));
  };

  const handleTestDbConnection = () => {
    setDbStatus('connecting');
    setTimeout(() => {
        // Simulate success connection
        setDbStatus('connected');
    }, 2500);
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

  // --- MARKETING LEAD SELECTION LOGIC ---
  const toggleCustomerSelection = (id: string) => {
    const newSelection = new Set(selectedCustomerIds);
    if (newSelection.has(id)) {
        newSelection.delete(id);
    } else {
        newSelection.add(id);
    }
    setSelectedCustomerIds(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedCustomerIds.size === customers.length) {
        setSelectedCustomerIds(new Set());
    } else {
        setSelectedCustomerIds(new Set(customers.map(c => c.id)));
    }
  };

  const handleSendCampaign = () => {
      if (!campaignMessage || selectedCustomerIds.size === 0) return;
      setSendingCampaign(true);
      setTimeout(() => {
          setSendingCampaign(false);
          setCampaignMessage('');
          setCampaignMedia('');
          alert(`Success! Message sent to ${selectedCustomerIds.size} leads via ${siteConfig.marketing.provider === 'twilio' ? 'Twilio API' : 'WhatsApp Cloud API'}.`);
      }, 2000);
  };

  const handleDownloadCsv = () => {
      const headers = ['ID', 'Name', 'Email', 'Phone', 'Total Spent'];
      const rows = customers.map(c => [c.id, c.name, c.email, c.phone, c.totalSpent].join(','));
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "customer_leads.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
             { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
             { id: 'system', label: 'System & DB', icon: <Server size={20} /> }
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

          {/* --- MARKETING TAB --- */}
          {activeTab === 'marketing' && (
              <div className="space-y-6 animate-fade-in">
                  
                  {/* CAMPAIGN CONFIGURATION (PROVIDERS) */}
                  <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm">
                      <h3 className="font-bold text-[var(--color-text)] flex items-center gap-2 mb-4"><Settings size={20} className="text-[var(--color-primary)]"/> Campaign Configuration</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-3">
                               <label className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase flex items-center gap-2"><Smartphone size={14}/> WhatsApp API Provider</label>
                               <select 
                                  value={siteConfig.marketing.provider}
                                  onChange={(e) => updateMarketing('provider', e.target.value)}
                                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900"
                               >
                                  <option value="twilio">Twilio (Recommended)</option>
                                  <option value="interakt">Interakt / Gupshup</option>
                                  <option value="meta_cloud">Meta Cloud API (Direct)</option>
                               </select>

                               <label className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase mt-2 block">Sender Phone Number</label>
                               <input 
                                  type="text" 
                                  value={siteConfig.marketing.whatsappNumber}
                                  onChange={(e) => updateMarketing('whatsappNumber', e.target.value)}
                                  placeholder="+1 555 0123"
                                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono"
                               />
                           </div>
                           <div className="space-y-3">
                               <label className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase flex items-center gap-2"><AtSign size={14}/> Email SMTP Provider</label>
                               <select 
                                  value={siteConfig.marketing.emailProvider}
                                  onChange={(e) => updateMarketing('emailProvider', e.target.value)}
                                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900"
                               >
                                  <option value="sendgrid">SendGrid</option>
                                  <option value="ses">AWS SES</option>
                                  <option value="smtp">Custom SMTP</option>
                               </select>
                               
                               <label className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase mt-2 block">Sender Email Address</label>
                               <input 
                                  type="text" 
                                  value={siteConfig.marketing.emailFrom}
                                  onChange={(e) => updateMarketing('emailFrom', e.target.value)}
                                  placeholder="marketing@pishop.ai"
                                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono"
                               />
                           </div>
                      </div>
                  </div>

                  {/* CAMPAIGN MANAGER */}
                  <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm">
                      <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                              <Megaphone size={24} />
                          </div>
                          <div>
                             <h2 className="text-xl font-bold text-[var(--color-text)]">Campaign Composer</h2>
                             <p className="text-[var(--color-text)] opacity-60">Selected Recipients: <strong>{selectedCustomerIds.size}</strong></p>
                          </div>
                      </div>
                      <div className="space-y-3">
                          <textarea 
                             className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                             rows={3}
                             placeholder="Write your message here... (e.g. 'Flash Sale! 20% off all Raspberry Pi cases this weekend!')"
                             value={campaignMessage}
                             onChange={(e) => setCampaignMessage(e.target.value)}
                          />
                          
                          {/* MEDIA ATTACHMENT */}
                          <div className="flex items-center gap-3">
                              <div className="flex-1 relative">
                                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                      <ImageIcon size={16} className="text-slate-400" />
                                  </div>
                                  <input 
                                      type="text" 
                                      placeholder="Paste Image/Video URL to attach..."
                                      value={campaignMedia}
                                      onChange={(e) => setCampaignMedia(e.target.value)}
                                      className="w-full pl-10 bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-sm"
                                  />
                              </div>
                          </div>

                          <div className="flex justify-between items-center pt-2">
                             <p className="text-xs text-[var(--color-text)] opacity-50">Sending from: {siteConfig.marketing.whatsappNumber}</p>
                             <button 
                                onClick={handleSendCampaign}
                                disabled={!campaignMessage || sendingCampaign || selectedCustomerIds.size === 0}
                                className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 flex items-center gap-2 disabled:opacity-50 transition-all"
                             >
                                {sendingCampaign ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                Send Campaign
                             </button>
                          </div>
                      </div>
                  </div>

                  {/* CUSTOMER DATA CRM - NOW SELECTABLE */}
                  <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                           <h3 className="font-bold text-[var(--color-text)] flex items-center gap-2"><Users size={20} className="text-[var(--color-primary)]"/> Lead CRM</h3>
                           <button onClick={handleDownloadCsv} className="text-xs bg-[var(--color-bg)] border border-[var(--color-border)] px-3 py-1.5 rounded flex items-center gap-2 hover:bg-slate-100 font-bold text-[var(--color-text)]">
                               <Download size={14} /> Export CSV
                           </button>
                      </div>
                      
                      {customers.length === 0 ? (
                          <div className="text-center py-8 text-[var(--color-text)] opacity-50 border-2 border-dashed border-[var(--color-border)] rounded-xl">
                              <p>No customer data collected yet.</p>
                          </div>
                      ) : (
                          <div className="overflow-x-auto">
                              <table className="w-full text-left text-sm text-[var(--color-text)]">
                                  <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                                      <tr>
                                          <th className="p-3 w-10">
                                              <button onClick={toggleSelectAll} className="hover:text-[var(--color-primary)]">
                                                  {selectedCustomerIds.size === customers.length && customers.length > 0 ? <CheckSquare size={18}/> : <Square size={18}/>}
                                              </button>
                                          </th>
                                          <th className="p-3 opacity-60">Name</th>
                                          <th className="p-3 opacity-60">Contact</th>
                                          <th className="p-3 opacity-60">Total Spent</th>
                                          <th className="p-3 opacity-60">Last Order</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[var(--color-border)]">
                                      {customers.map(c => (
                                          <tr key={c.id} className={selectedCustomerIds.has(c.id) ? 'bg-[var(--color-primary)]/5' : ''}>
                                              <td className="p-3">
                                                  <button onClick={() => toggleCustomerSelection(c.id)} className={selectedCustomerIds.has(c.id) ? 'text-[var(--color-primary)]' : 'text-slate-400'}>
                                                      {selectedCustomerIds.has(c.id) ? <CheckSquare size={18}/> : <Square size={18}/>}
                                                  </button>
                                              </td>
                                              <td className="p-3 font-bold">{c.name}</td>
                                              <td className="p-3">
                                                  <div className="flex flex-col">
                                                      <span>{c.email}</span>
                                                      <span className="opacity-60 text-xs">{c.phone}</span>
                                                  </div>
                                              </td>
                                              <td className="p-3 font-mono">{siteConfig.currencySymbol}{c.totalSpent.toFixed(2)}</td>
                                              <td className="p-3 opacity-60 text-xs">{new Date(c.lastOrderDate).toLocaleDateString()}</td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      )}
                  </div>

                  {/* COMMUNITY LINKS */}
                  <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm">
                      <h3 className="font-bold text-[var(--color-text)] mb-4 flex items-center gap-2"><Share2 size={20} className="text-[var(--color-primary)]"/> Social Links</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                              <label className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase flex items-center gap-1 mb-2">
                                  <Smartphone size={14} className="text-green-500" /> WhatsApp Group Link
                              </label>
                              <input 
                                  type="text" 
                                  value={siteConfig.community.whatsapp}
                                  onChange={(e) => updateCommunity('whatsapp', e.target.value)}
                                  className="w-full bg-white border border-slate-300 rounded p-3 text-slate-900"
                              />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase flex items-center gap-1 mb-2">
                                  <Send size={14} className="text-blue-500" /> Telegram Channel Link
                              </label>
                              <input 
                                  type="text" 
                                  value={siteConfig.community.telegram}
                                  onChange={(e) => updateCommunity('telegram', e.target.value)}
                                  className="w-full bg-white border border-slate-300 rounded p-3 text-slate-900"
                              />
                           </div>
                      </div>
                  </div>

                  {/* Existing Ads Config... */}
                  <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm">
                       <h3 className="font-bold text-[var(--color-text)] mb-4 flex items-center gap-2"><MonitorPlay size={20} className="text-[var(--color-primary)]"/> Homepage Video Ad</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase">Ad Title</label>
                                <input type="text" value={siteConfig.videoAd.title} onChange={(e) => updateVideoAd('title', e.target.value)} className="w-full bg-white border border-slate-300 rounded p-2 mt-1 text-slate-900" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase">Thumbnail URL</label>
                                <input type="text" value={siteConfig.videoAd.imageUrl} onChange={(e) => updateVideoAd('imageUrl', e.target.value)} className="w-full bg-white border border-slate-300 rounded p-2 mt-1 text-slate-900" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase">Subtitle</label>
                                <textarea value={siteConfig.videoAd.subtitle} onChange={(e) => updateVideoAd('subtitle', e.target.value)} className="w-full bg-white border border-slate-300 rounded p-2 mt-1 text-slate-900 h-20" />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={siteConfig.videoAd.enabled} onChange={(e) => updateVideoAd('enabled', e.target.checked)} className="w-5 h-5 accent-[var(--color-primary)]" />
                                <span className="font-bold text-[var(--color-text)]">Enable Video Section</span>
                            </div>
                       </div>
                  </div>
              </div>
          )}

          {/* --- PAYMENTS TAB (VISIBILITY FIXED) --- */}
          {activeTab === 'payments' && (
             <div className="space-y-6 animate-fade-in">
                 <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm mb-6">
                      <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">Payment Gateways</h2>
                      <p className="text-[var(--color-text)] opacity-60">Enable and configure payment methods for checkout.</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentSettings.gateways.map(gateway => (
                        <div key={gateway.id} className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[var(--color-bg)] rounded-lg text-[var(--color-text)]"><CreditCard size={24} /></div>
                                <div>
                                    <h3 className="font-bold text-[var(--color-text)]">{gateway.name}</h3>
                                    <p className="text-xs text-[var(--color-text)] opacity-60 uppercase">{gateway.type}</p>
                                </div>
                            </div>
                            <button onClick={() => toggleGateway(gateway.id)}>
                                {gateway.enabled ? <ToggleRight className="text-[var(--color-primary)] w-12 h-12" /> : <ToggleLeft className="text-[var(--color-text)] opacity-30 w-12 h-12" />}
                            </button>
                        </div>
                    ))}
                 </div>
                 
                 <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm mt-6">
                      <h3 className="font-bold text-[var(--color-text)] mb-4 flex items-center gap-2"><Key size={20} className="text-[var(--color-primary)]"/> API Configuration</h3>
                      <div className="space-y-4">
                           <div>
                               <label className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase">Razorpay Key ID</label>
                               <input type="password" placeholder="rzp_live_xxxxxxxx" className="w-full bg-white border border-slate-300 rounded p-2 mt-1 text-slate-900" />
                           </div>
                           <div>
                               <label className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase">Stripe Publishable Key</label>
                               <input type="password" placeholder="pk_live_xxxxxxxx" className="w-full bg-white border border-slate-300 rounded p-2 mt-1 text-slate-900" />
                           </div>
                      </div>
                 </div>
             </div>
          )}

          {/* --- INTEGRATIONS TAB (VISIBILITY FIXED) --- */}
          {activeTab === 'integrations' && (
             <div className="space-y-6 animate-fade-in">
                 <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm mb-6">
                      <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">External Integrations</h2>
                      <p className="text-[var(--color-text)] opacity-60">Connect Google Analytics, AdSense, and Meta Pixel.</p>
                 </div>

                 <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm space-y-4">
                      <h3 className="font-bold text-[var(--color-text)] flex items-center gap-2"><Globe size={20} className="text-blue-500"/> Google Services</h3>
                      <div>
                          <label className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase">Google Analytics 4 Measurement ID</label>
                          <input 
                             type="text" 
                             value={siteConfig.integrations.googleAnalyticsId} 
                             onChange={(e) => updateIntegration('googleAnalyticsId', e.target.value)}
                             placeholder="G-XXXXXXXXXX"
                             className="w-full bg-white border border-slate-300 rounded p-2 mt-1 text-slate-900"
                          />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase">Google AdSense Publisher ID</label>
                          <input 
                             type="text" 
                             value={siteConfig.integrations.adSenseId} 
                             onChange={(e) => updateIntegration('adSenseId', e.target.value)}
                             placeholder="pub-XXXXXXXXXXXXXXXX"
                             className="w-full bg-white border border-slate-300 rounded p-2 mt-1 text-slate-900"
                          />
                      </div>
                 </div>

                 <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm space-y-4">
                      <h3 className="font-bold text-[var(--color-text)] flex items-center gap-2"><Share2 size={20} className="text-indigo-500"/> Meta (Facebook) Business</h3>
                      <div>
                          <label className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase">Meta Pixel ID</label>
                          <input 
                             type="text" 
                             value={siteConfig.integrations.metaPixelId} 
                             onChange={(e) => updateIntegration('metaPixelId', e.target.value)}
                             placeholder="1234567890"
                             className="w-full bg-white border border-slate-300 rounded p-2 mt-1 text-slate-900"
                          />
                      </div>
                      <div className="pt-4 border-t border-[var(--color-border)]">
                          <button 
                             onClick={handleSocialSync}
                             disabled={isSyncing || !siteConfig.integrations.metaPixelId}
                             className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
                          >
                             {isSyncing ? <Loader2 className="animate-spin" size={16}/> : <RefreshCw size={16} />}
                             Sync Catalog to Meta
                          </button>
                          {lastSyncResult && <p className="mt-2 text-xs font-mono bg-[var(--color-bg)] p-2 rounded">{lastSyncResult}</p>}
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

          {/* --- SYSTEM TAB (Database & Server) --- */}
          {activeTab === 'system' && (
              <div className="space-y-6 animate-fade-in">
                  <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm mb-6">
                        <div className="flex items-center gap-4">
                             <div className="p-3 bg-slate-100 rounded-lg text-slate-600"><Database size={32} /></div>
                             <div>
                                <h2 className="text-2xl font-bold text-[var(--color-text)]">System Configuration</h2>
                                <p className="text-[var(--color-text)] opacity-60">Configure PostgreSQL Backend and Raspberry Pi Server settings.</p>
                             </div>
                        </div>
                  </div>
                  
                  {/* ADMIN SECURITY SECTION */}
                  <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm border-l-4 border-l-red-500">
                      <h3 className="font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                          <ShieldCheck size={20} className="text-red-500" /> Admin Security
                      </h3>
                      <div className="flex items-center gap-4">
                          <div className="flex-1">
                              <label className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase">Admin Login Password</label>
                              <input 
                                  type="text" 
                                  value={siteConfig.database.adminPassword}
                                  onChange={(e) => updateDatabase('adminPassword', e.target.value)}
                                  className="w-full bg-white border border-slate-300 rounded p-2 mt-1 text-slate-900 font-mono"
                              />
                          </div>
                          <div className="flex-1">
                              <p className="text-xs text-[var(--color-text)] opacity-60 mt-6">
                                  <strong>Important:</strong> Changing this password will require you to log in again with the new credentials. Ensure it is strong.
                              </p>
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm">
                           <h3 className="font-bold text-[var(--color-text)] mb-6 flex items-center gap-2 border-b border-[var(--color-border)] pb-2">
                               <Server size={20} className="text-[var(--color-primary)]" /> PostgreSQL Connection
                           </h3>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase">Host IP</label>
                                    <input 
                                        type="text" 
                                        value={siteConfig.database.host}
                                        onChange={(e) => updateDatabase('host', e.target.value)}
                                        placeholder="127.0.0.1 or 192.168.x.x"
                                        className="w-full bg-white border border-slate-300 rounded p-2 mt-1 text-slate-900 font-mono text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase">Port</label>
                                    <input 
                                        type="text" 
                                        value={siteConfig.database.port}
                                        onChange={(e) => updateDatabase('port', e.target.value)}
                                        placeholder="5432"
                                        className="w-full bg-white border border-slate-300 rounded p-2 mt-1 text-slate-900 font-mono text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase">Database Name</label>
                                    <input 
                                        type="text" 
                                        value={siteConfig.database.databaseName}
                                        onChange={(e) => updateDatabase('databaseName', e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded p-2 mt-1 text-slate-900 font-mono text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase">Username</label>
                                    <input 
                                        type="text" 
                                        value={siteConfig.database.username}
                                        onChange={(e) => updateDatabase('username', e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded p-2 mt-1 text-slate-900 font-mono text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-[var(--color-text)] opacity-60 uppercase">Password</label>
                                    <input 
                                        type="password" 
                                        value={siteConfig.database.password || ''}
                                        onChange={(e) => updateDatabase('password', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-white border border-slate-300 rounded p-2 mt-1 text-slate-900 font-mono text-sm"
                                    />
                                </div>
                                <div className="flex flex-col justify-end">
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 text-sm text-[var(--color-text)] cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={siteConfig.database.ssl}
                                                onChange={(e) => updateDatabase('ssl', e.target.checked)}
                                                className="w-4 h-4" 
                                            />
                                            SSL Mode
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-[var(--color-text)] cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={siteConfig.database.autoMigrate}
                                                onChange={(e) => updateDatabase('autoMigrate', e.target.checked)}
                                                className="w-4 h-4" 
                                            />
                                            Auto-Migrate Schema
                                        </label>
                                    </div>
                                </div>
                           </div>

                           <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex items-center gap-4">
                                <button 
                                    onClick={handleTestDbConnection}
                                    disabled={dbStatus === 'connecting'}
                                    className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {dbStatus === 'connecting' ? <Loader2 className="animate-spin" /> : <Terminal size={18} />}
                                    Test Connection & Initialize
                                </button>
                                {dbStatus === 'connected' && (
                                    <span className="text-green-600 font-bold flex items-center gap-2 animate-fade-in">
                                        <ShieldCheck size={20} /> Connection Successful. Schema Migrated.
                                    </span>
                                )}
                           </div>
                      </div>

                      <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm h-fit">
                           <h3 className="font-bold text-[var(--color-text)] mb-4">Setup Instructions</h3>
                           <div className="text-sm text-[var(--color-text)] opacity-70 space-y-4 leading-relaxed">
                               <p>
                                   To enable persistent storage, install PostgreSQL on your Raspberry Pi:
                               </p>
                               <code className="block bg-[var(--color-bg)] p-3 rounded font-mono text-xs border border-[var(--color-border)]">
                                   sudo apt update<br/>
                                   sudo apt install postgresql<br/>
                                   sudo -u postgres psql
                               </code>
                               <p>
                                   Once connected, create the database user and grant permissions. The "Auto-Migrate" feature will handle table creation and indexing for:
                               </p>
                               <ul className="list-disc pl-4 space-y-1">
                                   <li>Products & Categories</li>
                                   <li>User Profiles</li>
                                   <li>Order History</li>
                                   <li>Analytics Logs</li>
                               </ul>
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
