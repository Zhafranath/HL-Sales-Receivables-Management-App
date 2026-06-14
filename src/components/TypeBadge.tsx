'use client';

import { motion } from 'framer-motion';
import type { ProductType } from '@/types';

interface Props {
  tipe: ProductType;
  size?: 'sm' | 'md';
}

const labels: Record<ProductType, string> = { LM: 'Local Market', BR: 'Bursa' };

export default function TypeBadge({ tipe, size = 'sm' }: Props) {
  const base = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1';
  const color = tipe === 'LM' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700';

  return (
    <motion.span
      whileHover={{ scale: 1.08 }}
      title={labels[tipe]}
      className={`${base} rounded-full font-medium cursor-default ${color}`}
    >
      {tipe}
    </motion.span>
  );
}
