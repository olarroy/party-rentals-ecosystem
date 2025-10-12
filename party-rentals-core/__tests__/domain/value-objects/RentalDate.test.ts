import { RentalDate } from '../../../src/domain/value-objects/RentalDate';

describe('RentalDate Value Object', () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  describe('Creation', () => {
    it('should create a valid rental date for future date', () => {
      // Arrange & Act
      const rentalDate = new RentalDate(tomorrow);
      
      // Assert
      expect(rentalDate.getValue()).toEqual(tomorrow);
      expect(rentalDate.getFormattedDate()).toBe(tomorrow.toISOString().split('T')[0]);
    });

    it('should create rental date for today', () => {
      // Arrange
      const today = new Date();
      
      // Act
      const rentalDate = new RentalDate(today);
      
      // Assert
      expect(rentalDate.getValue().toDateString()).toBe(today.toDateString());
    });
  });

  describe('Validation', () => {
    it('should throw error for past dates', () => {
      // Arrange & Act & Assert
      expect(() => {
        new RentalDate(yesterday);
      }).toThrow('Rental date cannot be in the past');
    });

    it('should throw error for invalid date', () => {
      // Arrange
      const invalidDate = new Date('invalid-date');
      
      // Act & Assert
      expect(() => {
        new RentalDate(invalidDate);
      }).toThrow('Invalid date provided');
    });
  });

  describe('Comparison', () => {
    it('should correctly compare dates', () => {
      // Arrange
      const date1 = new Date();
      date1.setDate(date1.getDate() + 1);
      
      const date2 = new Date();
      date2.setDate(date2.getDate() + 2);
      
      const rentalDate1 = new RentalDate(date1);
      const rentalDate2 = new RentalDate(date2);
      
      // Act & Assert
      expect(rentalDate1.isBefore(rentalDate2)).toBe(true);
      expect(rentalDate2.isBefore(rentalDate1)).toBe(false);
      expect(rentalDate1.isAfter(rentalDate2)).toBe(false);
      expect(rentalDate2.isAfter(rentalDate1)).toBe(true);
    });

    it('should correctly check equality', () => {
      // Arrange
      const date = new Date();
      date.setDate(date.getDate() + 1);
      
      const rentalDate1 = new RentalDate(new Date(date));
      const rentalDate2 = new RentalDate(new Date(date));
      
      // Act & Assert
      expect(rentalDate1.equals(rentalDate2)).toBe(true);
    });
  });

  describe('Business Logic', () => {
    it('should check if date is weekend', () => {
      // Arrange - Find next Saturday
      const nextSaturday = new Date();
      const daysUntilSaturday = (6 - nextSaturday.getDay()) % 7;
      nextSaturday.setDate(nextSaturday.getDate() + daysUntilSaturday + (daysUntilSaturday === 0 ? 7 : 0));
      
      const rentalDate = new RentalDate(nextSaturday);
      
      // Act & Assert
      expect(rentalDate.isWeekend()).toBe(true);
    });

    it('should check if date is weekday', () => {
      // Arrange - Find next Monday
      const nextMonday = new Date();
      const daysUntilMonday = (1 - nextMonday.getDay() + 7) % 7;
      nextMonday.setDate(nextMonday.getDate() + daysUntilMonday + (daysUntilMonday === 0 ? 7 : 0));
      
      const rentalDate = new RentalDate(nextMonday);
      
      // Act & Assert
      expect(rentalDate.isWeekend()).toBe(false);
    });

    it('should check if booking is within minimum advance time', () => {
      // Arrange - 23 hours from now (less than 24h)
      const lessThan24h = new Date();
      lessThan24h.setHours(lessThan24h.getHours() + 23);
      
      // More than 24h from now
      const moreThan24h = new Date();
      moreThan24h.setHours(moreThan24h.getHours() + 25);
      
      // Act & Assert
      expect(() => {
        new RentalDate(lessThan24h);
      }).toThrow('Rental must be booked at least 24 hours in advance');
      
      expect(() => {
        new RentalDate(moreThan24h);
      }).not.toThrow();
    });

    it('should calculate days until rental', () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      
      const rentalDate = new RentalDate(futureDate);
      
      // Act
      const daysUntil = rentalDate.getDaysUntil();
      
      // Assert
      expect(daysUntil).toBe(5);
    });
  });

  describe('Factory Methods', () => {
    it('should create rental date from ISO string', () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const isoString = futureDate.toISOString().split('T')[0];
      
      // Act
      const rentalDate = RentalDate.fromString(isoString);
      
      // Assert
      expect(rentalDate.getFormattedDate()).toBe(isoString);
    });

    it('should throw error for invalid date string', () => {
      // Act & Assert
      expect(() => {
        RentalDate.fromString('invalid-date');
      }).toThrow('Invalid date string');
    });

    it('should create rental date for tomorrow', () => {
      // Arrange
      const expectedTomorrow = new Date();
      expectedTomorrow.setDate(expectedTomorrow.getDate() + 1);
      
      // Act
      const rentalDate = RentalDate.tomorrow();
      
      // Assert
      expect(rentalDate.getFormattedDate()).toBe(expectedTomorrow.toISOString().split('T')[0]);
    });
  });
});
