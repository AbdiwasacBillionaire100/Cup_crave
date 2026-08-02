import React from 'react';
import { MenuItem } from '../types';
import { Star, Plus, Flame, Sparkles, SlidersHorizontal } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  onSelectItem: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  item,
  onSelectItem,
  onQuickAdd,
}) => {
  return (
    <div className="group relative bg-[#2D2521] border border-[#3A312B] hover:border-[#D4A373]/60 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-[#15110F]">
      {/* Top Image Container */}
      <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-[#1F1A17] cursor-pointer" onClick={() => onSelectItem(item)}>
        <img
          src={item.image}
          alt={item.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2D2521] via-transparent to-transparent opacity-60" />

        {/* Badges: Popular / New */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {item.isPopular && (
            <span className="flex items-center gap-1 bg-[#E65F2B] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
              <Flame className="w-3 h-3" />
              <span>Popular</span>
            </span>
          )}
          {item.isNew && (
            <span className="flex items-center gap-1 bg-[#D4A373] text-[#1F1A17] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
              <Sparkles className="w-3 h-3" />
              <span>New</span>
            </span>
          )}
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-[#1F1A17]/80 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-[#3A312B] flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-[#D4A373] text-[#D4A373]" />
          <span>{item.rating}</span>
          <span className="text-stone-400 text-[10px]">({item.reviewCount})</span>
        </div>
      </div>

      {/* Card Body Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 cursor-pointer" onClick={() => onSelectItem(item)}>
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-white text-base leading-snug group-hover:text-[#D4A373] transition-colors line-clamp-1">
              {item.name}
            </h3>
          </div>

          <p className="text-stone-400 text-xs line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Extra Tags & Price Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-[#3A312B]">
          <div className="flex flex-col">
            <span className="text-xs text-stone-400 font-medium">Price</span>
            <span className="text-lg font-extrabold text-[#E65F2B]">
              ${item.price.toFixed(2)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {item.customizable && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectItem(item);
                }}
                className="flex items-center gap-1 bg-[#3A312B] hover:bg-[#D4A373] text-[#D4A373] hover:text-[#1F1A17] font-semibold text-xs px-2.5 py-2 rounded-xl border border-[#D4A373]/30 transition-all"
                title="Customize milk, size & toppings"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Customize</span>
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(item);
              }}
              className="flex items-center gap-1 bg-[#E65F2B] hover:bg-[#D14F1D] text-white font-bold text-xs px-3 py-2 rounded-xl shadow-md shadow-[#E65F2B]/20 transition-all transform active:scale-95 whitespace-nowrap"
              title="Add standard brew directly to bag"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Bag</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
