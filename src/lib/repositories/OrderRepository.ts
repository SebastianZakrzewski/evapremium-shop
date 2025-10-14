import { BaseRepository } from './BaseRepository';
import { Order, OrderStatus, PaymentStatus } from '../types/order-new';

export class OrderRepository extends BaseRepository<Order> {
  protected tableName = 'orders';

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        order_items(*)
      `)
      .eq('order_number', orderNumber)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Error finding order by number: ${error.message}`);
    }

    return data;
  }

  async findByCustomerEmail(email: string): Promise<Order[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        order_items(*)
      `)
      .eq('customer->>email', email)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error finding orders by customer email: ${error.message}`);
    }

    return data || [];
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        order_items(*)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error finding orders by status: ${error.message}`);
    }

    return data || [];
  }

  async updateStatus(
    id: string, 
    status: OrderStatus, 
    trackingNumber?: string
  ): Promise<Order> {
    const updateData: any = { status };
    
    if (status === 'shipped' && trackingNumber) {
      updateData.tracking_number = trackingNumber;
      updateData.shipped_at = new Date().toISOString();
    }
    
    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    const { data, error } = await this.supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        order_items(*)
      `)
      .single();

    if (error) {
      throw new Error(`Error updating order status: ${error.message}`);
    }

    return data;
  }

  async countOrdersThisYear(): Promise<number> {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1).toISOString();
    const endOfYear = new Date(currentYear + 1, 0, 1).toISOString();

    const { count, error } = await this.supabase
      .from(this.tableName)
      .select('count', { count: 'exact' })
      .gte('created_at', startOfYear)
      .lt('created_at', endOfYear);

    if (error) {
      throw new Error(`Error counting orders this year: ${error.message}`);
    }

    return count || 0;
  }

  async getOrderStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  }> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('status');

    if (error) {
      throw new Error(`Error getting order stats: ${error.message}`);
    }

    const stats = {
      total: data?.length || 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };

    data?.forEach(order => {
      switch (order.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'processing':
          stats.processing++;
          break;
        case 'shipped':
          stats.shipped++;
          break;
        case 'delivered':
          stats.delivered++;
          break;
        case 'cancelled':
          stats.cancelled++;
          break;
      }
    });

    return stats;
  }
}
