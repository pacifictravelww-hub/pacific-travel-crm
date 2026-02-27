'use client';

import { ReactNode } from 'react';
import { useUser } from '@/lib/userContext';

interface RoleGuardProps {
  roles: string[];
  children: ReactNode;
}

export function RoleGuard({ roles, children }: RoleGuardProps) {
  const { profile } = useUser();
  if (!profile || !roles.includes(profile.role)) return null;
  return <>{children}</>;
}
