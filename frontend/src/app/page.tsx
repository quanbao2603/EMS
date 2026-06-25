import { Loader2 } from 'lucide-react';

// Middleware always redirects "/" to /login or /employees before this renders.
// Kept minimal as a safe fallback only.
export default function Home() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gray-950">
      <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
    </div>
  );
}
