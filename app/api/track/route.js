import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();

    const {
      server_uuid,
      plugin_name,
      plugin_version,
      server_version,
      server_software,
      java_version,
      os_arch,
      os_name,
      event_type,
      player_count,
    } = data;

    // Basic validation
    if (!server_uuid || !plugin_name) {
      return NextResponse.json(
        { error: 'Missing required fields: server_uuid, plugin_name' },
        { status: 400 }
      );
    }

    const stmt = db.prepare(`
      INSERT INTO events (
        server_uuid,
        plugin_name,
        plugin_version,
        server_version,
        server_software,
        java_version,
        os_arch,
        os_name,
        event_type,
        player_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      server_uuid,
      plugin_name,
      plugin_version || null,
      server_version || null,
      server_software || null,
      java_version || null,
      os_arch || null,
      os_name || null,
      event_type || 'STARTUP',
      player_count != null ? player_count : null
    );

    // Look up latest version for this plugin
    const metaStmt = db.prepare('SELECT latest_version FROM plugin_metadata WHERE plugin_name = ?');
    const metaRow = metaStmt.get(plugin_name);

    if (metaRow && metaRow.latest_version) {
      return NextResponse.json({ success: true, latest_version: metaRow.latest_version }, { status: 201 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error in /api/track:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Handle preflight requests safely if CORS is needed
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
