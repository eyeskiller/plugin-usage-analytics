import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  const resolvedParams = await params;
  const pluginName = decodeURIComponent(resolvedParams.name);

  try {
    const { latest_version } = await request.json();

    if (!latest_version) {
      return NextResponse.json({ error: 'Missing latest_version' }, { status: 400 });
    }

    // Check auth cookie to ensure only admins can update this
    const sessionCookie = request.cookies.get('auth_session');
    if (!sessionCookie || sessionCookie.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stmt = db.prepare(`
      INSERT INTO plugin_metadata (plugin_name, latest_version)
      VALUES (?, ?)
      ON CONFLICT(plugin_name) DO UPDATE SET latest_version = excluded.latest_version
    `);
    
    stmt.run(pluginName, latest_version);

    return NextResponse.json({ success: true, latest_version }, { status: 200 });
  } catch (error) {
    console.error('Error updating version:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
