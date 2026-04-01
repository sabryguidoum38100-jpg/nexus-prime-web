'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  useEffect(() => {
    // Rediriger vers la page principale avec le paramètre pour ouvrir le modal de connexion
    router.replace('/?auth=login');
  }, [router]);
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Redirection...</p>
      </div>
    </div>
  );
}
