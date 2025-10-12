export class RentalPrice {
  private readonly value: number;

  constructor(value: number) {
    if (isNaN(value) || !isFinite(value)) {
      throw new Error('Price must be a valid number');
    }
    if (value < 0) {
      throw new Error('Price cannot be negative');
    }
    this.value = Math.round(value * 100) / 100; // Round to 2 decimal places
  }

  getValue(): number {
    return this.value;
  }

  getFormattedValue(): string {
    return `€${this.value.toFixed(2)}`;
  }

  add(other: RentalPrice): RentalPrice {
    return new RentalPrice(this.value + other.value);
  }

  subtract(other: RentalPrice): RentalPrice {
    const result = this.value - other.value;
    if (result < 0) {
      throw new Error('Subtraction cannot result in negative price');
    }
    return new RentalPrice(result);
  }

  multiplyBy(factor: number): RentalPrice {
    return new RentalPrice(this.value * factor);
  }

  applyDiscount(discountPercentage: number): RentalPrice {
    if (discountPercentage < 0 || discountPercentage > 1) {
      throw new Error('Discount must be between 0 and 1');
    }
    return new RentalPrice(this.value * (1 - discountPercentage));
  }

  isGreaterThan(other: RentalPrice): boolean {
    return this.value > other.value;
  }

  equals(other: RentalPrice): boolean {
    return this.value === other.value;
  }

  // Factory methods
  static free(): RentalPrice {
    return new RentalPrice(0);
  }

  static fromString(priceString: string): RentalPrice {
    const numericValue = parseFloat(priceString);
    if (isNaN(numericValue)) {
      throw new Error('Invalid price string');
    }
    return new RentalPrice(numericValue);
  }
}
