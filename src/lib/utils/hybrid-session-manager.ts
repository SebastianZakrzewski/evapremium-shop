import { getCookie, setCookie, deleteCookie } from 'cookies-next';

export interface SessionData {
  sessionId: string;
  userId?: string;
  configData?: any;
  orderData?: any;
  metadata: {
    createdAt: Date;
    lastAccessed: Date;
    expiresAt: Date;
    source: string;
  };
}

export class HybridSessionManager {
  private static readonly SESSION_COOKIE_NAME = 'eva-session-id';
  private static readonly SESSION_EXPIRY_DAYS = 7;
  private static readonly REDIS_TTL = 3600; // 1 godzina
  private static readonly DB_TTL = 30 * 24 * 3600; // 30 dni

  /**
   * Generuje lub pobiera unikalny ID sesji
   */
  static getSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = getCookie(this.SESSION_COOKIE_NAME) as string;
      
      if (!sessionId) {
        sessionId = this.generateSessionId();
        this.setSessionCookie(sessionId);
        console.log('🆔 Nowa sesja utworzona:', sessionId);
      }
      
      return sessionId;
    }
    
    return `temp-session-${Date.now()}`;
  }

  /**
   * Ustawia cookie sesji
   */
  private static setSessionCookie(sessionId: string): void {
    setCookie(this.SESSION_COOKIE_NAME, sessionId, {
      maxAge: this.SESSION_EXPIRY_DAYS * 24 * 60 * 60,
      httpOnly: false,
      secure: Boolean(process.env.NODE_ENV === 'production'),
      sameSite: 'lax',
      path: '/'
    });
  }

  /**
   * Generuje unikalny ID sesji
   */
  private static generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 10) : 'unknown';
    const screenInfo = typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : 'unknown';
    
    return `session-${timestamp}-${random}-${userAgent}-${screenInfo}`;
  }

  /**
   * Sprawdza czy sesja jest ważna
   */
  static isValidSession(sessionId: string): boolean {
    return sessionId && !sessionId.startsWith('temp-');
  }

  /**
   * Zapisuje dane konfiguracji w localStorage (szybkie)
   */
  static saveConfigData(sessionId: string, configData: any): void {
    if (typeof window !== 'undefined' && this.isValidSession(sessionId)) {
      const data = {
        ...configData,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(`config-${sessionId}`, JSON.stringify(data));
      console.log('💾 Zapisano dane konfiguracji w localStorage');
    }
  }

  /**
   * Pobiera dane konfiguracji z localStorage
   */
  static getConfigData(sessionId: string): any | null {
    if (typeof window !== 'undefined' && this.isValidSession(sessionId)) {
      const data = localStorage.getItem(`config-${sessionId}`);
      if (data) {
        console.log('📋 Pobrano dane konfiguracji z localStorage');
        return JSON.parse(data);
      }
    }
    return null;
  }

  /**
   * Zapisuje dane zamówienia w localStorage (tymczasowe)
   */
  static saveOrderData(sessionId: string, orderData: any): void {
    if (typeof window !== 'undefined' && this.isValidSession(sessionId)) {
      const data = {
        ...orderData,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(`order-${sessionId}`, JSON.stringify(data));
      console.log('💾 Zapisano dane zamówienia w localStorage');
    }
  }

  /**
   * Pobiera dane zamówienia z localStorage
   */
  static getOrderData(sessionId: string): any | null {
    if (typeof window !== 'undefined' && this.isValidSession(sessionId)) {
      const data = localStorage.getItem(`order-${sessionId}`);
      if (data) {
        console.log('📋 Pobrano dane zamówienia z localStorage');
        return JSON.parse(data);
      }
    }
    return null;
  }

  /**
   * Symulacja Redis cache (w rzeczywistej implementacji użyj Redis)
   */
  static async cacheSessionData(sessionId: string, data: any): Promise<void> {
    if (this.isValidSession(sessionId)) {
      // Symulacja Redis - w rzeczywistości użyj Redis client
      const cacheKey = `cache:${sessionId}`;
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl: this.REDIS_TTL
      };
      
      // Symulacja zapisu do Redis
      console.log('🔥 Zapisano dane w cache (Redis):', cacheKey);
      
      // W rzeczywistej implementacji:
      // await redis.setex(cacheKey, this.REDIS_TTL, JSON.stringify(cacheData));
    }
  }

  /**
   * Pobiera dane z cache (Redis)
   */
  static async getCachedData(sessionId: string): Promise<any | null> {
    if (this.isValidSession(sessionId)) {
      // Symulacja Redis - w rzeczywistości użyj Redis client
      const cacheKey = `cache:${sessionId}`;
      
      // W rzeczywistej implementacji:
      // const cachedData = await redis.get(cacheKey);
      // if (cachedData) {
      //   const parsed = JSON.parse(cachedData);
      //   if (Date.now() - parsed.timestamp < parsed.ttl * 1000) {
      //     console.log('🔥 Pobrano dane z cache (Redis)');
      //     return parsed.data;
      //   }
      // }
      
      console.log('🔥 Symulacja pobierania z cache (Redis)');
      return null;
    }
    return null;
  }

  /**
   * Symulacja zapisu do bazy danych (trwałe dane)
   */
  static async saveToDatabase(sessionId: string, data: any): Promise<void> {
    if (this.isValidSession(sessionId)) {
      // Symulacja zapisu do bazy danych
      const dbData = {
        sessionId,
        data,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + this.DB_TTL * 1000)
      };
      
      console.log('🗄️ Zapisano dane w bazie danych:', sessionId);
      
      // W rzeczywistej implementacji:
      // await db.sessions.upsert({
      //   where: { sessionId },
      //   update: { data: dbData, updatedAt: new Date() },
      //   create: dbData
      // });
    }
  }

  /**
   * Pobiera dane z bazy danych
   */
  static async getFromDatabase(sessionId: string): Promise<any | null> {
    if (this.isValidSession(sessionId)) {
      // Symulacja pobierania z bazy danych
      console.log('🗄️ Pobrano dane z bazy danych:', sessionId);
      
      // W rzeczywistej implementacji:
      // const dbData = await db.sessions.findUnique({
      //   where: { sessionId }
      // });
      // if (dbData && dbData.expiresAt > new Date()) {
      //   return dbData.data;
      // }
      
      return null;
    }
    return null;
  }

  /**
   * Kompleksowe zapisanie danych używając wszystkich warstw
   */
  static async saveData(sessionId: string, data: any, type: 'config' | 'order' | 'all' = 'all'): Promise<void> {
    if (!this.isValidSession(sessionId)) return;

    try {
      // 1. LocalStorage (szybkie)
      if (type === 'config' || type === 'all') {
        this.saveConfigData(sessionId, data);
      }
      if (type === 'order' || type === 'all') {
        this.saveOrderData(sessionId, data);
      }

      // 2. Cache (Redis) - bardzo szybkie
      await this.cacheSessionData(sessionId, data);

      // 3. Database - trwałe
      await this.saveToDatabase(sessionId, data);

      console.log('✅ Dane zapisane we wszystkich warstwach');
    } catch (error) {
      console.error('❌ Błąd podczas zapisywania danych:', error);
    }
  }

  /**
   * Kompleksowe pobieranie danych z fallback
   */
  static async getData(sessionId: string, type: 'config' | 'order' | 'all' = 'all'): Promise<any | null> {
    if (!this.isValidSession(sessionId)) return null;

    try {
      // 1. Cache (Redis) - najszybsze
      let data = await this.getCachedData(sessionId);
      if (data) return data;

      // 2. LocalStorage - szybkie
      if (type === 'config' || type === 'all') {
        data = this.getConfigData(sessionId);
        if (data) return data;
      }
      if (type === 'order' || type === 'all') {
        data = this.getOrderData(sessionId);
        if (data) return data;
      }

      // 3. Database - wolne, ale trwałe
      data = await this.getFromDatabase(sessionId);
      if (data) {
        // Przywróć do cache
        await this.cacheSessionData(sessionId, data);
        return data;
      }

      console.log('📭 Brak danych dla sesji:', sessionId);
      return null;
    } catch (error) {
      console.error('❌ Błąd podczas pobierania danych:', error);
      return null;
    }
  }

  /**
   * Czyści wszystkie dane sesji
   */
  static clearSession(sessionId: string): void {
    if (typeof window !== 'undefined' && this.isValidSession(sessionId)) {
      // Usuń z localStorage
      localStorage.removeItem(`config-${sessionId}`);
      localStorage.removeItem(`order-${sessionId}`);
      
      // Usuń cookie
      deleteCookie(this.SESSION_COOKIE_NAME);
      
      console.log('🧹 Sesja wyczyszczona:', sessionId);
    }
  }

  /**
   * Debugowanie sesji (tylko development)
   */
  static debugSession(sessionId: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('🆔 Session ID:', sessionId);
      console.log('💾 LocalStorage config:', localStorage.getItem(`config-${sessionId}`));
      console.log('💾 LocalStorage order:', localStorage.getItem(`order-${sessionId}`));
      console.log('🍪 Cookie:', getCookie(this.SESSION_COOKIE_NAME));
    }
  }
} 