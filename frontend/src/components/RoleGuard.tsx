'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { UserSession } from '@/types';

interface RoleGuardProps {
  allowedRoles: Array<UserSession['role']>;
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user } = useAuthStore();

  if (!user) return null;
  
  if (allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  return null;
};
