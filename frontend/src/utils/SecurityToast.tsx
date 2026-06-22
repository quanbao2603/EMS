import { toast } from 'sonner';
import { ShieldAlert } from 'lucide-react';
import React from 'react';

export const triggerSecurityToast = (message: string) => {
  toast(
    <div className="flex items-center gap-2 font-semibold">
      <ShieldAlert className="h-5 w-5 text-white" />
      <span>{message}</span>
    </div>,
    {
      style: {
        backgroundColor: '#7f1d1d', // Màn nền đỏ sẫm (tailwind bg-red-900)
        color: 'white',
        border: '1px solid #991b1b', // border-red-800
      },
      duration: 5000,
    }
  );
};
