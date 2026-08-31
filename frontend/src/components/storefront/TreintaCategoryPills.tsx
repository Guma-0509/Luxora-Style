'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface CategoryPillsProps {
  categories: Array<{ id: string; name: string; slug: string }>;
  selectedCategory?: string;
  activeCategory?: string;
  onSelectCategory: (slug: string) => void;
}

export const TreintaCategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategory: propSelected,
  activeCategory: propActive,
  onSelectCategory,
}) => {
  const currentCategory = propSelected !== undefined ? propSelected : (propActive || 'all');

  return (
    <div className="w-full overflow-x-auto py-2 scrollbar-none">
      <div className="flex items-center gap-2 min-w-max">
        {/* All Products Pill */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all shadow-subtle cursor-pointer ${
            currentCategory === 'all'
              ? 'bg-[#3C6E71] dark:bg-[#4D8B8E] text-white shadow-card scale-102'
              : 'border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] text-[#353535] dark:text-[#F5F6F8] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] hover:border-[#353535] dark:hover:border-[#4D8B8E]'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Todos los Productos</span>
        </button>

        {/* Dynamic Category List */}
        {categories.map((category) => {
          const isSelected = currentCategory === category.slug;
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.slug)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all shadow-subtle cursor-pointer ${
                isSelected
                  ? 'bg-[#3C6E71] dark:bg-[#4D8B8E] text-white shadow-card scale-102'
                  : 'border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] text-[#353535] dark:text-[#F5F6F8] hover:bg-[#D9D9D9]/30 dark:hover:bg-[#2E3236] hover:border-[#353535] dark:hover:border-[#4D8B8E]'
              }`}
            >
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
