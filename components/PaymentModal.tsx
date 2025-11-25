
import React, { useState } from 'react';
import { X, CheckCircle, CreditCard, Smartphone, Loader2, Wallet, Building2 } from 'lucide-react';
import { PaymentSettings } from '../types';

interface PaymentModalProps {
  total: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  paymentSettings: PaymentSettings;
  currencySymbol: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ total, isOpen, onClose, onSuccess, paymentSettings, currencySymbol }) => {
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setProcessing(true);
    // Simulate Gateway Processing
    setTimeout(() => {
      setProcessing(false);
      onSuccess();
    }, 2000);
  };

  const enabledGateways = paymentSettings.gateways.filter(g => g.enabled);

  const getIcon = (type: string) => {
    switch (type) {
      case 'wallet': return <Wallet size={20} className="text-white" />;
      case 'card': return <CreditCard size={20} className="text-slate-600" />;
      case 'upi': return <Smartphone size={20} className="text-white" />;
      case 'netbanking': return <Building2 size={20} className="text-white" />;
      default: return <CreditCard size={20} />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'wallet': return 'bg-slate-800'; // GPay
      case 'upi': return 'bg-purple-600'; // PhonePe
      case 'netbanking': return 'bg-blue-600'; // Razorpay
      default: return 'bg-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[var(--color-card)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up relative border border-[var(--color-border)]">
        <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg)]">
          <h3 className="font-bold text-[var(--color-text)] text-lg">Secure Checkout</h3>
          <button onClick={onClose} className="text-[var(--color-text)] opacity-40 hover:opacity-100"><X size={20} /></button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <span className="text-[var(--color-text)] opacity-60 text-sm">Total Amount</span>
            <h2 className="text-4xl font-bold text-[var(--color-text)] mt-1">{currencySymbol}{total.toFixed(2)}</h2>
          </div>

          <div className="space-y-3 mb-8 max-h-60 overflow-y-auto pr-2">
            {enabledGateways.length === 0 ? (
                <div className="text-center py-8 text-[var(--color-text)] opacity-40 border-2 border-dashed border-[var(--color-border)] rounded-xl">
                    <p>No payment methods available.</p>
                </div>
            ) : (
                enabledGateways.map(gateway => (
                    <button 
                    key={gateway.id}
                    onClick={() => setSelectedMethodId(gateway.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        selectedMethodId === gateway.id ? 'border-[var(--color-primary)] bg-[var(--color-bg)]' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
                    }`}
                    >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-8 rounded flex items-center justify-center shadow-sm ${getBgColor(gateway.type)}`}>
                            {getIcon(gateway.type)}
                        </div>
                        <div className="text-left">
                             <span className="font-bold text-[var(--color-text)] block text-sm">{gateway.name}</span>
                             {gateway.type === 'upi' && <span className="text-[10px] text-[var(--color-text)] opacity-40 uppercase font-bold">UPI Integrated</span>}
                             {gateway.type === 'netbanking' && <span className="text-[10px] text-[var(--color-text)] opacity-40 uppercase font-bold">Secure Gateway</span>}
                        </div>
                    </div>
                    {selectedMethodId === gateway.id && <CheckCircle size={20} className="text-[var(--color-primary)]" />}
                    </button>
                ))
            )}
          </div>

          <button 
            onClick={handlePay}
            disabled={processing || !selectedMethodId}
            className="w-full bg-[var(--color-primary)] text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? <Loader2 className="animate-spin" /> : 'Pay Now'}
          </button>
          
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--color-text)] opacity-40">
             <Smartphone size={12} />
             <span>Encrypted 256-bit secure transaction</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
