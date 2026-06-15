'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeletePluginButton({ pluginName }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete all data for ${pluginName}? This cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/plugins/${encodeURIComponent(pluginName)}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        // Redirect back to the main dashboard after deletion
        router.push('/');
        router.refresh();
      } else {
        alert('Failed to delete plugin.');
        setLoading(false);
      }
    } catch (err) {
      alert('Error deleting plugin.');
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={loading}
      className="btn" 
      style={{ 
        background: 'rgba(239, 68, 68, 0.2)', 
        color: '#f87171', 
        border: '1px solid rgba(239, 68, 68, 0.5)',
        marginLeft: '1rem'
      }}
    >
      {loading ? 'Deleting...' : 'Delete Plugin'}
    </button>
  );
}
