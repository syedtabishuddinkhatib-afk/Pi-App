
import React from 'react';
import { User, Order } from '../types';
import { Package, MapPin, Clock, Calendar, ChevronRight, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UserProfileProps {
  user: User;
  currencySymbol: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, currencySymbol }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      
      {/* Header Card */}
      <div className="bg-[var(--color-card)] rounded-2xl p-8 border border-[var(--color-border)] shadow-sm flex flex-col md:flex-row items-center gap-6">
         <div className="w-24 h-24 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-4xl font-bold shadow-lg">
             {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full" /> : user.name.charAt(0)}
         </div>
         <div className="text-center md:text-left flex-1">
             <h1 className="text-3xl font-bold text-[var(--color-text)]">{user.name}</h1>
             <p className="text-[var(--color-text)] opacity-60">{user.email}</p>
             <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                 <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Verified Customer</span>
                 <span className="bg-[var(--color-bg)] text-[var(--color-text)] px-3 py-1 rounded-full text-xs font-bold border border-[var(--color-border)]">Member since {new Date().getFullYear()}</span>
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Saved Details */}
          <div className="space-y-6">
              <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm">
                  <h3 className="font-bold text-[var(--color-text)] mb-4 flex items-center gap-2"><MapPin size={18} className="text-[var(--color-primary)]"/> Saved Address</h3>
                  {user.savedAddress ? (
                      <div className="text-sm text-[var(--color-text)] opacity-80 space-y-1">
                          <p className="font-bold">{user.savedAddress.fullName}</p>
                          <p>{user.savedAddress.street}</p>
                          <p>{user.savedAddress.city}, {user.savedAddress.state} {user.savedAddress.zipCode}</p>
                          <p>{user.savedAddress.country}</p>
                          <p className="mt-2 text-xs opacity-60">{user.savedAddress.phone}</p>
                      </div>
                  ) : (
                      <p className="text-sm text-[var(--color-text)] opacity-50">No default address saved.</p>
                  )}
              </div>
          </div>

          {/* Order History */}
          <div className="md:col-span-2 space-y-6">
              <h3 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
                  <Package size={24} /> Order History
              </h3>
              
              {user.orders.length === 0 ? (
                  <div className="bg-[var(--color-card)] p-12 rounded-xl border-2 border-dashed border-[var(--color-border)] text-center">
                      <p className="text-[var(--color-text)] opacity-50 mb-4">You haven't placed any orders yet.</p>
                      <Link to="/" className="inline-block bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg font-bold">Start Shopping</Link>
                  </div>
              ) : (
                  <div className="space-y-4">
                      {user.orders.map((order) => (
                          <div key={order.id} className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-4 pb-4 border-b border-[var(--color-border)]">
                                  <div>
                                      <p className="font-bold text-[var(--color-text)]">Order #{order.id}</p>
                                      <p className="text-xs text-[var(--color-text)] opacity-60 flex items-center gap-1">
                                          <Calendar size={12}/> {new Date(order.date).toLocaleDateString()}
                                      </p>
                                  </div>
                                  <div className="text-right">
                                      <p className="font-bold text-[var(--color-primary)]">{currencySymbol}{order.total.toFixed(2)}</p>
                                      <span className="inline-block bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{order.status}</span>
                                  </div>
                              </div>
                              
                              <div className="space-y-2">
                                  {order.items.map((item, idx) => (
                                      <div key={idx} className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded bg-[var(--color-bg)] overflow-hidden">
                                              <img src={item.image} className="w-full h-full object-cover"/>
                                          </div>
                                          <div className="flex-1">
                                              <p className="text-sm font-medium text-[var(--color-text)]">{item.name}</p>
                                              <p className="text-xs text-[var(--color-text)] opacity-60">Qty: {item.quantity}</p>
                                          </div>
                                      </div>
                                  ))}
                              </div>

                              <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex justify-between items-center">
                                  <p className="text-xs text-[var(--color-text)] opacity-60 flex items-center gap-1">
                                      <Clock size={12} /> Estimated Delivery: 3-5 Business Days
                                  </p>
                                  <button className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1">
                                      Track Order <ChevronRight size={12} />
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default UserProfile;
