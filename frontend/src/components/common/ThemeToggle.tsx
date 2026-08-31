'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';
import { Sun, Moon, Laptop, Check } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const options: { mode: ThemeMode; label: string; icon: React.ReactNode; description: string }[] = [
    {
      mode: 'light',
      label: 'Claro',
      icon: <Sun className="h-4 w-4 text-amber-500" />,
      description: 'Tema claro estándar',
    },
    {
      mode: 'dark',
      label: 'Oscuro',
      icon: <Moon className="h-4 w-4 text-[#4D8B8E]" />,
      description: 'Ideal para ambientes oscuros',
    },
    {
      mode: 'system',
      label: 'Automático',
      icon: <Laptop className="h-4 w-4 text-[#777777] dark:text-[#A8ABB2]" />,
      description: 'Sincronizado con tu dispositivo',
    },
  ];

  const currentIcon = () => {
    if (theme === 'system') {
      return <Laptop className="h-4 w-4 text-[#3C6E71] dark:text-[#4D8B8E]" />;
    }
    if (theme === 'dark' || resolvedTheme === 'dark') {
      return <Moon className="h-4 w-4 text-[#4D8B8E]" />;
    }
    return <Sun className="h-4 w-4 text-amber-500" />;
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Cambiar tema de color"
        className="flex items-center gap-1.5 rounded-xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-2 text-xs font-bold text-[#353535] dark:text-[#F5F6F8] shadow-subtle hover:border-[#3C6E71] dark:hover:border-[#4D8B8E] hover:bg-[#F8F9FA] dark:hover:bg-[#2E3236] transition-all cursor-pointer"
      >
        <span className="flex items-center justify-center h-4 w-4">{currentIcon()}</span>
        {showLabel && (
          <span className="hidden sm:inline font-semibold">
            {theme === 'system' ? 'Auto' : theme === 'dark' ? 'Oscuro' : 'Claro'}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-52 origin-top-right rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526] p-1.5 shadow-dropdown z-50 animate-fadeIn space-y-1"
        >
          <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#777777] dark:text-[#A8ABB2] border-b border-[#D9D9D9]/50 dark:border-[#3A3B3C]/50">
            Apariencia Visual
          </div>

          {options.map((opt) => {
            const isSelected = theme === opt.mode;
            return (
              <button
                key={opt.mode}
                type="button"
                role="menuitem"
                onClick={() => {
                  setTheme(opt.mode);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-[#3C6E71]/10 dark:bg-[#4D8B8E]/20 text-[#3C6E71] dark:text-[#4D8B8E]'
                    : 'text-[#353535] dark:text-[#F5F6F8] hover:bg-[#F8F9FA] dark:hover:bg-[#2E3236]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex-shrink-0">{opt.icon}</span>
                  <div>
                    <p className="leading-none">{opt.label}</p>
                    <span className="text-[10px] font-normal text-[#777777] dark:text-[#A8ABB2]">
                      {opt.description}
                    </span>
                  </div>
                </div>
                {isSelected && <Check className="h-4 w-4 text-[#3C6E71] dark:text-[#4D8B8E]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
