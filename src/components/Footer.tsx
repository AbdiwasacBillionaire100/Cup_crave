import React from 'react';
import { Coffee, MapPin, Clock, Phone, Heart, Instagram, Twitter, Facebook } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#15110F] border-t border-[#3A312B] text-stone-400 py-10 px-4 text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Overview */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E65F2B] text-white flex items-center justify-center font-bold">
              <Coffee className="w-5 h-5" />
            </div>
            <span className="text-lg font-extrabold text-white tracking-tight">
              Crave<span className="text-[#E65F2B]">Cups</span>
            </span>
          </div>
          <p className="text-stone-400 leading-relaxed">
            Crafting specialty micro-lot coffee, velvet cold brews, and warm artisan pastries daily with express home & office delivery.
          </p>
          <div className="flex items-center gap-3 pt-2 text-stone-300">
            <a href="#instagram" className="p-2 bg-[#2D2521] hover:text-[#E65F2B] rounded-xl border border-[#3A312B] transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#twitter" className="p-2 bg-[#2D2521] hover:text-[#E65F2B] rounded-xl border border-[#3A312B] transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#facebook" className="p-2 bg-[#2D2521] hover:text-[#E65F2B] rounded-xl border border-[#3A312B] transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#D4A373]" />
            <span>Opening Hours</span>
          </h4>
          <ul className="space-y-1.5 text-stone-300">
            <li className="flex justify-between">
              <span>Mon - Fri:</span>
              <span className="font-mono text-white">6:00 AM - 9:00 PM</span>
            </li>
            <li className="flex justify-between">
              <span>Saturday:</span>
              <span className="font-mono text-white">7:00 AM - 10:00 PM</span>
            </li>
            <li className="flex justify-between">
              <span>Sunday:</span>
              <span className="font-mono text-white">7:00 AM - 8:00 PM</span>
            </li>
            <li className="text-[11px] text-[#E65F2B] font-bold pt-1">
              ⚡ Express Delivery Operating 7 Days a Week
            </li>
          </ul>
        </div>

        {/* Locations */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#D4A373]" />
            <span>Cafe Locations</span>
          </h4>
          <ul className="space-y-2 text-stone-300">
            <li>
              <strong className="text-white block">Downtown Flagship:</strong>
              450 Roast Avenue, Suite 100
            </li>
            <li>
              <strong className="text-white block">Uptown Barista Lounge:</strong>
              1280 Espresso Boulevard
            </li>
          </ul>
        </div>

        {/* Customer Support */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-[#D4A373]" />
            <span>Contact & Support</span>
          </h4>
          <p className="text-stone-300">Need order help or corporate catering?</p>
          <p className="font-mono text-white font-bold text-sm text-[#E65F2B]">
            +1 (800) 555-CRAVE
          </p>
          <p className="text-stone-400">hello@cravecups-cafe.com</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[#2D2521] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
        <p>© {new Date().getFullYear()} CraveCups Cafe & Express Delivery. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for coffee lovers.
        </p>
      </div>
    </footer>
  );
};
