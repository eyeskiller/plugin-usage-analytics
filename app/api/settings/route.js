import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const sessionCookie = request.cookies.get('auth_session');
    if (!sessionCookie || sessionCookie.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { locked } = await request.json();

    if (locked === undefined) {
      return NextResponse.json({ error: 'Missing locked state' }, { status: 400 });
    }

    db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(
      locked ? 'true' : 'false', 
      'registration_locked'
    );

    return NextResponse.json({ success: true, locked }, { status: 200 });
  } catch (error) {
    console.error('Error updating lock status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
