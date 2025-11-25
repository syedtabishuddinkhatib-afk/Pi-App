
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Facebook, Instagram, TrendingUp, Share2, DollarSign, Globe, ArrowLeft, Lock, X, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchGoogleAnalyticsData, fetchAdSenseData, fetchCombinedAnalytics } from '../services/analyticsApi';
import { SiteConfig, SalesData } from '../types';

interface DashboardProps {
    currencySymbol: string;
    siteConfig: SiteConfig;
}

const Dashboard: React.FC<DashboardProps> = ({ currencySymbol, siteConfig }) => {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginStep, setLoginStep] = useState<'form' | 'processing'>('form');

  // Dynamic Data States
  const [impressionData, setImpressionData] = useState<{val: number, label: string} | null>(null);
  const [revenueData, setRevenueData] = useState<{val: number, source: string} | null>(null);
  const [chartData, setChartData] = useState<SalesData[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // FETCH ANALYTICS DATA
  useEffect(() => {
    const loadData = async () => {
        setIsLoadingAnalytics(true);
        try {
            // 1. Fetch Chart Data (Blends internal + AdSense if available)
            const combinedData = await fetchCombinedAnalytics(siteConfig.integrations);
            setChartData(combinedData);

            // 2. Fetch Google Impressions
            if (siteConfig.integrations.googleAnalyticsId) {
                const gaData = await fetchGoogleAnalyticsData(siteConfig.integrations);
                setImpressionData({ val: gaData.impressions, label: 'Live from GA4' });
            } else {
                setImpressionData(null); // Reset if disconnected
            }

            // 3. Fetch AdSense Revenue
            if (siteConfig.integrations.adSenseId) {
                const adData = await fetchAdSenseData(siteConfig.integrations);
                setRevenueData({ val: adData.adRevenue, source: 'Google AdSense' });
            } else {
                setRevenueData(null);
            }

        } catch (error) {
            console.error("Analytics Load Error", error);
        } finally {
            setIsLoadingAnalytics(false);
        }
    };

    loadData();
  }, [siteConfig.integrations]);


  const initiateSync = () => {
    if (syncStatus === 'idle') {
      setShowLoginModal(true);
      setLoginStep('form');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginStep('processing');
    
    // Simulate Authentication Delay
    setTimeout(() => {
      setShowLoginModal(false);
      setSyncStatus('syncing');
      
      // Simulate Data Syncing
      setTimeout(() => {
        setSyncStatus('synced');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-900">Social Center</h2>
           <p className="text-slate-500 mt-1">Manage your Raspberry Pi hosted empire.</p>
        </div>
        <Link to="/admin" className="text-slate-500 hover:text-indigo-600 font-medium flex items-center gap-2 transition-colors">
            <ArrowLeft size={18} /> Back to Inventory
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg text-green-600"><DollarSign size={20} /></div>
            <span className="text-slate-500 text-sm font-medium">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{currencySymbol}24,592.00</p>
          <p className="text-xs text-green-600 flex items-center mt-1"><TrendingUp size={12} className="mr-1"/> +12.5%</p>
        </div>
        
        {/* GOOGLE IMPRESSIONS CARD */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
           <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Globe size={20} /></div>
            <span className="text-slate-500 text-sm font-medium">Google Impressions</span>
          </div>
          
          {isLoadingAnalytics ? (
              <div className="flex items-center gap-2 text-slate-400 mt-2">
                  <Loader2 size={16} className="animate-spin" /> Fetching...
              </div>
          ) : impressionData ? (
              <>
                <p className="text-2xl font-bold text-slate-900">{(impressionData.val / 1000).toFixed(1)}k</p>
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> {impressionData.label}
                </p>
              </>
          ) : (
              <div>
                  <p className="text-lg font-bold text-slate-300">--</p>
                  <Link to="/admin" className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1 mt-1">
                      <AlertCircle size={10} /> Connect GA4
                  </Link>
              </div>
          )}
        </div>

         {/* AD REVENUE CARD */}
         <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
           <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Share2 size={20} /></div>
            <span className="text-slate-500 text-sm font-medium">Ad Income</span>
          </div>
          
          {isLoadingAnalytics ? (
               <div className="flex items-center gap-2 text-slate-400 mt-2">
                  <Loader2 size={16} className="animate-spin" /> Fetching...
              </div>
          ) : revenueData ? (
              <>
                 <p className="text-2xl font-bold text-slate-900">{currencySymbol}{revenueData.val.toFixed(2)}</p>
                 <p className="text-xs text-slate-400 mt-1">via {revenueData.source}</p>
              </>
          ) : (
             <div>
                  <p className="text-lg font-bold text-slate-300">--</p>
                  <Link to="/admin" className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1 mt-1">
                      <AlertCircle size={10} /> Connect AdSense
                  </Link>
              </div>
          )}
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue Streams</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.length > 0 ? chartData : []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${currencySymbol}${value}`} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f1f5f9' }}
              />
              <Legend />
              <Bar dataKey="revenue" name="Product Sales" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ads" name="Ad Revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Social Integration */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full transform translate-x-10 -translate-y-10"></div>
        
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2">Multi-Channel Sync</h3>
          <p className="text-indigo-100 mb-6 max-w-lg">
            Automatically list your Raspberry Pi hosted inventory on Facebook Marketplace and Instagram Shop. 
            Expand your reach instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20">
              <Facebook className="text-blue-300" />
              <div>
                <p className="font-semibold text-sm">Facebook Shop</p>
                <p className="text-xs text-indigo-200">
                    {syncStatus === 'synced' ? 'Connected & Active' : 'Ready to Connect'}
                </p>
              </div>
            </div>

             <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20">
              <Instagram className="text-pink-300" />
              <div>
                <p className="font-semibold text-sm">Instagram Shopping</p>
                <p className="text-xs text-indigo-200">
                    {syncStatus === 'synced' ? 'Connected & Active' : 'Ready to Connect'}
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={initiateSync}
            disabled={syncStatus !== 'idle'}
            className="mt-8 bg-white text-indigo-600 px-6 py-3 rounded-lg font-bold hover:bg-indigo-50 transition-colors disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {syncStatus === 'idle' && <><Share2 size={18} /> Connect Accounts</>}
            {syncStatus === 'syncing' && 'Syncing Catalog...'}
            {syncStatus === 'synced' && 'Catalog Synced Successfully!'}
          </button>
        </div>
      </div>

      {/* META LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up relative">
            
            {loginStep === 'form' ? (
              <>
                <div className="bg-[#1877F2] p-4 flex justify-between items-center text-white">
                  <h3 className="font-bold flex items-center gap-2">
                    <Facebook size={20} /> Login with Facebook
                  </h3>
                  <button onClick={() => setShowLoginModal(false)} className="hover:bg-white/20 rounded p-1">
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
                  <p className="text-slate-600 text-sm">
                    Enter your Meta Business credentials to authorize <strong>PiShop AI</strong> to manage your catalogs.
                  </p>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Email or Phone</label>
                    <input 
                      type="text" 
                      required
                      placeholder="business@example.com"
                      className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#1877F2] outline-none" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#1877F2] outline-none" 
                    />
                  </div>
                  
                  <div className="pt-2">
                    <button 
                      type="submit"
                      className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold py-3 rounded-lg transition-colors"
                    >
                      Log In
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
                      <Lock size={12} /> Secure OAuth 2.0 Connection
                    </p>
                  </div>
                </form>
              </>
            ) : (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 border-4 border-slate-200 border-t-[#1877F2] rounded-full animate-spin mb-6"></div>
                 <h3 className="font-bold text-xl text-slate-800">Verifying Credentials...</h3>
                 <p className="text-slate-500 mt-2">Please wait while we connect to Meta Graph API.</p>
              </div>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
