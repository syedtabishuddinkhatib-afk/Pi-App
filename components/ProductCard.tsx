
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
    <div className="bg-[var(--color-card)] rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative aspect-square bg-[var(--color-bg)] overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 bg-[var(--color-card)]/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-xs font-semibold text-[var(--color-text)] shadow-sm">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          {product.rating}
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-xs text-[var(--color-primary)] font-semibold uppercase tracking-wider mb-1">{product.category}</p>
        <h3 className="font-bold text-[var(--color-text)] mb-1 truncate">{product.name}</h3>
        <p className="text-sm text-[var(--color-text)] opacity-60 line-clamp-2 mb-4 h-10">{product.description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-[var(--color-text)]">{currencySymbol}{product.price.toFixed(2)}</span>
          <button 
            onClick={() => onAddToCart(product)}
            className="bg-[var(--color-primary)] hover:opacity-90 text-white p-2 rounded-lg transition-colors active:scale-95"
            aria-label="Add to cart"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
