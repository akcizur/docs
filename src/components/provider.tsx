'use client';

import { type ReactNode } from 'react';
import SearchDialog from '@/components/search';
import { RootProvider } from 'fumadocs-ui/provider/next';

export function Provider({ children }: { children: ReactNode }) {
  return <RootProvider search={{ SearchDialog }}>{children}</RootProvider>;
}
