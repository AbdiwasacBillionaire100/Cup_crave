import React from 'react';
import { Search, X, SlidersHorizontal, Sparkles } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  resultCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedTag,
  onSelectTag,
  resultCount,
}) => {
  const QUICK_TAGS = [
    { id: 'popular', label: '🔥 Popular Hits' },
    { id: 'new', label: '✨ New Arrivals' },
    { id: 'under6', label: '⚡ Under $6' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4 space-y-3">
      <div className="flex items-center gap-3">
        {/* Search Input Box */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search coffee, nitro brew, matcha, pastries..."
            className="w-full bg-[#2D2521] border border-[#3A312B] focus:border-[#E65F2B] text-white text-sm rounded-2xl pl-10 pr-10 py-3 outline-none transition-colors placeholder:text-stone-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Tag Pills */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pt-1">
        <div className="flex items-center gap-2">
          {QUICK_TAGS.map((tag) => {
            const isActive = selectedTag === tag.id;
            return (
              <button
                key={tag.id}
                onClick={() => onSelectTag(isActive ? null : tag.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-[#E65F2B]/20 border-[#E65F2B] text-[#E65F2B]'
                    : 'bg-[#2D2521] border-[#3A312B] text-stone-400 hover:text-white'
                }`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>

        <span className="text-xs text-stone-400 font-mono whitespace-nowrap">
          {resultCount} {resultCount === 1 ? 'item' : 'items'}
        </span>
      </div>
    </div>
  );
};
