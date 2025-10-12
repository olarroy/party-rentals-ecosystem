export class RentalDate {
  private readonly value: Date;

  constructor(date: Date) {
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date provided');
    }

    // Normalize date to start of day for comparison
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (normalizedDate < today) {
      throw new Error('Rental date cannot be in the past');
    }

    // Business rule: minimum 24h advance booking
    const now = new Date();
    const minimumBookingTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    if (date < minimumBookingTime && normalizedDate > today) {
      throw new Error('Rental must be booked at least 24 hours in advance');
    }

    this.value = normalizedDate;
  }

  getValue(): Date {
    return new Date(this.value);
  }

  getFormattedDate(): string {
    return this.value.toISOString().split('T')[0]!;
  }

  isBefore(other: RentalDate): boolean {
    return this.value < other.value;
  }

  isAfter(other: RentalDate): boolean {
    return this.value > other.value;
  }

  equals(other: RentalDate): boolean {
    return this.value.getTime() === other.value.getTime();
  }

  isWeekend(): boolean {
    const dayOfWeek = this.value.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  }

  getDaysUntil(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = this.value.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Factory methods
  static fromString(dateString: string): RentalDate {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date string');
    }
    return new RentalDate(date);
  }

  static tomorrow(): RentalDate {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return new RentalDate(tomorrow);
  }
}
