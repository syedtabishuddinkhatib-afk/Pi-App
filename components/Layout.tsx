import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Home, LayoutDashboard, Menu, X, Bot, Lock, Unlock, LogOut, Package, User as UserIcon, LogIn, Facebook, Mail } from 'lucide-react';
import { SiteConfig, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  cartCount: number;
  isAdmin: boolean;
  user: User | null;
  onAdminLogin: () => void;
  onAdminLogout: () => void;
  onUserLogin: (provider: 'google' | 'facebook') => void;
  onUserLogout: () => void;
  siteConfig: SiteConfig;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, cartCount, isAdmin, user, 
  onAdminLogin, onAdminLogout, onUserLogin, onUserLogout, 
  siteConfig 
}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // Modals
  const [isAdminModalOpen, setAdminModalOpen] = useState(false);
  const [isUserLoginModalOpen, setUserLoginModalOpen] = useState(false);
  
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const location = useLocation();

  // Public Navigation Items
  const navItems = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    { name: 'Cart', path: '/cart', icon: <ShoppingBag size={20} /> },
  ];

  // Admin Only Items
  const adminItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Admin', path: '/admin', icon: <Package size={20} /> },
  ];

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin123') {
      onAdminLogin();
      setAdminModalOpen(false);
      setPasswordInput('');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleUserAuth = (provider: 'google' | 'facebook') => {
    onUserLogin(provider);
    setUserLoginModalOpen(false);
  };

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const handleScroll = () => {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
            setShowHeader(false);
        } else {
            setShowHeader(true);
        }
        setLastScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setSidebarOpen(false);
  }, [location.pathname]);

  // Dynamic Theme Classes
  const getThemeClasses = () => {
    switch(siteConfig.theme) {
        case 'dark': return 'bg-slate-900 text-slate-100';
        case 'festive': return 'bg-red-50 text-slate-900';
        case 'seasonal': return 'bg-orange-50 text-slate-900';
        default: return 'bg-slate-50 text-slate-900';
    }
  };

  const themeClass = getThemeClasses();
  const headerClass = siteConfig.theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200';
  const logoColor = siteConfig.theme === 'festive' ? 'bg-red-600' : 'bg-indigo-600';

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${themeClass}`}>
      
      {/* HEADER */}
      <header className={`fixed top-0 left-0 right-0 backdrop-blur-md border-b z-40 transition-all duration-300 ${headerClass} ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg dark:hover:bg-slate-800">
                    <Menu size={24} />
                </button>
                <Link to="/" className="text-xl font-bold flex items-center gap-2">
                    {/* DYNAMIC LOGO LOGIC */}
                    {siteConfig.logoUrl ? (
                      <img src={siteConfig.logoUrl} alt="Store Logo" className="h-10 w-auto object-contain rounded-md" />
                    ) : (
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${logoColor}`}>
                          <span className="font-mono font-bold">Pi</span>
                      </div>
                    )}
                    <span className={siteConfig.theme === 'dark' ? 'text-white' : 'text-slate-900'}>{siteConfig.storeName}</span>
                </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-6">
                {navItems.map(item => (
                    <Link key={item.path} to={item.path} className={`flex items-center gap-2 text-sm font-medium transition-colors ${location.pathname === item.path ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}>
                        {item.icon} {item.name}
                    </Link>
                ))}
                {isAdmin && adminItems.map(item => (
                     <Link key={item.path} to={item.path} className={`flex items-center gap-2 text-sm font-medium transition-colors ${location.pathname === item.path ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}>
                        {item.icon} {item.name}
                    </Link>
                ))}
            </nav>

            <div className="flex items-center gap-3">
                 {/* User Login / Profile */}
                 {user ? (
                   <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 py-1.5 px-3 rounded-full">
                      {user.avatar ? (
                        <img src={user.avatar} alt="User" className="w-6 h-6 rounded-full" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 hidden md:block">{user.name}</span>
                      <button onClick={onUserLogout} className="ml-2 text-slate-400 hover:text-red-500"><LogOut size={14} /></button>
                   </div>
                 ) : (
                   <button 
                    onClick={() => setUserLoginModalOpen(true)}
                    className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                   >
                     <LogIn size={18} /> <span className="hidden sm:inline">Login</span>
                   </button>
                 )}

                 {/* Admin Toggle */}
                 {isAdmin ? (
                    <button onClick={onAdminLogout} className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-red-100 transition-colors">
                        <LogOut size={14} /> Admin Exit
                    </button>
                 ) : (
                    <button id="admin-login-trigger" onClick={() => setAdminModalOpen(true)} className="text-slate-400 hover:text-indigo-600 transition-colors p-2">
                        <Lock size={18} />
                    </button>
                 )}

                 {/* Cart Icon */}
                 <Link to="/cart" className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group">
                    <ShoppingBag size={24} className="text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors" />
                    {cartCount > 0 && (
                        <span className="absolute top-1 right-1 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-bounce-subtle">
                            {cartCount}
                        </span>
                    )}
                 </Link>
            </div>
        </div>
      </header>

      {/* MOBILE SIDEBAR */}
      {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={toggleSidebar}></div>
              <div className="absolute left-0 top-0 bottom-0 w-3/4 max-w-xs bg-white dark:bg-slate-800 shadow-2xl p-6 overflow-y-auto animate-slide-in-left">
                  <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-bold dark:text-white">Menu</h2>
                      <button onClick={toggleSidebar} className="dark:text-white"><X size={24} /></button>
                  </div>
                  
                  {user && (
                    <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-lg">
                          {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full" /> : user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">{user.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-300">{user.email}</p>
                        </div>
                    </div>
                  )}

                  <div className="space-y-6">
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shop</p>
                        {navItems.map(item => (
                            <Link key={item.path} to={item.path} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium">
                                {item.icon} {item.name}
                            </Link>
                        ))}
                      </div>

                      {isAdmin && (
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Management</p>
                            {adminItems.map(item => (
                                <Link key={item.path} to={item.path} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium">
                                    {item.icon} {item.name}
                                </Link>
                            ))}
                        </div>
                      )}
                      
                      {!user && (
                         <button onClick={() => { setSidebarOpen(false); setUserLoginModalOpen(true); }} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium">
                             <LogIn size={20} /> Login / Sign up
                         </button>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12 min-h-screen">
        {children}
      </main>

      {/* AI CHAT FLOATING ACTION BUTTON */}
      {!location.pathname.includes('ai-assistant') && (
        <Link to="/ai-assistant" className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 group">
            <Bot size={24} />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-bold text-sm">Ask AI</span>
        </Link>
      )}

      {/* ADMIN LOGIN MODAL */}
      {isAdminModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
              <div className="min-h-full flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-scale-up relative">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-xl text-slate-900">Admin Access</h3>
                        <button onClick={() => setAdminModalOpen(false)} className="text-slate-500"><X size={20} /></button>
                    </div>
                    
                    <form onSubmit={handleAdminAuth} className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-slate-700">Password</label>
                            <input 
                              type="password" 
                              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 mt-1 focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900"
                              placeholder="••••••"
                              value={passwordInput}
                              onChange={(e) => setPasswordInput(e.target.value)}
                              autoFocus
                            />
                            {loginError && <p className="text-red-500 text-xs mt-1">Incorrect password.</p>}
                        </div>
                        <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                            <Unlock size={18} /> Login
                        </button>
                    </form>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-400">Default password: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-mono">admin123</code></p>
                    </div>
                </div>
              </div>
          </div>
      )}

      {/* USER LOGIN MODAL */}
      {isUserLoginModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
             <div className="min-h-full flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-8 animate-scale-up relative text-center">
                     <button onClick={() => setUserLoginModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
                     
                     <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserIcon size={32} />
                     </div>
                     <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                     <p className="text-slate-500 mb-8">Login to track orders and save your favorites.</p>

                     <div className="space-y-3">
                         <button 
                            onClick={() => handleUserAuth('google')}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 p-3 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-700"
                         >
                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                            Continue with Google
                         </button>
                         <button 
                             onClick={() => handleUserAuth('facebook')}
                             className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white p-3 rounded-lg hover:bg-[#166fe5] transition-colors font-medium"
                         >
                            <Facebook size={20} /> Continue with Facebook
                         </button>
                     </div>

                     <div className="my-6 flex items-center gap-3 text-slate-300">
                        <div className="h-px bg-slate-200 flex-1"></div>
                        <span className="text-xs uppercase font-bold">Or</span>
                        <div className="h-px bg-slate-200 flex-1"></div>
                     </div>

                     <button className="text-indigo-600 font-bold text-sm hover:underline flex items-center justify-center gap-1">
                        <Mail size={16} /> Continue with Email
                     </button>
                </div>
             </div>
        </div>
      )}

    </div>
  );
};

export default Layout;