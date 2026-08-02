import React from 'react';
import { Coffee, ShoppingBag, Sparkles, MapPin, Clock, Search, User as UserIcon, LogIn, Users, LogOut, ShieldCheck } from 'lucide-react';
import { Order, User } from '../types';

interface HeaderProps {
  cartItemCount: number;
  onOpenCart: () => void;
  onOpenAiBarista: () => void;
  orderType: 'delivery' | 'pickup';
  onToggleOrderType: (type: 'delivery' | 'pickup') => void;
  activeOrder: Order | null;
  onOpenOrderTracker: () => void;
  onScrollToMenu: () => void;
  onSearchClick: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenUsersDirectory: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemCount,
  onOpenCart,
  onOpenAiBarista,
  orderType,
  onToggleOrderType,
  activeOrder,
  onOpenOrderTracker,
  onScrollToMenu,
  onSearchClick,
  currentUser,
  onOpenAuth,
  onOpenUsersDirectory,
  onLogout,
}) => {
  return (
    <header id="header" className="sticky top-0 z-40 w-full bg-[#1F1A17]/95 backdrop-blur-md border-b border-[#3A312B] px-4 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={onScrollToMenu}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E65F2B] to-[#D4A373] p-0.5 shadow-md shadow-[#E65F2B]/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#1F1A17] rounded-[10px] flex items-center justify-center">
              <Coffee className="w-5 h-5 text-[#E65F2B]" />
            </div>
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
              Crave<span className="text-[#E65F2B]">Cups</span>
            </span>
            <span className="hidden sm:block text-[10px] tracking-wider text-[#D4A373] uppercase font-semibold">
              Artisan Cafe & Delivery
            </span>
          </div>
        </div>

        {/* Order Mode Switcher (Delivery vs Pickup) */}
        <div className="hidden sm:flex items-center bg-[#2D2521] p-1 rounded-full border border-[#3A312B]">
          <button
            onClick={() => onToggleOrderType('delivery')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              orderType === 'delivery'
                ? 'bg-[#E65F2B] text-white shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Delivery</span>
          </button>
          <button
            onClick={() => onToggleOrderType('pickup')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              orderType === 'pickup'
                ? 'bg-[#E65F2B] text-white shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pickup</span>
          </button>
        </div>

        {/* Action Buttons: Auth Profile, Users Directory, AI Barista, Search & Cart */}
        <div className="flex items-center gap-2">
          {/* Registered Users & Security Directory Button */}
          <button
            onClick={onOpenUsersDirectory}
            className="flex items-center gap-1.5 bg-[#2D2521] border border-[#3A312B] hover:border-[#D4A373] text-stone-300 hover:text-white px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm"
            title="View Registered Users & Login Activity Logs"
          >
            <Users className="w-3.5 h-3.5 text-[#D4A373]" />
            <span className="hidden lg:inline">Users & Logs</span>
          </button>

          {/* User Auth Profile / Login Button */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 bg-[#2D2521] border border-[#3A312B] p-1 pr-2.5 rounded-full shadow-sm">
              <div className="w-6 h-6 rounded-full bg-[#E65F2B] text-white flex items-center justify-center font-bold text-xs uppercase font-mono">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden xs:flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-none truncate max-w-[90px]">
                  {currentUser.name.split(' ')[0]}
                </span>
                <span className="text-[9px] text-emerald-400 font-mono leading-none flex items-center gap-0.5 mt-0.5">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  {currentUser.role}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-1 text-stone-400 hover:text-rose-400 transition-colors ml-1"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#E65F2B] to-[#D14F1D] text-white px-3 py-1.5 rounded-full text-xs font-extrabold shadow-md shadow-[#E65F2B]/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Active Order Pill if available */}
          {activeOrder && (
            <button
              onClick={onOpenOrderTracker}
              className="flex items-center gap-1.5 bg-[#E65F2B]/20 border border-[#E65F2B]/60 text-[#E65F2B] px-2.5 py-1.5 rounded-full text-xs font-semibold animate-pulse hover:bg-[#E65F2B] hover:text-white transition-all"
            >
              <div className="w-2 h-2 rounded-full bg-[#E65F2B]" />
              <span className="hidden xs:inline">Track Order</span>
              <span className="font-mono">#{activeOrder.id.slice(-4)}</span>
            </button>
          )}

          {/* AI Barista Button */}
          <button
            onClick={onOpenAiBarista}
            className="flex items-center gap-1.5 bg-[#2D2521] border border-[#D4A373]/40 text-[#D4A373] hover:border-[#D4A373] hover:bg-[#3A312B] px-2.5 py-1.5 rounded-full text-xs font-medium transition-all"
            title="Ask AI Barista for a recommendation"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E65F2B]" />
            <span className="hidden md:inline">AI Barista</span>
          </button>

          {/* Quick Search */}
          <button
            onClick={onSearchClick}
            className="p-2 text-stone-300 hover:text-white bg-[#2D2521] hover:bg-[#3A312B] rounded-full border border-[#3A312B] transition-all"
            aria-label="Search Menu"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Cart Drawer Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center justify-center p-2 bg-[#E65F2B] hover:bg-[#D14F1D] text-white rounded-full shadow-lg shadow-[#E65F2B]/25 transition-all transform active:scale-95"
            aria-label="Open Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-white text-[#1F1A17] font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#1F1A17] shadow">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Delivery / Pickup selector row */}
      <div className="flex sm:hidden justify-center mt-2 pt-2 border-t border-[#2D2521]">
        <div className="flex items-center bg-[#2D2521] p-1 rounded-full border border-[#3A312B] w-full max-w-xs justify-between">
          <button
            onClick={() => onToggleOrderType('delivery')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-full text-xs font-medium transition-all ${
              orderType === 'delivery'
                ? 'bg-[#E65F2B] text-white shadow-sm'
                : 'text-stone-400'
            }`}
          >
            <MapPin className="w-3 h-3" />
            <span>Delivery (25m)</span>
          </button>
          <button
            onClick={() => onToggleOrderType('pickup')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-full text-xs font-medium transition-all ${
              orderType === 'pickup'
                ? 'bg-[#E65F2B] text-white shadow-sm'
                : 'text-stone-400'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Pickup (12m)</span>
          </button>
        </div>
      </div>
    </header>
  );
};

