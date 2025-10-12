// Domain Entities
export { Inflatable, InflatableId } from './domain/entities/Inflatable';
export { Rental, RentalId, CustomerId, RentalStatus, SetupAddress } from './domain/entities/Rental';
export { Customer } from './domain/entities/Customer';

// Domain Value Objects
export { InflatableSize, InflatableSizeType } from './domain/value-objects/InflatableSize';
export { RentalPrice } from './domain/value-objects/RentalPrice';
export { RentalDate } from './domain/value-objects/RentalDate';

// Domain Repositories (Interfaces)
export { IInflatableRepository } from './domain/repositories/IInflatableRepository';
export { IRentalRepository } from './domain/repositories/IRentalRepository';
export { ICustomerRepository } from './domain/repositories/ICustomerRepository';

// Application Use Cases
export { 
  CheckAvailabilityUseCase, 
  CheckAvailabilityRequest, 
  CheckAvailabilityResponse,
  InflatableInfo 
} from './application/use-cases/CheckAvailabilityUseCase';
