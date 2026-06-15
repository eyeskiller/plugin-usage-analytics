import db from '@/lib/db';
import Link from 'next/link';
import LogoutButton from '@/app/components/LogoutButton';
import VersionManager from '@/app/components/VersionManager';
import DeletePluginButton from '@/app/components/DeletePluginButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PluginDetails({ params }) {
  const resolvedParams = await params;
  const pluginName = decodeURIComponent(resolvedParams.name);

  // General stats
  const totalServersRow = db.prepare('SELECT COUNT(DISTINCT server_uuid) as count FROM events WHERE plugin_name = ?').get(pluginName);
  const totalEventsRow = db.prepare('SELECT COUNT(id) as count FROM events WHERE plugin_name = ?').get(pluginName);

  // Version breakdown
  const versions = db.prepare(`
    SELECT plugin_version, COUNT(DISTINCT server_uuid) as servers 
    FROM events 
    WHERE plugin_name = ? AND plugin_version IS NOT NULL
    GROUP BY plugin_version 
    ORDER BY servers DESC
  `).all(pluginName);

  // Server software breakdown
  const software = db.prepare(`
    SELECT server_software, COUNT(DISTINCT server_uuid) as servers 
    FROM events 
    WHERE plugin_name = ? AND server_software IS NOT NULL
    GROUP BY server_software 
    ORDER BY servers DESC
  `).all(pluginName);

  // Server version breakdown (Minecraft version)
  const mcVersions = db.prepare(`
    SELECT server_version, COUNT(DISTINCT server_uuid) as servers 
    FROM events 
    WHERE plugin_name = ? AND server_version IS NOT NULL
    GROUP BY server_version 
    ORDER BY servers DESC
  `).all(pluginName);

  // Recent events
  const recentEvents = db.prepare(`
    SELECT * FROM events 
    WHERE plugin_name = ? 
    ORDER BY created_at DESC 
    LIMIT 20
  `).all(pluginName);

  // Get current latest version from metadata
  const metaRow = db.prepare('SELECT latest_version FROM plugin_metadata WHERE plugin_name = ?').get(pluginName);
  const currentLatestVersion = metaRow ? metaRow.latest_version : '';

  return (
    <div className="container">
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'var(--accent)', fontSize: '1.25rem' }}>
            &larr; Back
          </Link>
          <h1 style={{ display: 'inline-block', margin: 0 }}>{pluginName} Analytics</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <DeletePluginButton pluginName={pluginName} />
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
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* Plugin Versions */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Plugin Versions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {versions.length === 0 ? <span style={{ color: 'var(--text-muted)' }}>No data</span> : versions.map(v => (
              <div key={v.plugin_version} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>v{v.plugin_version}</span>
                <span className="badge">{v.servers} servers</span>
              </div>
            ))}
          </div>
        </div>

        {/* Server Software */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Server Software</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {software.length === 0 ? <span style={{ color: 'var(--text-muted)' }}>No data</span> : software.map(s => (
              <div key={s.server_software} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{s.server_software}</span>
                <span className="badge">{s.servers} servers</span>
              </div>
            ))}
          </div>
        </div>

        {/* Minecraft Versions */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Minecraft Versions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mcVersions.length === 0 ? <span style={{ color: 'var(--text-muted)' }}>No data</span> : mcVersions.map(m => (
              <div key={m.server_version} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{m.server_version}</span>
                <span className="badge">{m.servers} servers</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Recent Events for {pluginName}</h2>
        <div className="data-table-container">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Event</th>
                <th>Plugin Version</th>
                <th>MC Version</th>
                <th>Software</th>
                <th>Java</th>
                <th>Players</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No events recorded.</td>
                </tr>
              ) : (
                recentEvents.map(event => (
                  <tr key={event.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {new Date(event.created_at).toLocaleString()}
                    </td>
                    <td><span className="badge">{event.event_type}</span></td>
                    <td>{event.plugin_version || '-'}</td>
                    <td>{event.server_version || '-'}</td>
                    <td>{event.server_software || '-'}</td>
                    <td>{event.java_version || '-'}</td>
                    <td>{event.player_count !== null ? event.player_count : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <VersionManager pluginName={pluginName} initialVersion={currentLatestVersion} />
    </div>
  );
}
