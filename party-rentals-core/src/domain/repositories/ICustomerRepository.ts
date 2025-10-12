import { Customer, CustomerId } from '../entities/Customer';

export interface ICustomerRepository {
  /**
   * Retrieve a customer by their unique identifier
   */
  findById(id: CustomerId): Promise<Customer | null>;

  /**
   * Find a customer by their email address
   */
  findByEmail(email: string): Promise<Customer | null>;

  /**
   * Find a customer by their phone number
   */
  findByPhone(phone: string): Promise<Customer | null>;

  /**
   * Search customers by name (partial match)
   */
  findByNameContaining(name: string): Promise<Customer[]>;

  /**
   * Save or update a customer
   */
  save(customer: Customer): Promise<void>;

  /**
   * Remove a customer from the repository
   */
  delete(id: CustomerId): Promise<void>;

  /**
   * Get all customers (with optional pagination)
   */
  findAll(limit?: number, offset?: number): Promise<Customer[]>;

  /**
   * Check if a customer exists with the given email
   */
  existsByEmail(email: string): Promise<boolean>;
}
