import { User, CreateUserRequest, LoginRequest, AuthResponse } from '../types/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../database/prisma';

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static readonly JWT_EXPIRES_IN = '24h';

  // Rejestracja użytkownika
  static async register(data: CreateUserRequest): Promise<AuthResponse> {
    try {
      // Sprawdź czy użytkownik już istnieje
      // const existingUser = await prisma.user.findUnique({
      //   where: { email: data.email }
      // });

      // if (existingUser) {
      //   throw new Error('Użytkownik z tym adresem email już istnieje');
      // }

      // Hashuj hasło
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Utwórz użytkownika
      // const user = await prisma.user.create({
      //   data: {
      //     email: data.email,
      //     password: hashedPassword,
      //     firstName: data.firstName,
      //     lastName: data.lastName,
      //   }
      // });

      // Generuj token
      const token = jwt.sign(
        { userId: 'test-id', email: 'test@example.com' },
        this.JWT_SECRET,
        { expiresIn: this.JWT_EXPIRES_IN }
      );

      return {
        success: true,
        token,
        user: {
          id: 'test-id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'customer',
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Błąd rejestracji'
      };
    }
  }

  // Logowanie użytkownika
  static async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // Znajdź użytkownika
      // const user = await prisma.user.findUnique({
      //   where: { email: data.email }
      // });

      // if (!user) {
      //   throw new Error('Nieprawidłowy email lub hasło');
      // }

      // Sprawdź hasło
      // const isPasswordValid = await bcrypt.compare(data.password, user.password);
      
      // if (!isPasswordValid) {
      //   throw new Error('Nieprawidłowy email lub hasło');
      // }

      // Generuj token
      const token = jwt.sign(
        { userId: 'test-id', email: 'test@example.com' },
        this.JWT_SECRET,
        { expiresIn: this.JWT_EXPIRES_IN }
      );

      return {
        success: true,
        token,
        user: {
          id: 'test-id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'customer',
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Błąd logowania'
      };
    }
  }

  // Wylogowanie użytkownika
  static async logout(token: string): Promise<boolean> {
    try {
      // W rzeczywistej aplikacji tutaj byłaby blacklist tokenów
      return true;
    } catch (error) {
      return false;
    }
  }

  // Odświeżenie tokena
  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_SECRET) as any;
      
      // const user = await prisma.user.findUnique({
      //   where: { id: decoded.userId }
      // });

      // if (!user) {
      //   throw new Error('Użytkownik nie istnieje');
      // }

      const newToken = jwt.sign(
        { userId: 'test-id', email: 'test@example.com' },
        this.JWT_SECRET,
        { expiresIn: this.JWT_EXPIRES_IN }
      );

      return {
        success: true,
        token: newToken,
        user: {
          id: 'test-id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'customer',
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Nieprawidłowy token'
      };
    }
  }

  // Weryfikacja tokena
  static async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      
      // const user = await prisma.user.findUnique({
      //   where: { id: decoded.userId }
      // });

      // if (!user) {
      //   return null;
      // }

      return {
        id: 'test-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'customer',
      };
    } catch (error) {
      return null;
    }
  }

  // Zmiana hasła
  static async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      // const user = await prisma.user.findUnique({
      //   where: { id: userId }
      // });

      // if (!user) {
      //   return false;
      // }

      // Sprawdź stare hasło
      // const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      
      // if (!isOldPasswordValid) {
      //   return false;
      // }

      // Hashuj nowe hasło
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Zaktualizuj hasło
      // await prisma.user.update({
      //   where: { id: userId },
      //   data: { password: hashedNewPassword }
      // });

      return true;
    } catch (error) {
      return false;
    }
  }
} 