import React from 'react';
import { ProductSpecification } from '../../types';

interface ProductSpecsTableProps {
  specifications: ProductSpecification[];
  sku: string;
  brandName?: string;
  weight?: number;
}

export function ProductSpecsTable({
  specifications,
  sku,
  brandName,
  weight,
}: ProductSpecsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#FFFFFF] dark:bg-[#242526]">
      <div className="border-b border-[#D9D9D9] dark:border-[#3A3B3C] bg-[#D9D9D9]/20 dark:bg-[#1E1F20] px-6 py-4">
        <h4 className="text-xs font-black text-[#353535] dark:text-[#F5F6F8] uppercase tracking-wider">
          Especificaciones Técnicas
        </h4>
      </div>
      <dl className="divide-y divide-[#D9D9D9]/60 dark:divide-[#3A3B3C]/60 text-[#353535] dark:text-[#F5F6F8]">
        <div className="grid grid-cols-3 px-6 py-3 text-xs">
          <dt className="font-semibold text-[#777777] dark:text-[#A8ABB2]">SKU</dt>
          <dd className="col-span-2 font-mono font-bold">{sku}</dd>
        </div>
        {brandName && (
          <div className="grid grid-cols-3 px-6 py-3 text-xs bg-[#D9D9D9]/10 dark:bg-[#1E1F20]/50">
            <dt className="font-semibold text-[#777777] dark:text-[#A8ABB2]">Marca</dt>
            <dd className="col-span-2 font-bold">{brandName}</dd>
          </div>
        )}
        {weight && (
          <div className="grid grid-cols-3 px-6 py-3 text-xs">
            <dt className="font-semibold text-[#777777] dark:text-[#A8ABB2]">Peso</dt>
            <dd className="col-span-2 font-mono">{weight} kg</dd>
          </div>
        )}
        {specifications && specifications.map((spec, index) => (
          <div
            key={spec.id || index}
            className={`grid grid-cols-3 px-6 py-3 text-xs ${
              index % 2 === 0 ? 'bg-[#D9D9D9]/10 dark:bg-[#1E1F20]/50' : 'bg-[#FFFFFF] dark:bg-[#242526]'
            }`}
          >
            <dt className="font-semibold text-[#777777] dark:text-[#A8ABB2]">{spec.key || (spec as any).name}</dt>
            <dd className="col-span-2 font-medium">{spec.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
