'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ProductVariant } from '../../types';
import { Check, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelectVariant: (variant: ProductVariant) => void;
}

export function VariantSelector({
  variants,
  selectedVariant,
  onSelectVariant,
}: VariantSelectorProps) {
  if (!variants || variants.length === 0) return null;

  // Normalized extraction of attributes and values
  const { attributeMap, parsedVariants } = useMemo(() => {
    const attrMap: Record<string, Set<string>> = {};

    const normalized = variants.map((v) => {
      const attrs: Record<string, string> = { ...(v.attributes || {}) };

      // Parse from title if attributes missing
      if (Object.keys(attrs).length === 0 && v.title && v.title.includes('/')) {
        const parts = v.title.split('/').map((p) => p.trim());
        if (parts.length >= 2) {
          attrs['Color / Estilo'] = parts[0];
          attrs['Talla / Medida'] = parts[1].replace(/talla/i, '').trim();
        }
      }

      Object.entries(attrs).forEach(([key, val]) => {
        if (!attrMap[key]) attrMap[key] = new Set();
        attrMap[key].add(String(val));
      });

      return {
        ...v,
        computedAttrs: attrs,
      };
    });

    return {
      attributeMap: Object.fromEntries(
        Object.entries(attrMap).map(([k, set]) => [k, Array.from(set)])
      ),
      parsedVariants: normalized,
    };
  }, [variants]);

  const attributeKeys = Object.keys(attributeMap);

  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(() => {
    if (selectedVariant) {
      const match = parsedVariants.find((pv) => pv.id === selectedVariant.id);
      if (match && Object.keys(match.computedAttrs).length > 0) {
        return { ...match.computedAttrs };
      }
    }
    return parsedVariants[0]?.computedAttrs ? { ...parsedVariants[0].computedAttrs } : {};
  });

  useEffect(() => {
    if (selectedVariant) {
      const match = parsedVariants.find((pv) => pv.id === selectedVariant.id);
      if (match && Object.keys(match.computedAttrs).length > 0) {
        setSelectedAttrs({ ...match.computedAttrs });
      }
    }
  }, [selectedVariant, parsedVariants]);

  const handleSelectAttribute = (key: string, value: string) => {
    const nextAttrs = { ...selectedAttrs, [key]: value };
    setSelectedAttrs(nextAttrs);

    // 1. Try exact match
    const exact = parsedVariants.find((pv) =>
      Object.entries(nextAttrs).every(([k, v]) => pv.computedAttrs[k] === v)
    );

    if (exact) {
      onSelectVariant(exact);
      return;
    }

    // 2. Partial match
    const partial = parsedVariants.find((pv) => pv.computedAttrs[key] === value);
    if (partial) {
      setSelectedAttrs({ ...partial.computedAttrs });
      onSelectVariant(partial);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Attribute Selectors (Tallas, Colores, etc.) */}
      {attributeKeys.map((attrKey) => {
        const possibleValues = attributeMap[attrKey] || [];
        const currentValue = selectedAttrs[attrKey] || possibleValues[0];

        return (
          <div key={attrKey} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-[#353535]">
                {attrKey}:
              </span>
              <span className="font-bold text-[#3C6E71]">{currentValue}</span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {possibleValues.map((val) => {
                const isSelected = currentValue === val;
                const matchingVariant = parsedVariants.find(
                  (v) => v.computedAttrs[attrKey] === val
                );
                const hasStock = matchingVariant ? matchingVariant.stock > 0 : true;

                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSelectAttribute(attrKey, val)}
                    className={`relative flex items-center justify-center rounded-xl border px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-[#3C6E71] bg-[#3C6E71] text-white shadow-subtle'
                        : hasStock
                        ? 'border-[#D9D9D9] bg-[#FFFFFF] text-[#353535] hover:border-[#353535] hover:bg-[#D9D9D9]/20'
                        : 'border-[#D9D9D9] bg-[#D9D9D9]/20 text-[#777777] line-through opacity-50'
                    }`}
                  >
                    <span>{val}</span>
                    {isSelected && <Check className="ml-1.5 h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* 2. Full Variant Cards Matrix (Direct click on any option) */}
      <div className="space-y-2 pt-2">
        <span className="block text-xs font-bold uppercase tracking-wider text-[#353535]">
          Todas las Combinaciones Disponibles:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto">
          {variants.map((v) => {
            const isSelected = selectedVariant?.id === v.id;
            const isOut = v.stock <= 0;

            return (
              <button
                key={v.id}
                type="button"
                disabled={isOut}
                onClick={() => onSelectVariant(v)}
                className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-bold transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'border-[#3C6E71] bg-[#3C6E71] text-white shadow-subtle'
                    : isOut
                    ? 'border-[#D9D9D9] bg-[#D9D9D9]/30 text-[#777777] cursor-not-allowed opacity-50'
                    : 'border-[#D9D9D9] bg-[#FFFFFF] text-[#353535] hover:border-[#353535] hover:bg-[#D9D9D9]/20'
                }`}
              >
                <div className="truncate pr-2">
                  <p className="truncate text-xs">{v.title}</p>
                  <span
                    className={`text-[10px] block font-mono ${
                      isSelected ? 'text-white/80' : 'text-[#777777]'
                    }`}
                  >
                    {isOut ? 'Agotado' : `${v.stock} disponibles`}
                  </span>
                </div>
                <span className="font-mono font-black text-xs">{formatCurrency(v.price)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
