import React from 'react';
import { MenuItem } from '../types';
import { MenuCard } from './MenuCard';
import { Coffee, RotateCcw } from 'lucide-react';

interface MenuGridProps {
  items: MenuItem[];
  isLoading: boolean;
  onSelectItem: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
  onResetFilters?: () => void;
}

export const MenuGrid: React.FC<MenuGridProps> = ({
  items,
  isLoading,
  onSelectItem,
  onQuickAdd,
  onResetFilters,
}) => {
  // Skeleton Placeholder Cards Array for initializing homepage or during loads
  const skeletonCount = 6;

  if (isLoading) {
    return (
      <div id="menu-placeholder-grid" className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {Array.from({ length: skeletonCount }).map((_, idx) => (
            <div
              key={idx}
              className="bg-[#2D2521] border border-[#3A312B] rounded-3xl p-4 space-y-4 animate-shimmer"
            >
              <div className="w-full h-48 bg-[#3A312B] rounded-2xl" />
              <div className="space-y-2">
                <div className="w-3/4 h-5 bg-[#3A312B] rounded-lg" />
                <div className="w-full h-3 bg-[#3A312B] rounded-lg" />
                <div className="w-2/3 h-3 bg-[#3A312B] rounded-lg" />
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="w-16 h-6 bg-[#3A312B] rounded-lg" />
                <div className="w-24 h-8 bg-[#3A312B] rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#2D2521] border border-[#3A312B] flex items-center justify-center mx-auto text-[#D4A373]">
          <Coffee className="w-8 h-8 opacity-60" />
        </div>
        <h3 className="text-xl font-bold text-white">No items found</h3>
        <p className="text-stone-400 text-sm max-w-md mx-auto">
          We couldn't find any drinks or bakery items matching your search. Try adjusting your filters or category selection.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 bg-[#E65F2B] hover:bg-[#D14F1D] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div id="menu-grid" className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            onSelectItem={onSelectItem}
            onQuickAdd={onQuickAdd}
          />
        ))}
      </div>
    </div>
  );
};
