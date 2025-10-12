import { CheckAvailabilityUseCase, CheckAvailabilityRequest, CheckAvailabilityResponse } from '../../../src/application/use-cases/CheckAvailabilityUseCase';
import { IInflatableRepository } from '../../../src/domain/repositories/IInflatableRepository';
import { IRentalRepository } from '../../../src/domain/repositories/IRentalRepository';
import { RentalDate } from '../../../src/domain/value-objects/RentalDate';
import { InflatableSize, InflatableSizeType } from '../../../src/domain/value-objects/InflatableSize';
import { RentalPrice } from '../../../src/domain/value-objects/RentalPrice';
import { Inflatable, InflatableId } from '../../../src/domain/entities/Inflatable';

describe('CheckAvailabilityUseCase', () => {
  let useCase: CheckAvailabilityUseCase;
  let mockInflatableRepository: jest.Mocked<IInflatableRepository>;
  let mockRentalRepository: jest.Mocked<IRentalRepository>;

  beforeEach(() => {
    mockInflatableRepository = {
      findById: jest.fn(),
      findAllActive: jest.fn(),
      isAvailableOn: jest.fn(),
      findBySize: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    mockRentalRepository = {
      findById: jest.fn(),
      findByCustomerId: jest.fn(),
      findByInflatableId: jest.fn(),
      findByDate: jest.fn(),
      isInflatableBookedOn: jest.fn(),
      findByDateRange: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    };

    useCase = new CheckAvailabilityUseCase(mockInflatableRepository, mockRentalRepository);
  });

  describe('Check specific inflatable availability', () => {
    it('should return available when inflatable exists and is not booked', async () => {
      // Arrange
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      const rentalDate = new RentalDate(tomorrow);
      const inflatableId: InflatableId = { value: 'inflatable-1' };
      
      const inflatable = new Inflatable(
        inflatableId,
        'Castillo Grande',
        InflatableSize.createLarge(),
        new RentalPrice(80),
        true,
        60,
        ['image1.jpg']
      );

      const request: CheckAvailabilityRequest = {
        inflatableId: inflatableId.value,
        date: rentalDate.getFormattedDate()
      };

      mockInflatableRepository.findById.mockResolvedValue(inflatable);
      mockRentalRepository.isInflatableBookedOn.mockResolvedValue(false);

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.isAvailable).toBe(true);
      expect(response.inflatable).toBeDefined();
      expect(response.inflatable?.name).toBe('Castillo Grande');
      expect(response.suggestedPrice).toBeDefined();
      expect(mockInflatableRepository.findById).toHaveBeenCalledWith(inflatableId);
      expect(mockRentalRepository.isInflatableBookedOn).toHaveBeenCalledWith(inflatableId, rentalDate);
    });

    it('should return not available when inflatable is already booked', async () => {
      // Arrange
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      const rentalDate = new RentalDate(tomorrow);
      const inflatableId: InflatableId = { value: 'inflatable-1' };
      
      const inflatable = new Inflatable(
        inflatableId,
        'Castillo Grande',
        InflatableSize.createLarge(),
        new RentalPrice(80),
        true,
        60,
        ['image1.jpg']
      );

      const request: CheckAvailabilityRequest = {
        inflatableId: inflatableId.value,
        date: rentalDate.getFormattedDate()
      };

      mockInflatableRepository.findById.mockResolvedValue(inflatable);
      mockRentalRepository.isInflatableBookedOn.mockResolvedValue(true);

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.isAvailable).toBe(false);
      expect(response.inflatable).toBeDefined();
      expect(response.reason).toBe('Inflatable is already booked for this date');
    });

    it('should return not available when inflatable does not exist', async () => {
      // Arrange
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      const rentalDate = new RentalDate(tomorrow);
      const inflatableId: InflatableId = { value: 'non-existent' };

      const request: CheckAvailabilityRequest = {
        inflatableId: inflatableId.value,
        date: rentalDate.getFormattedDate()
      };

      mockInflatableRepository.findById.mockResolvedValue(null);

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.isAvailable).toBe(false);
      expect(response.inflatable).toBeNull();
      expect(response.reason).toBe('Inflatable not found');
    });

    it('should return not available when inflatable is inactive', async () => {
      // Arrange
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      const rentalDate = new RentalDate(tomorrow);
      const inflatableId: InflatableId = { value: 'inflatable-1' };
      
      const inflatable = new Inflatable(
        inflatableId,
        'Castillo Grande',
        InflatableSize.createLarge(),
        new RentalPrice(80),
        false, // inactive
        60,
        ['image1.jpg']
      );

      const request: CheckAvailabilityRequest = {
        inflatableId: inflatableId.value,
        date: rentalDate.getFormattedDate()
      };

      mockInflatableRepository.findById.mockResolvedValue(inflatable);

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.isAvailable).toBe(false);
      expect(response.reason).toBe('Inflatable is currently inactive');
    });
  });

  describe('Check availability by size', () => {
    it('should return available inflatables of requested size', async () => {
      // Arrange
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      const rentalDate = new RentalDate(tomorrow);
      
      const largeInflatable = new Inflatable(
        { value: 'inflatable-1' },
        'Castillo Grande',
        InflatableSize.createLarge(),
        new RentalPrice(80),
        true,
        60,
        ['image1.jpg']
      );

      const request: CheckAvailabilityRequest = {
        size: 'LARGE',
        date: rentalDate.getFormattedDate()
      };

      mockInflatableRepository.findBySize.mockResolvedValue([largeInflatable]);
      mockRentalRepository.isInflatableBookedOn.mockResolvedValue(false);

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.isAvailable).toBe(true);
      expect(response.availableInflatables).toHaveLength(1);
      expect(response.availableInflatables?.[0]?.name).toBe('Castillo Grande');
    });

    it('should return empty list when no inflatables of requested size are available', async () => {
      // Arrange
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      const rentalDate = new RentalDate(tomorrow);
      
      const largeInflatable = new Inflatable(
        { value: 'inflatable-1' },
        'Castillo Grande',
        InflatableSize.createLarge(),
        new RentalPrice(80),
        true,
        60,
        ['image1.jpg']
      );

      const request: CheckAvailabilityRequest = {
        size: 'LARGE',
        date: rentalDate.getFormattedDate()
      };

      mockInflatableRepository.findBySize.mockResolvedValue([largeInflatable]);
      mockRentalRepository.isInflatableBookedOn.mockResolvedValue(true); // booked

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.isAvailable).toBe(false);
      expect(response.availableInflatables).toHaveLength(0);
      expect(response.reason).toBe('No inflatables of requested size available for this date');
    });
  });

  describe('Price calculation', () => {
    it('should apply weekend premium for weekend dates', async () => {
      // Arrange - Find next Saturday
      const nextSaturday = new Date();
      const daysUntilSaturday = (6 - nextSaturday.getDay()) % 7;
      nextSaturday.setDate(nextSaturday.getDate() + daysUntilSaturday + (daysUntilSaturday === 0 ? 7 : 0));
      const rentalDate = new RentalDate(nextSaturday);
      
      const inflatableId: InflatableId = { value: 'inflatable-1' };
      const inflatable = new Inflatable(
        inflatableId,
        'Castillo Grande',
        InflatableSize.createLarge(),
        new RentalPrice(100),
        true,
        60,
        ['image1.jpg']
      );

      const request: CheckAvailabilityRequest = {
        inflatableId: inflatableId.value,
        date: rentalDate.getFormattedDate()
      };

      mockInflatableRepository.findById.mockResolvedValue(inflatable);
      mockRentalRepository.isInflatableBookedOn.mockResolvedValue(false);

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.isAvailable).toBe(true);
      expect(response.suggestedPrice?.getValue()).toBe(120); // 20% weekend premium
    });

    it('should use base price for weekday dates', async () => {
      // Arrange - Find next Monday
      const nextMonday = new Date();
      const daysUntilMonday = (1 - nextMonday.getDay() + 7) % 7;
      nextMonday.setDate(nextMonday.getDate() + daysUntilMonday + (daysUntilMonday === 0 ? 7 : 0));
      const rentalDate = new RentalDate(nextMonday);
      
      const inflatableId: InflatableId = { value: 'inflatable-1' };
      const inflatable = new Inflatable(
        inflatableId,
        'Castillo Grande',
        InflatableSize.createLarge(),
        new RentalPrice(100),
        true,
        60,
        ['image1.jpg']
      );

      const request: CheckAvailabilityRequest = {
        inflatableId: inflatableId.value,
        date: rentalDate.getFormattedDate()
      };

      mockInflatableRepository.findById.mockResolvedValue(inflatable);
      mockRentalRepository.isInflatableBookedOn.mockResolvedValue(false);

      // Act
      const response = await useCase.execute(request);

      // Assert
      expect(response.isAvailable).toBe(true);
      expect(response.suggestedPrice?.getValue()).toBe(100); // base price
    });
  });
});
