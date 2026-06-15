import db from './lib/db.js';

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

stmt.run('user-uuid-1', 'FluidHopper', '1.0.0', '1.20.4', 'Paper', '17', 'amd64', 'Linux', 'STARTUP', 10);
stmt.run('user-uuid-2', 'FluidHopper', '1.0.0', '1.20.4', 'Paper', '17', 'amd64', 'Linux', 'STARTUP', 5);
stmt.run('user-uuid-1', 'FluidHopper', '1.0.0', '1.20.4', 'Paper', '17', 'amd64', 'Linux', 'HEARTBEAT', 12);
stmt.run('user-uuid-3', 'AutoMiner', '2.1.0', '1.19.4', 'Spigot', '17', 'arm64', 'Linux', 'STARTUP', 50);

console.log("Mock data inserted.");
