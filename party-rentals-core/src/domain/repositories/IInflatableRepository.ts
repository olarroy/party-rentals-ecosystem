import { Inflatable, InflatableId } from '../entities/Inflatable';
import { RentalDate } from '../value-objects/RentalDate';

export interface IInflatableRepository {
  /**
   * Retrieve an inflatable by its unique identifier
   */
  findById(id: InflatableId): Promise<Inflatable | null>;

  /**
   * Get all active inflatables
   */
  findAllActive(): Promise<Inflatable[]>;

  /**
   * Check if an inflatable is available on a specific date
   */
  isAvailableOn(id: InflatableId, date: RentalDate): Promise<boolean>;

  /**
   * Get all inflatables of a specific size
   */
  findBySize(size: string): Promise<Inflatable[]>;

  /**
   * Save or update an inflatable
   */
  save(inflatable: Inflatable): Promise<void>;

  /**
   * Remove an inflatable from the repository
   */
  delete(id: InflatableId): Promise<void>;
}
