import { IInflatableRepository } from '../../domain/repositories/IInflatableRepository';
import { IRentalRepository } from '../../domain/repositories/IRentalRepository';
import { RentalDate } from '../../domain/value-objects/RentalDate';
import { RentalPrice } from '../../domain/value-objects/RentalPrice';
import { Inflatable, InflatableId } from '../../domain/entities/Inflatable';


export interface CheckAvailabilityRequest {
  inflatableId?: string;
  size?: string;
  date: string;
}

export interface InflatableInfo {
  id: string;
  name: string;
  size: string;
  basePrice: number;
  maxCapacity: number;
  setupTimeMinutes: number;
  imageUrls: string[];
}

export interface CheckAvailabilityResponse {
  isAvailable: boolean;
  inflatable?: InflatableInfo | null;
  availableInflatables?: InflatableInfo[];
  suggestedPrice?: RentalPrice;
  reason?: string;
}

export class CheckAvailabilityUseCase {
  constructor(
    private readonly inflatableRepository: IInflatableRepository,
    private readonly rentalRepository: IRentalRepository
  ) {}

  async execute(request: CheckAvailabilityRequest): Promise<CheckAvailabilityResponse> {
    const rentalDate = RentalDate.fromString(request.date);

    // Check specific inflatable
    if (request.inflatableId) {
      return this.checkSpecificInflatable(request.inflatableId, rentalDate);
    }

    // Check by size
    if (request.size) {
      return this.checkInflatablesBySize(request.size, rentalDate);
    }

    throw new Error('Either inflatableId or size must be provided');
  }

  private async checkSpecificInflatable(
    inflatableId: string,
    rentalDate: RentalDate
  ): Promise<CheckAvailabilityResponse> {
    const id: InflatableId = { value: inflatableId };
    const inflatable = await this.inflatableRepository.findById(id);

    if (!inflatable) {
      return {
        isAvailable: false,
        inflatable: null,
        reason: 'Inflatable not found'
      };
    }

    if (!inflatable.isAvailable()) {
      return {
        isAvailable: false,
        inflatable: this.mapInflatableToInfo(inflatable),
        reason: 'Inflatable is currently inactive'
      };
    }

    const isBooked = await this.rentalRepository.isInflatableBookedOn(id, rentalDate);
    
    if (isBooked) {
      return {
        isAvailable: false,
        inflatable: this.mapInflatableToInfo(inflatable),
        reason: 'Inflatable is already booked for this date'
      };
    }

    const suggestedPrice = this.calculatePrice(inflatable, rentalDate);

    return {
      isAvailable: true,
      inflatable: this.mapInflatableToInfo(inflatable),
      suggestedPrice
    };
  }

  private async checkInflatablesBySize(
    sizeStr: string,
    rentalDate: RentalDate
  ): Promise<CheckAvailabilityResponse> {
    const inflatables = await this.inflatableRepository.findBySize(sizeStr);
    const availableInflatables: InflatableInfo[] = [];

    for (const inflatable of inflatables) {
      if (!inflatable.isAvailable()) {
        continue;
      }

      const isBooked = await this.rentalRepository.isInflatableBookedOn(
        inflatable.getId(),
        rentalDate
      );

      if (!isBooked) {
        availableInflatables.push(this.mapInflatableToInfo(inflatable));
      }
    }

    if (availableInflatables.length === 0) {
      return {
        isAvailable: false,
        availableInflatables: [],
        reason: 'No inflatables of requested size available for this date'
      };
    }

    return {
      isAvailable: true,
      availableInflatables
    };
  }

  private calculatePrice(inflatable: Inflatable, rentalDate: RentalDate): RentalPrice {
    let price = inflatable.getBasePrice();

    // Weekend premium (20%)
    if (rentalDate.isWeekend()) {
      price = price.multiplyBy(1.2);
    }

    return price;
  }

  private mapInflatableToInfo(inflatable: Inflatable): InflatableInfo {
    return {
      id: inflatable.getId().value,
      name: inflatable.getName(),
      size: inflatable.getSize().getValue(),
      basePrice: inflatable.getBasePrice().getValue(),
      maxCapacity: inflatable.getSize().getMaxCapacity(),
      setupTimeMinutes: inflatable.getSetupTimeMinutes(),
      imageUrls: inflatable.getImageUrls()
    };
  }
}
