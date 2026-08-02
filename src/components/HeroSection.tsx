import React from 'react';
import { Sparkles, ArrowRight, Star, Clock, ShieldCheck, Flame } from 'lucide-react';
import heroImg from '../assets/images/cravecups_hero_1785667504330.jpg';

interface HeroSectionProps {
  onExploreMenu: () => void;
  onOpenAiBarista: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreMenu,
  onOpenAiBarista,
}) => {
  return (
    <section id="hero-section" className="relative w-full bg-gradient-to-b from-[#15110F] via-[#1F1A17] to-[#251E1A] overflow-hidden pt-4 pb-8 md:py-12 px-4 border-b border-[#3A312B]">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#E65F2B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#D4A373]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headline & Call To Actions */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-4 md:space-y-6 z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2D2521] border border-[#D4A373]/30 text-[#D4A373] text-xs font-semibold tracking-wide">
            <Flame className="w-4 h-4 text-[#E65F2B]" />
            <span>Freshly Roasted Single-Origin Coffee & Hot Bakery</span>
          </div>

          {/* Hero Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Crafted with Passion. <br />
            <span className="bg-gradient-to-r from-[#D4A373] via-[#F4EAD3] to-[#E65F2B] bg-clip-text text-transparent">
              Delivered Fresh to You.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-stone-300 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed">
            Experience specialty micro-lot coffees, velvet nitro cold brews, and warm French butter pastries delivered straight to your door or ready for express pickup.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto pt-2">
            <button
              onClick={onExploreMenu}
              className="flex items-center justify-center gap-2.5 bg-[#E65F2B] hover:bg-[#D14F1D] text-white font-bold px-6 py-3.5 rounded-2xl shadow-xl shadow-[#E65F2B]/30 transition-all transform active:scale-95 group"
            >
              <span>Explore Menu</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenAiBarista}
              className="flex items-center justify-center gap-2 bg-[#2D2521] hover:bg-[#3A312B] text-[#D4A373] hover:text-white font-semibold px-5 py-3.5 rounded-2xl border border-[#D4A373]/40 transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#E65F2B]" />
              <span>Ask AI Barista</span>
            </button>
          </div>

          {/* Social Proof & Value Props */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#3A312B] w-full max-w-lg">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1 text-[#E65F2B]">
                <Star className="w-4 h-4 fill-[#E65F2B]" />
                <span className="font-bold text-white text-sm">4.9 / 5</span>
              </div>
              <span className="text-[11px] text-stone-400">12k+ Coffee Lovers</span>
            </div>

            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1 text-[#D4A373]">
                <Clock className="w-4 h-4" />
                <span className="font-bold text-white text-sm">25 Mins</span>
              </div>
              <span className="text-[11px] text-stone-400">Avg Delivery Speed</span>
            </div>

            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-bold text-white text-sm">Hot & Fresh</span>
              </div>
              <span className="text-[11px] text-stone-400">Thermal Sealed</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Asset */}
        <div className="lg:col-span-5 relative mt-4 lg:mt-0">
          <div className="relative rounded-3xl overflow-hidden border-2 border-[#D4A373]/30 shadow-2xl shadow-[#15110F]">
            <img
              src={heroImg}
              alt="CraveCups Artisan Latte & Pastry"
              referrerPolicy="no-referrer"
              className="w-full h-64 sm:h-80 md:h-96 object-cover transform hover:scale-105 transition-transform duration-700"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F1A17] via-transparent to-transparent opacity-80" />

            {/* Floating Badge on Image */}
            <div className="absolute bottom-4 left-4 right-4 bg-[#2D2521]/90 backdrop-blur-md p-3.5 rounded-2xl border border-[#3A312B] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#D4A373] font-bold uppercase tracking-wide">Featured Barista Drink</span>
                <p className="text-white font-bold text-sm">Crave Signature Roasted Honey Latte</p>
              </div>
              <span className="bg-[#E65F2B] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow">
                $5.85
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
