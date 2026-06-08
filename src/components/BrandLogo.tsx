import React from 'react';
import { cn } from '@/lib/utils';

export interface BrandLogoProps {
  className?: string;
  showERP?: boolean;
}

export function BrandLogo({ className, showERP = false }: BrandLogoProps) {
  return (
    <span className={cn("tracking-tight text-foreground", className)}>
      Re<span className="italic font-bold text-primary">Schools</span>
      {showERP && <span className="font-normal text-muted-foreground ml-1">ERP</span>}
    </span>
  );
}
