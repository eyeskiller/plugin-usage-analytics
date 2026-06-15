'use client';

import { useState } from 'react';

export default function LockToggle({ initialLocked }) {
  const [locked, setLocked] = useState(initialLocked);
  const [loading, setLoading] = useState(false);

  const toggleLock = async () => {
    setLoading(true);
    try {
      const newLockedState = !locked;
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locked: newLockedState })
      });

      if (res.ok) {
        setLocked(newLockedState);
      } else {
        alert('Failed to update lock status.');
      }
    } catch (e) {
      alert('Error updating lock status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleLock} 
      disabled={loading}
      className="btn" 
      style={{ 
        background: locked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', 
        color: locked ? '#f87171' : '#10b981', 
        border: `1px solid ${locked ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.5)'}`,
        marginLeft: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}
      title="Locks new plugin registration"
    >
      {locked ? (
        <>
          <span style={{ fontSize: '1.2rem' }}>🔒</span> Locked
        </>
      ) : (
        <>
          <span style={{ fontSize: '1.2rem' }}>🔓</span> Unlocked
        </>
      )}
    </button>
  );
}
