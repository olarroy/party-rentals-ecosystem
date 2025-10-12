import { RentalDate } from '../value-objects/RentalDate';
import { RentalPrice } from '../value-objects/RentalPrice';
import { InflatableId } from './Inflatable';

export interface RentalId {
  readonly value: string;
}

export interface CustomerId {
  readonly value: string;
}

export enum RentalStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface SetupAddress {
  readonly street: string;
  readonly city: string;
  readonly zipCode: string;
  readonly additionalInfo?: string;
}

export class Rental {
  constructor(
    private readonly id: RentalId,
    private readonly inflatableId: InflatableId,
    private readonly customerId: CustomerId,
    private readonly rentalDate: RentalDate,
    private readonly setupAddress: SetupAddress,
    private readonly totalPrice: RentalPrice,
    private status: RentalStatus,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  getId(): RentalId {
    return this.id;
  }

  getInflatableId(): InflatableId {
    return this.inflatableId;
  }

  getCustomerId(): CustomerId {
    return this.customerId;
  }

  getRentalDate(): RentalDate {
    return this.rentalDate;
  }

  getSetupAddress(): SetupAddress {
    return { ...this.setupAddress };
  }

  getTotalPrice(): RentalPrice {
    return this.totalPrice;
  }

  getStatus(): RentalStatus {
    return this.status;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }

  confirm(): void {
    if (this.status !== RentalStatus.PENDING) {
      throw new Error('Only pending rentals can be confirmed');
    }
    this.status = RentalStatus.CONFIRMED;
    this.updatedAt = new Date();
  }

  cancel(): void {
    if (this.status === RentalStatus.COMPLETED) {
      throw new Error('Completed rentals cannot be cancelled');
    }
    if (this.status === RentalStatus.CANCELLED) {
      throw new Error('Rental is already cancelled');
    }
    this.status = RentalStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  complete(): void {
    if (this.status !== RentalStatus.CONFIRMED) {
      throw new Error('Only confirmed rentals can be completed');
    }
    this.status = RentalStatus.COMPLETED;
    this.updatedAt = new Date();
  }

  isPending(): boolean {
    return this.status === RentalStatus.PENDING;
  }

  isConfirmed(): boolean {
    return this.status === RentalStatus.CONFIRMED;
  }

  isCompleted(): boolean {
    return this.status === RentalStatus.COMPLETED;
  }

  isCancelled(): boolean {
    return this.status === RentalStatus.CANCELLED;
  }

  canBeCancelled(): boolean {
    return this.status === RentalStatus.PENDING || this.status === RentalStatus.CONFIRMED;
  }

  equals(other: Rental): boolean {
    return this.id.value === other.id.value;
  }
}
