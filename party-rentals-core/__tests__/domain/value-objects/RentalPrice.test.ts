import { RentalPrice } from '../../../src/domain/value-objects/RentalPrice';

describe('RentalPrice Value Object', () => {
  describe('Creation', () => {
    it('should create a valid rental price', () => {
      // Arrange & Act
      const price = new RentalPrice(100.50);
      
      // Assert
      expect(price.getValue()).toBe(100.50);
      expect(price.getFormattedValue()).toBe('€100.50');
    });

    it('should create price with zero value', () => {
      // Arrange & Act
      const price = new RentalPrice(0);
      
      // Assert
      expect(price.getValue()).toBe(0);
      expect(price.getFormattedValue()).toBe('€0.00');
    });
  });

  describe('Validation', () => {
    it('should throw error for negative price', () => {
      // Arrange & Act & Assert
      expect(() => {
        new RentalPrice(-10);
      }).toThrow('Price cannot be negative');
    });

    it('should throw error for NaN price', () => {
      // Arrange & Act & Assert
      expect(() => {
        new RentalPrice(NaN);
      }).toThrow('Price must be a valid number');
    });

    it('should throw error for infinite price', () => {
      // Arrange & Act & Assert
      expect(() => {
        new RentalPrice(Infinity);
      }).toThrow('Price must be a valid number');
    });
  });

  describe('Operations', () => {
    it('should add two prices correctly', () => {
      // Arrange
      const price1 = new RentalPrice(100);
      const price2 = new RentalPrice(50);
      
      // Act
      const result = price1.add(price2);
      
      // Assert
      expect(result.getValue()).toBe(150);
    });

    it('should subtract two prices correctly', () => {
      // Arrange
      const price1 = new RentalPrice(100);
      const price2 = new RentalPrice(30);
      
      // Act
      const result = price1.subtract(price2);
      
      // Assert
      expect(result.getValue()).toBe(70);
    });

    it('should multiply price by factor correctly', () => {
      // Arrange
      const price = new RentalPrice(100);
      
      // Act
      const result = price.multiplyBy(1.2); // 20% increase
      
      // Assert
      expect(result.getValue()).toBe(120);
    });

    it('should throw error when subtraction results in negative', () => {
      // Arrange
      const price1 = new RentalPrice(50);
      const price2 = new RentalPrice(100);
      
      // Act & Assert
      expect(() => {
        price1.subtract(price2);
      }).toThrow('Subtraction cannot result in negative price');
    });

    it('should apply discount correctly', () => {
      // Arrange
      const price = new RentalPrice(100);
      
      // Act
      const discounted = price.applyDiscount(0.15); // 15% discount
      
      // Assert
      expect(discounted.getValue()).toBe(85);
    });

    it('should throw error for invalid discount', () => {
      // Arrange
      const price = new RentalPrice(100);
      
      // Act & Assert
      expect(() => {
        price.applyDiscount(1.5); // 150% discount
      }).toThrow('Discount must be between 0 and 1');
    });
  });

  describe('Comparison', () => {
    it('should compare prices correctly', () => {
      // Arrange
      const price1 = new RentalPrice(100);
      const price2 = new RentalPrice(150);
      const price3 = new RentalPrice(100);
      
      // Act & Assert
      expect(price1.isGreaterThan(price2)).toBe(false);
      expect(price2.isGreaterThan(price1)).toBe(true);
      expect(price1.equals(price3)).toBe(true);
      expect(price1.equals(price2)).toBe(false);
    });
  });

  describe('Factory Methods', () => {
    it('should create free price', () => {
      // Act
      const price = RentalPrice.free();
      
      // Assert
      expect(price.getValue()).toBe(0);
    });

    it('should create price from string', () => {
      // Act
      const price = RentalPrice.fromString('123.45');
      
      // Assert
      expect(price.getValue()).toBe(123.45);
    });

    it('should throw error for invalid string price', () => {
      // Act & Assert
      expect(() => {
        RentalPrice.fromString('not-a-number');
      }).toThrow('Invalid price string');
    });
  });
});
