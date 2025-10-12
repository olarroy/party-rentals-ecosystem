import { InflatableSize } from '../value-objects/InflatableSize';
import { RentalPrice } from '../value-objects/RentalPrice';

export interface InflatableId {
  readonly value: string;
}

export class Inflatable {
  constructor(
    private readonly id: InflatableId,
    private readonly name: string,
    private readonly size: InflatableSize,
    private readonly basePrice: RentalPrice,
    private readonly isActive: boolean,
    private readonly setupTimeMinutes: number,
    private readonly imageUrls: string[]
  ) {}

  getId(): InflatableId {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getSize(): InflatableSize {
    return this.size;
  }

  getBasePrice(): RentalPrice {
    return this.basePrice;
  }

  isAvailable(): boolean {
    return this.isActive;
  }

  getSetupTimeMinutes(): number {
    return this.setupTimeMinutes;
  }

  getImageUrls(): string[] {
    return [...this.imageUrls];
  }

  calculatePriceForDays(days: number): RentalPrice {
    if (days <= 0) {
      throw new Error('Days must be greater than 0');
    }
    return this.basePrice.multiplyBy(days);
  }

  equals(other: Inflatable): boolean {
    return this.id.value === other.id.value;
  }
}
