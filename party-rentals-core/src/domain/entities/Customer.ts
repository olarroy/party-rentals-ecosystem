export interface CustomerId {
  readonly value: string;
}

export class Customer {
  constructor(
    private readonly id: CustomerId,
    private readonly fullName: string,
    private readonly email: string,
    private readonly phone: string,
    private readonly address: string,
    private readonly createdAt: Date
  ) {
    this.validateEmail(email);
    this.validatePhone(phone);
  }

  getId(): CustomerId {
    return this.id;
  }

  getFullName(): string {
    return this.fullName;
  }

  getEmail(): string {
    return this.email;
  }

  getPhone(): string {
    return this.phone;
  }

  getAddress(): string {
    return this.address;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  equals(other: Customer): boolean {
    return this.id.value === other.id.value;
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  private validatePhone(phone: string): void {
    // Simple phone validation - adjust regex based on your requirements
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error('Invalid phone format');
    }
  }
}
