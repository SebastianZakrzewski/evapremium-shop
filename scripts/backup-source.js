const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const BACKUP_DIR = './backups/source';
const RETENTION_DAYS = 30;

// Pliki i katalogi do wykluczenia z backupu
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.next',
  '.git',
  'backups',
  'dist',
  'build',
  'coverage',
  '.env',
  '.env.local',
  '.env.production',
  '*.log',
  'npm-debug.log*',
  'yarn-debug.log*',
  'yarn-error.log*',
  '.DS_Store',
  'Thumbs.db',
  '*.tmp',
  '*.temp'
];

// Utwórz katalog backupów jeśli nie istnieje
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function shouldExclude(filePath) {
  const relativePath = path.relative('.', filePath);
  
  return EXCLUDE_PATTERNS.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(relativePath);
    }
    return relativePath.includes(pattern);
  });
}

function createSourceBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `source-backup-${timestamp}.zip`;
  const backupPath = path.join(BACKUP_DIR, backupFileName);

  console.log('🔄 Tworzenie backupu kodu źródłowego...');
  console.log('📁 Katalogi wykluczone:', EXCLUDE_PATTERNS.join(', '));

  // Lista plików do backupu
  const filesToBackup = [];
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (shouldExclude(fullPath)) {
        continue;
      }
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else {
        filesToBackup.push(fullPath);
      }
    }
  }

  try {
    scanDirectory('.');
    
    console.log(`📊 Znaleziono ${filesToBackup.length} plików do backupu`);
    
    // Utwórz plik z listą plików
    const fileListPath = path.join(BACKUP_DIR, `file-list-${timestamp}.txt`);
    fs.writeFileSync(fileListPath, filesToBackup.join('\n'));
    
    // Utwórz backup jako JSON z zawartością plików
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      totalFiles: filesToBackup.length,
      files: {}
    };
    
    let totalSize = 0;
    
    for (const filePath of filesToBackup) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const stats = fs.statSync(filePath);
        
        backupData.files[filePath] = {
          content,
          size: stats.size,
          modified: stats.mtime.toISOString()
        };
        
        totalSize += stats.size;
      } catch (error) {
        console.warn(`⚠️ Nie można odczytać pliku: ${filePath}`);
      }
    }
    
    backupData.totalSize = totalSize;
    
    // Zapisz backup
    fs.writeFileSync(backupPath.replace('.zip', '.json'), JSON.stringify(backupData, null, 2));
    
    const backupSize = (fs.statSync(backupPath.replace('.zip', '.json')).size / 1024).toFixed(2);
    
    console.log(`✅ Backup kodu źródłowego utworzony:`);
    console.log(`   📁 Plik: ${backupPath.replace('.zip', '.json')}`);
    console.log(`   📊 Rozmiar: ${backupSize} KB`);
    console.log(`   📄 Plików: ${filesToBackup.length}`);
    console.log(`   📋 Lista plików: ${fileListPath}`);
    
    return backupPath.replace('.zip', '.json');
  } catch (error) {
    console.error('❌ Błąd podczas tworzenia backupu:', error.message);
    throw error;
  }
}

function listSourceBackups() {
  console.log('📋 Lista dostępnych backupów kodu źródłowego:');
  
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('❌ Brak katalogu backupów');
    return;
  }

  const files = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('source-backup-') && file.endsWith('.json'))
    .map(file => path.join(BACKUP_DIR, file))
    .sort((a, b) => {
      const statsA = fs.statSync(a);
      const statsB = fs.statSync(b);
      return statsB.mtime.getTime() - statsA.mtime.getTime();
    });

  if (files.length === 0) {
    console.log('❌ Brak dostępnych backupów kodu źródłowego');
  } else {
    files.forEach((backup, index) => {
      const stats = fs.statSync(backup);
      const size = (stats.size / 1024).toFixed(2);
      
      // Wczytaj informacje o backupie
      try {
        const backupData = JSON.parse(fs.readFileSync(backup, 'utf8'));
        console.log(`${index + 1}. ${path.basename(backup)}`);
        console.log(`   📅 Data: ${new Date(backupData.timestamp).toLocaleString()}`);
        console.log(`   📊 Rozmiar: ${size} KB`);
        console.log(`   📄 Plików: ${backupData.totalFiles}`);
        console.log(`   📁 Katalog: ${backup}`);
        console.log('');
      } catch (error) {
        console.log(`${index + 1}. ${path.basename(backup)} (błąd odczytu)`);
      }
    });
  }
}

function restoreSourceBackup(backupPath) {
  console.log(`🔄 Przywracanie backupu: ${backupPath}`);
  
  try {
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    console.log(`📊 Przywracanie ${backupData.totalFiles} plików...`);
    
    let restoredCount = 0;
    let errorCount = 0;
    
    for (const [filePath, fileData] of Object.entries(backupData.files)) {
      try {
        // Utwórz katalog jeśli nie istnieje
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Zapisz plik
        fs.writeFileSync(filePath, fileData.content);
        restoredCount++;
        
        console.log(`✅ Przywrócono: ${filePath}`);
      } catch (error) {
        console.error(`❌ Błąd przywracania ${filePath}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`✅ Przywracanie zakończone:`);
    console.log(`   ✅ Przywrócono: ${restoredCount} plików`);
    if (errorCount > 0) {
      console.log(`   ❌ Błędy: ${errorCount} plików`);
    }
  } catch (error) {
    console.error('❌ Błąd podczas przywracania backupu:', error.message);
  }
}

function cleanupOldSourceBackups() {
  console.log('🧹 Czyszczenie starych backupów kodu źródłowego...');
  
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('❌ Brak katalogu backupów');
    return;
  }

  const files = fs.readdirSync(BACKUP_DIR);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

  let deletedCount = 0;
  for (const file of files) {
    if (file.startsWith('source-backup-') && file.endsWith('.json')) {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Usunięto stary backup: ${file}`);
        deletedCount++;
      }
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
    createSourceBackup();
    break;
  case 'list':
    listSourceBackups();
    break;
  case 'restore':
    const backupPathToRestore = process.argv[3];
    if (!backupPathToRestore) {
      console.error('❌ Podaj ścieżkę do backupu do przywrócenia');
      console.log('Użycie: npm run backup:source:restore <ścieżka-do-backupu>');
      process.exit(1);
    }
    restoreSourceBackup(backupPathToRestore);
    break;
  case 'cleanup':
    cleanupOldSourceBackups();
    break;
  default:
    console.log('📖 Dostępne komendy:');
    console.log('  npm run backup:source:create    - Utwórz backup kodu źródłowego');
    console.log('  npm run backup:source:list      - Lista backupów kodu źródłowego');
    console.log('  npm run backup:source:restore   - Przywróć backup kodu źródłowego');
    console.log('  npm run backup:source:cleanup   - Usuń stare backupy kodu źródłowego');
    break;
} 