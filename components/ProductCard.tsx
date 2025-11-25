import React from 'react';
import { Plus, Star } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  currencySymbol: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, currencySymbol }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative aspect-square bg-slate-100 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-xs font-semibold text-slate-700 shadow-sm">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          {product.rating}
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-1">{product.category}</p>
        <h3 className="font-bold text-slate-800 mb-1 truncate">{product.name}</h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">{product.description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-slate-900">{currencySymbol}{product.price.toFixed(2)}</span>
          <button 
            onClick={() => onAddToCart(product)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors active:scale-95"
            aria-label="Add to cart"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};