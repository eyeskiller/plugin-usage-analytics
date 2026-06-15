'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VersionManager({ pluginName, initialVersion }) {
  const [version, setVersion] = useState(initialVersion || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const res = await fetch(`/api/plugins/${encodeURIComponent(pluginName)}/version`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latest_version: version })
      });

      if (res.ok) {
        setMessage('Version updated successfully!');
        router.refresh();
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to update version');
      }
    } catch (e) {
      setMessage('Error updating version');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Version Management</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
        Set the latest version for this plugin. Minecraft servers will be notified if they are running an older version.
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input 
          type="text" 
          value={version} 
          onChange={e => setVersion(e.target.value)} 
          placeholder="e.g. 1.2.0"
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--card-border)',
            background: 'rgba(0, 0, 0, 0.2)',
            color: 'var(--text-main)',
            outline: 'none',
            flex: 1,
            maxWidth: '200px'
          }}
        />
        <button onClick={handleSave} disabled={loading} className="btn">
          {loading ? 'Saving...' : 'Save Version'}
        </button>
      </div>
      
      {message && <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: message.includes('success') ? 'var(--success)' : '#ef4444' }}>{message}</div>}
    </div>
  );
}
