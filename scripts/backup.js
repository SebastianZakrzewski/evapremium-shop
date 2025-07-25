const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = './backups';
const RETENTION_DAYS = 30;

// Utwórz katalog backupów jeśli nie istnieje
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `backup-${timestamp}.sql`;
  const backupPath = path.join(BACKUP_DIR, backupFileName);

  console.log('🔄 Tworzenie backupu...');

  // Komenda pg_dump dla PostgreSQL
  const pgDumpCommand = `pg_dump -h ${process.env.PGHOST || 'localhost'} -p ${process.env.PGPORT || '5432'} -U ${process.env.PGUSER || 'eva_user'} -d ${process.env.PGDATABASE || 'eva_db'} -f ${backupPath}`;

  exec(pgDumpCommand, {
    env: {
      ...process.env,
      PGPASSWORD: process.env.PGPASSWORD || 'eva_password'
    }
  }, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Błąd podczas tworzenia backupu:', error.message);
      return;
    }
    console.log(`✅ Backup utworzony: ${backupPath}`);
  });
}

function listBackups() {
  console.log('📋 Lista dostępnych backupów:');
  
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('❌ Brak katalogu backupów');
    return;
  }

  const files = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.endsWith('.sql'))
    .map(file => path.join(BACKUP_DIR, file))
    .sort((a, b) => {
      const statsA = fs.statSync(a);
      const statsB = fs.statSync(b);
      return statsB.mtime.getTime() - statsA.mtime.getTime();
    });

  if (files.length === 0) {
    console.log('❌ Brak dostępnych backupów');
  } else {
    files.forEach((backup, index) => {
      const stats = fs.statSync(backup);
      console.log(`${index + 1}. ${backup} (${stats.mtime.toLocaleString()})`);
    });
  }
}

function cleanupOldBackups() {
  console.log('🧹 Czyszczenie starych backupów...');
  
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('❌ Brak katalogu backupów');
    return;
  }

  const files = fs.readdirSync(BACKUP_DIR);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

  let deletedCount = 0;
  for (const file of files) {
    const filePath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filePath);
    
    if (stats.mtime < cutoffDate) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Usunięto stary backup: ${file}`);
      deletedCount++;
    }
  }

  if (deletedCount === 0) {
    console.log('✅ Brak starych backupów do usunięcia');
  } else {
    console.log(`✅ Usunięto ${deletedCount} starych backupów`);
  }
}

// Główna logika
const command = process.argv[2];

switch (command) {
  case 'create':
    createBackup();
    break;
  case 'list':
    listBackups();
    break;
  case 'cleanup':
    cleanupOldBackups();
    break;
  default:
    console.log('📖 Dostępne komendy:');
    console.log('  npm run backup:create    - Utwórz nowy backup');
    console.log('  npm run backup:list      - Lista dostępnych backupów');
    console.log('  npm run backup:cleanup   - Usuń stare backupy');
    break;
} 