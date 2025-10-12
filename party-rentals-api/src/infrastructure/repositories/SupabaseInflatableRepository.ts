import { SupabaseClient } from '@supabase/supabase-js';
import {
  IInflatableRepository,
  Inflatable,
  InflatableId,
  InflatableSize,
  InflatableSizeType,
  RentalPrice,
  RentalDate
} from 'party-rentals-core';

interface InflatableRow {
  id: string;
  name: string;
  size: string;
  base_price: number;
  is_active: boolean;
  setup_time_minutes: number;
  image_urls: string[];
  created_at: string;
  updated_at: string;
}

export class SupabaseInflatableRepository implements IInflatableRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: InflatableId): Promise<Inflatable | null> {
    const { data, error } = await this.supabase
      .from('inflatables')
      .select('*')
      .eq('id', id.value)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapRowToEntity(data);
  }

  async findAllActive(): Promise<Inflatable[]> {
    const { data, error } = await this.supabase
      .from('inflatables')
      .select('*')
      .eq('is_active', true);

    if (error || !data) {
      return [];
    }

    return data.map(row => this.mapRowToEntity(row));
  }

  async findBySize(size: string): Promise<Inflatable[]> {
    const { data, error } = await this.supabase
      .from('inflatables')
      .select('*')
      .eq('size', size)
      .eq('is_active', true);

    if (error || !data) {
      return [];
    }

    return data.map(row => this.mapRowToEntity(row));
  }

  async isAvailableOn(id: InflatableId, date: RentalDate): Promise<boolean> {
    // Check if there's any confirmed or pending rental for this inflatable on this date
    const { data, error } = await this.supabase
      .from('rentals')
      .select('id')
      .eq('inflatable_id', id.value)
      .eq('rental_date', date.getFormattedDate())
      .in('status', ['PENDING', 'CONFIRMED']);

    if (error) {
      throw new Error(`Error checking availability: ${error.message}`);
    }

    return !data || data.length === 0;
  }

  async save(inflatable: Inflatable): Promise<void> {
    const row = this.mapEntityToRow(inflatable);
    
    const { error } = await this.supabase
      .from('inflatables')
      .upsert(row);

    if (error) {
      throw new Error(`Error saving inflatable: ${error.message}`);
    }
  }

  async delete(id: InflatableId): Promise<void> {
    const { error } = await this.supabase
      .from('inflatables')
      .delete()
      .eq('id', id.value);

    if (error) {
      throw new Error(`Error deleting inflatable: ${error.message}`);
    }
  }

  private mapRowToEntity(row: InflatableRow): Inflatable {
    const sizeType = row.size as InflatableSizeType;
    const size = new InflatableSize(sizeType);
    const price = new RentalPrice(row.base_price);
    const id: InflatableId = { value: row.id };

    return new Inflatable(
      id,
      row.name,
      size,
      price,
      row.is_active,
      row.setup_time_minutes,
      row.image_urls
    );
  }

  private mapEntityToRow(inflatable: Inflatable): Partial<InflatableRow> {
    return {
      id: inflatable.getId().value,
      name: inflatable.getName(),
      size: inflatable.getSize().getValue(),
      base_price: inflatable.getBasePrice().getValue(),
      is_active: inflatable.isAvailable(),
      setup_time_minutes: inflatable.getSetupTimeMinutes(),
      image_urls: inflatable.getImageUrls(),
      updated_at: new Date().toISOString()
    };
  }
}
