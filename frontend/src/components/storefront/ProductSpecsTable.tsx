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
    <div className="overflow-hidden rounded-2xl border border-[#D9D9D9] bg-[#FFFFFF]">
      <div className="border-b border-[#D9D9D9] bg-[#D9D9D9]/20 px-6 py-4">
        <h4 className="text-xs font-black text-[#353535] uppercase tracking-wider">
          Especificaciones Técnicas
        </h4>
      </div>
      <dl className="divide-y divide-[#D9D9D9]/60">
        <div className="grid grid-cols-3 px-6 py-3 text-xs">
          <dt className="font-semibold text-[#777777]">SKU</dt>
          <dd className="col-span-2 font-mono font-bold text-[#353535]">{sku}</dd>
        </div>
        {brandName && (
          <div className="grid grid-cols-3 px-6 py-3 text-xs bg-[#D9D9D9]/10">
            <dt className="font-semibold text-[#777777]">Marca</dt>
            <dd className="col-span-2 font-bold text-[#353535]">{brandName}</dd>
          </div>
        )}
        {weight && (
          <div className="grid grid-cols-3 px-6 py-3 text-xs">
            <dt className="font-semibold text-[#777777]">Peso</dt>
            <dd className="col-span-2 font-mono text-[#353535]">{weight} kg</dd>
          </div>
        )}
        {specifications && specifications.map((spec, index) => (
          <div
            key={spec.id}
            className={`grid grid-cols-3 px-6 py-3 text-xs ${
              index % 2 === 0 ? 'bg-[#D9D9D9]/10' : 'bg-[#FFFFFF]'
            }`}
          >
            <dt className="font-semibold text-[#777777]">{spec.key}</dt>
            <dd className="col-span-2 font-medium text-[#353535]">{spec.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
