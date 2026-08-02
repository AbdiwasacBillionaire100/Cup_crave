import React from 'react';
import { CategoryId, Category } from '../types';
import { Coffee, Flame, CupSoda, Sparkles, Croissant, UtensilsCrossed } from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  categoryItemCounts: Record<string, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryItemCounts,
}) => {
  // Helper to render lucide icon dynamically
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-4 h-4" />;
      case 'CupSoda':
        return <CupSoda className="w-4 h-4" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'Croissant':
        return <Croissant className="w-4 h-4" />;
      case 'UtensilsCrossed':
        return <UtensilsCrossed className="w-4 h-4" />;
      case 'Coffee':
      default:
        return <Coffee className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full bg-[#1F1A17] py-3 sticky top-[61px] z-30 border-b border-[#3A312B] backdrop-blur-md bg-[#1F1A17]/95">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryItemCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 transform active:scale-95 border ${
                  isSelected
                    ? 'bg-[#E65F2B] text-white border-[#E65F2B] shadow-md shadow-[#E65F2B]/25'
                    : 'bg-[#2D2521] text-stone-300 border-[#3A312B] hover:border-[#D4A373]/50 hover:text-white'
                }`}
              >
                <span className={isSelected ? 'text-white' : 'text-[#D4A373]'}>
                  {renderIcon(cat.iconName)}
                </span>
                <span>{cat.name}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-[#1F1A17] text-[#D4A373] border border-[#3A312B]'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
