import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  const resolvedParams = await params;
  const pluginName = decodeURIComponent(resolvedParams.name);

  try {
    // Check auth cookie to ensure only admins can delete plugins
    const sessionCookie = request.cookies.get('auth_session');
    if (!sessionCookie || sessionCookie.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Wrap in a transaction to safely delete from both tables
    const transaction = db.transaction((name) => {
      db.prepare('DELETE FROM plugin_metadata WHERE plugin_name = ?').run(name);
      db.prepare('DELETE FROM events WHERE plugin_name = ?').run(name);
    });
    
    transaction(pluginName);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting plugin:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
