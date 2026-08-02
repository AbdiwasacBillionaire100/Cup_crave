import React, { useEffect, useState } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface FloatingCartBadgeProps {
  cartItemCount: number;
  subtotal: number;
  onOpenCart: () => void;
}

export const FloatingCartBadge: React.FC<FloatingCartBadgeProps> = ({
  cartItemCount,
  subtotal,
  onOpenCart,
}) => {
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    if (cartItemCount > 0) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 600);
      return () => clearTimeout(timer);
    }
  }, [cartItemCount, subtotal]);

  if (cartItemCount === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-fade-in lg:hidden">
      <button
        onClick={onOpenCart}
        className={`group flex items-center gap-3 bg-gradient-to-r from-[#E65F2B] to-[#D14F1D] hover:from-[#f06e3a] hover:to-[#e15926] text-white px-4 py-3 rounded-2xl shadow-2xl shadow-[#E65F2B]/50 border border-[#D4A373]/40 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
          isBouncing ? 'scale-110 ring-4 ring-[#E65F2B]/40' : ''
        }`}
        aria-label="Open Shopping Bag"
      >
        <div className="relative flex items-center justify-center p-1 bg-white/10 rounded-xl">
          <ShoppingBag className="w-5 h-5 text-white" />
          <span className="absolute -top-2.5 -right-2.5 bg-white text-[#E65F2B] font-black text-[11px] min-w-[22px] h-[22px] px-1 rounded-full flex items-center justify-center border-2 border-[#E65F2B] shadow-md animate-pulse">
            {cartItemCount}
          </span>
        </div>

        <div className="flex flex-col text-left pl-0.5 pr-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-orange-200">
            Shopping Bag
          </span>
          <span className="text-sm font-black font-mono leading-tight text-white">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        <div className="p-1.5 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
          <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
        </div>
      </button>
    </div>
  );
};
