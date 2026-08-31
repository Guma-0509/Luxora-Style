'use client';

import React, { useState, useEffect } from 'react';
import { ProductVariant } from '../../types';
import { Check } from 'lucide-react';

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

  // Extraer nombres de atributos únicos (ej. ["color", "talla", "capacidad"])
  const attributeKeys: string[] = Array.from(
    new Set(variants.flatMap((v) => Object.keys(v.attributes || {}))),
  );

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    if (selectedVariant && selectedVariant.attributes) {
      return { ...selectedVariant.attributes };
    }
    return variants[0]?.attributes ? { ...variants[0].attributes } : {};
  });

  // Cuando cambia una selección de atributo, encontrar la variante que mejor coincide
  const handleAttributeChange = (key: string, value: string) => {
    const nextAttrs = { ...selectedAttributes, [key]: value };
    setSelectedAttributes(nextAttrs);

    // Buscar coincidencia exacta
    const exactMatch = variants.find((v) => {
      return Object.entries(nextAttrs).every(([k, val]) => v.attributes?.[k] === val);
    });

    if (exactMatch) {
      onSelectVariant(exactMatch);
    } else {
      // Coincidencia parcial si no existe la combinación
      const partialMatch = variants.find((v) => v.attributes?.[key] === value);
      if (partialMatch) {
        setSelectedAttributes({ ...partialMatch.attributes });
        onSelectVariant(partialMatch);
      }
    }
  };

  return (
    <div className="space-y-5">
      {attributeKeys.map((attrKey) => {
        // Obtener todos los valores posibles para este atributo
        const possibleValues = Array.from(
          new Set(
            variants
              .map((v) => v.attributes?.[attrKey])
              .filter((val): val is string => Boolean(val)),
          ),
        );

        const currentValue = selectedAttributes[attrKey];

        return (
          <div key={attrKey} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-900">
                {attrKey}:
              </span>
              <span className="font-semibold text-brand-dark">{currentValue}</span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {possibleValues.map((val) => {
                const isSelected = currentValue === val;

                // Verificar si alguna variante con este valor tiene stock
                const hasStock = variants.some(
                  (v) => v.attributes?.[attrKey] === val && v.stock > 0,
                );

                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAttributeChange(attrKey, val)}
                    className={`relative flex items-center justify-center rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                      isSelected
                        ? 'border-primary-900 bg-primary-900 text-white shadow-md'
                        : 'border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50'
                    } ${!hasStock ? 'opacity-40 line-through' : ''}`}
                  >
                    {val}
                    {isSelected && <Check className="ml-1.5 h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
