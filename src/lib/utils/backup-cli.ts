#!/usr/bin/env node

import { BackupService } from './backup';

async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'create':
        console.log('🔄 Tworzenie backupu...');
        const backupPath = await BackupService.createBackup();
        console.log(`✅ Backup utworzony: ${backupPath}`);
        break;

      case 'list':
        console.log('📋 Lista dostępnych backupów:');
        const backups = BackupService.getBackupList();
        if (backups.length === 0) {
          console.log('❌ Brak dostępnych backupów');
        } else {
          backups.forEach((backup, index) => {
            console.log(`${index + 1}. ${backup}`);
          });
        }
        break;

      case 'restore':
        const backupPathToRestore = process.argv[3];
        if (!backupPathToRestore) {
          console.error('❌ Podaj ścieżkę do backupu do przywrócenia');
          console.log('Użycie: npm run backup:restore <ścieżka-do-backupu>');
          process.exit(1);
        }
        console.log(`🔄 Przywracanie backupu: ${backupPathToRestore}`);
        await BackupService.restoreBackup(backupPathToRestore);
        console.log('✅ Backup przywrócony pomyślnie');
        break;

      case 'cleanup':
        console.log('🧹 Czyszczenie starych backupów...');
        await BackupService.cleanupOldBackups();
        console.log('✅ Stare backupy zostały usunięte');
        break;

      default:
        console.log('📖 Dostępne komendy:');
        console.log('  npm run backup:create    - Utwórz nowy backup');
        console.log('  npm run backup:list      - Lista dostępnych backupów');
        console.log('  npm run backup:restore   - Przywróć backup');
        console.log('  npm run backup:cleanup   - Usuń stare backupy');
        break;
    }
  } catch (error) {
    console.error('❌ Błąd:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main(); 