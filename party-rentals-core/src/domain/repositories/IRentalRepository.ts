import { Rental, RentalId, CustomerId } from '../entities/Rental';
import { InflatableId } from '../entities/Inflatable';
import { RentalDate } from '../value-objects/RentalDate';

export interface IRentalRepository {
  /**
   * Retrieve a rental by its unique identifier
   */
  findById(id: RentalId): Promise<Rental | null>;

  /**
   * Get all rentals for a specific customer
   */
  findByCustomerId(customerId: CustomerId): Promise<Rental[]>;

  /**
   * Get all rentals for a specific inflatable
   */
  findByInflatableId(inflatableId: InflatableId): Promise<Rental[]>;

  /**
   * Get all rentals for a specific date
   */
  findByDate(date: RentalDate): Promise<Rental[]>;

  /**
   * Check if an inflatable is booked on a specific date
   */
  isInflatableBookedOn(inflatableId: InflatableId, date: RentalDate): Promise<boolean>;

  /**
   * Get all rentals within a date range
   */
  findByDateRange(startDate: RentalDate, endDate: RentalDate): Promise<Rental[]>;

  /**
   * Save or update a rental
   */
  save(rental: Rental): Promise<void>;

  /**
   * Remove a rental from the repository
   */
  delete(id: RentalId): Promise<void>;

  /**
   * Get all rentals (with optional pagination)
   */
  findAll(limit?: number, offset?: number): Promise<Rental[]>;
}
