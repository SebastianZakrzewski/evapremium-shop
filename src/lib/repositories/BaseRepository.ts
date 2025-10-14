import { createClient } from '@supabase/supabase-js';

export abstract class BaseRepository<T> {
  protected get supabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('🔧 BaseRepository: SUPABASE_URL:', supabaseUrl);
    console.log('🔧 BaseRepository: SUPABASE_KEY:', supabaseKey ? '***' : 'undefined');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error(`Missing Supabase environment variables: URL=${!!supabaseUrl}, KEY=${!!supabaseKey}`);
    }
    
    return createClient(supabaseUrl, supabaseKey);
  }

  protected abstract tableName: string;

  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Error finding ${this.tableName} by id: ${error.message}`);
    }

    return data;
  }

  async findMany(where?: any, options?: any): Promise<T[]> {
    let query = this.supabase.from(this.tableName).select('*');

    if (where) {
      Object.keys(where).forEach(key => {
        if (where[key] !== undefined) {
          query = query.eq(key, where[key]);
        }
      });
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy, { 
        ascending: options.orderDirection !== 'desc' 
      });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error finding ${this.tableName}: ${error.message}`);
    }

    return data || [];
  }

  async create(data: any): Promise<T> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .insert([data])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating ${this.tableName}: ${error.message}`);
    }

    return result;
  }

  async update(id: string, data: any): Promise<T> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating ${this.tableName}: ${error.message}`);
    }

    return result;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting ${this.tableName}: ${error.message}`);
    }
  }

  async count(where?: any): Promise<number> {
    let query = this.supabase.from(this.tableName).select('count', { count: 'exact' });

    if (where) {
      Object.keys(where).forEach(key => {
        if (where[key] !== undefined) {
          query = query.eq(key, where[key]);
        }
      });
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Error counting ${this.tableName}: ${error.message}`);
    }

    return count || 0;
  }
}
