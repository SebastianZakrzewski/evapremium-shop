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
  const backupFileName = `backup-${timestamp}.json`;
  const backupPath = path.join(BACKUP_DIR, backupFileName);

  console.log('🔄 Tworzenie backupu bazy danych...');

  // Użyj Prisma do eksportu danych
  const prismaCommand = `npx prisma db pull --schema=./prisma/schema.prisma`;

  exec(prismaCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Błąd podczas tworzenia backupu:', error.message);
      console.log('💡 Upewnij się, że:');
      console.log('   1. Baza danych PostgreSQL jest uruchomiona');
      console.log('   2. Zmienne środowiskowe są skonfigurowane');
      console.log('   3. Docker container z bazą danych jest aktywny');
      return;
    }

    // Zapisz informacje o backupie
    const backupInfo = {
      timestamp: new Date().toISOString(),
      database: process.env.PGDATABASE || 'eva_db',
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT || '5432',
      schema: stdout,
      version: '1.0'
    };

    fs.writeFileSync(backupPath, JSON.stringify(backupInfo, null, 2));
    console.log(`✅ Backup utworzony: ${backupPath}`);
    console.log(`📊 Rozmiar: ${(fs.statSync(backupPath).size / 1024).toFixed(2)} KB`);
  });
}

function listBackups() {
  console.log('📋 Lista dostępnych backupów:');
  
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('❌ Brak katalogu backupów');
    return;
  }

  const files = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.endsWith('.json'))
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
      const size = (stats.size / 1024).toFixed(2);
      console.log(`${index + 1}. ${backup} (${stats.mtime.toLocaleString()}) - ${size} KB`);
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

function checkDatabaseConnection() {
  console.log('🔍 Sprawdzanie połączenia z bazą danych...');
  
  const testCommand = `npx prisma db pull --schema=./prisma/schema.prisma`;
  
  exec(testCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Nie można połączyć się z bazą danych:');
      console.error('   Sprawdź czy:');
      console.error('   1. Docker container z PostgreSQL jest uruchomiony');
      console.error('   2. Zmienne środowiskowe są poprawnie ustawione');
      console.error('   3. Port 5432 jest dostępny');
      console.error('');
      console.error('   Aby uruchomić bazę danych:');
      console.error('   npm run docker:dev');
    } else {
      console.log('✅ Połączenie z bazą danych OK');
    }
  });
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
  case 'check':
    checkDatabaseConnection();
    break;
  default:
    console.log('📖 Dostępne komendy:');
    console.log('  npm run backup:create    - Utwórz nowy backup');
    console.log('  npm run backup:list      - Lista dostępnych backupów');
    console.log('  npm run backup:cleanup   - Usuń stare backupy');
    console.log('  npm run backup:check     - Sprawdź połączenie z bazą');
    break;
} 