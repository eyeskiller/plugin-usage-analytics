import db from '@/lib/db';
import LogoutButton from './components/LogoutButton';
import LockToggle from './components/LockToggle';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Dashboard() {
  // Query statistics from SQLite
  const totalServersRow = db.prepare('SELECT COUNT(DISTINCT server_uuid) as count FROM events').get();
  const totalEventsRow = db.prepare('SELECT COUNT(id) as count FROM events').get();
  
  // Get active plugins and their counts
  const plugins = db.prepare(`
    SELECT plugin_name, COUNT(DISTINCT server_uuid) as servers 
    FROM events 
    GROUP BY plugin_name 
    ORDER BY servers DESC
  `).all();

  // Get recent events
  const recentEvents = db.prepare(`
    SELECT * FROM events 
    ORDER BY created_at DESC 
    LIMIT 10
  `).all();

  // Get lock state
  const lockRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('registration_locked');
  const isLocked = lockRow ? lockRow.value === 'true' : false;

  return (
    <div className="container">
      <header className="header">
        <h1>Analytics Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>System Online</span>
          </div>
          <LockToggle initialLocked={isLocked} />
          <LogoutButton />
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="stat-card glass-panel">
          <div className="stat-title">Total Unique Servers</div>
          <div className="stat-value">{totalServersRow.count}</div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-title">Total Events Logged</div>
          <div className="stat-value">{totalEventsRow.count}</div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-title">Active Plugins</div>
          <div className="stat-value">{plugins.length}</div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Plugin Popularity</h2>
          {plugins.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No data yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {plugins.map(p => (
                <Link key={p.plugin_name} href={`/plugin/${encodeURIComponent(p.plugin_name)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', transition: 'background 0.2s' }} className="plugin-row-hover">
                    <span style={{ fontWeight: 500 }}>{p.plugin_name}</span>
                    <span className="badge">{p.servers} servers</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Recent Events</h2>
          <div className="data-table-container">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Plugin</th>
                  <th>Event</th>
                  <th>Server Version</th>
                  <th>Software</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No events recorded yet.</td>
                  </tr>
                ) : (
                  recentEvents.map(event => (
                    <tr key={event.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {new Date(event.created_at).toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 500 }}>{event.plugin_name} {event.plugin_version}</td>
                      <td>
                        <span className="badge">{event.event_type}</span>
                      </td>
                      <td>{event.server_version || '-'}</td>
                      <td>{event.server_software || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
