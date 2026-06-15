'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <button 
      onClick={handleLogout} 
      className="btn" 
      style={{ background: 'transparent', border: '1px solid var(--card-border)', marginLeft: '1rem' }}
    >
      Logout
    </button>
  );
}
