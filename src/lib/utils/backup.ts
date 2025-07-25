import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export class BackupService {
  private static readonly BACKUP_DIR = process.env.BACKUP_DIR || './backups';
  private static readonly RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || '30');

  // Utwórz backup bazy danych
  static async createBackup(): Promise<string> {
    try {
      // Utwórz katalog backupów jeśli nie istnieje
      if (!fs.existsSync(this.BACKUP_DIR)) {
        fs.mkdirSync(this.BACKUP_DIR, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `backup-${timestamp}.sql`;
      const backupPath = path.join(this.BACKUP_DIR, backupFileName);

      // Komenda pg_dump dla PostgreSQL
      const pgDumpCommand = `pg_dump -h ${process.env.PGHOST} -p ${process.env.PGPORT} -U ${process.env.PGUSER} -d ${process.env.PGDATABASE} -f ${backupPath}`;

      await execAsync(pgDumpCommand, {
        env: {
          ...process.env,
          PGPASSWORD: process.env.PGPASSWORD
        }
      });

      console.log(`Backup utworzony: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('Błąd podczas tworzenia backupu:', error);
      throw error;
    }
  }

  // Przywróć backup
  static async restoreBackup(backupPath: string): Promise<void> {
    try {
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Plik backupu nie istnieje: ${backupPath}`);
      }

      // Komenda psql dla PostgreSQL
      const psqlCommand = `psql -h ${process.env.PGHOST} -p ${process.env.PGPORT} -U ${process.env.PGUSER} -d ${process.env.PGDATABASE} -f ${backupPath}`;

      await execAsync(psqlCommand, {
        env: {
          ...process.env,
          PGPASSWORD: process.env.PGPASSWORD
        }
      });

      console.log(`Backup przywrócony z: ${backupPath}`);
    } catch (error) {
      console.error('Błąd podczas przywracania backupu:', error);
      throw error;
    }
  }

  // Usuń stare backupy
  static async cleanupOldBackups(): Promise<void> {
    try {
      if (!fs.existsSync(this.BACKUP_DIR)) {
        return;
      }

      const files = fs.readdirSync(this.BACKUP_DIR);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.RETENTION_DAYS);

      for (const file of files) {
        const filePath = path.join(this.BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          console.log(`Usunięto stary backup: ${file}`);
        }
      }
    } catch (error) {
      console.error('Błąd podczas czyszczenia starych backupów:', error);
    }
  }

  // Lista dostępnych backupów
  static getBackupList(): string[] {
    try {
      if (!fs.existsSync(this.BACKUP_DIR)) {
        return [];
      }

      return fs.readdirSync(this.BACKUP_DIR)
        .filter(file => file.endsWith('.sql'))
        .map(file => path.join(this.BACKUP_DIR, file))
        .sort((a, b) => {
          const statsA = fs.statSync(a);
          const statsB = fs.statSync(b);
          return statsB.mtime.getTime() - statsA.mtime.getTime();
        });
    } catch (error) {
      console.error('Błąd podczas listowania backupów:', error);
      return [];
    }
  }
} 