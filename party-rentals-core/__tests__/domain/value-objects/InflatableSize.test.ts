import { InflatableSize, InflatableSizeType } from '../../../src/domain/value-objects/InflatableSize';

describe('InflatableSize Value Object', () => {
  describe('Creation', () => {
    it('should create a Large inflatable size', () => {
      // Arrange & Act
      const size = new InflatableSize(InflatableSizeType.LARGE);
      
      // Assert
      expect(size.getValue()).toBe(InflatableSizeType.LARGE);
      expect(size.getDisplayName()).toBe('Grande');
      expect(size.getMaxCapacity()).toBe(15);
      expect(size.getDimensions()).toBe('6m x 6m x 4m');
    });

    it('should create a Small inflatable size', () => {
      // Arrange & Act
      const size = new InflatableSize(InflatableSizeType.SMALL);
      
      // Assert
      expect(size.getValue()).toBe(InflatableSizeType.SMALL);
      expect(size.getDisplayName()).toBe('Pequeño');
      expect(size.getMaxCapacity()).toBe(8);
      expect(size.getDimensions()).toBe('4m x 4m x 3m');
    });
  });

  describe('Validation', () => {
    it('should throw error for invalid size type', () => {
      // Arrange & Act & Assert
      expect(() => {
        new InflatableSize('INVALID' as InflatableSizeType);
      }).toThrow('Invalid inflatable size type');
    });
  });

  describe('Equality', () => {
    it('should be equal when same size type', () => {
      // Arrange
      const size1 = new InflatableSize(InflatableSizeType.LARGE);
      const size2 = new InflatableSize(InflatableSizeType.LARGE);
      
      // Act & Assert
      expect(size1.equals(size2)).toBe(true);
    });

    it('should not be equal when different size types', () => {
      // Arrange
      const size1 = new InflatableSize(InflatableSizeType.LARGE);
      const size2 = new InflatableSize(InflatableSizeType.SMALL);
      
      // Act & Assert
      expect(size1.equals(size2)).toBe(false);
    });
  });

  describe('Comparison', () => {
    it('should return true when large is bigger than small', () => {
      // Arrange
      const large = new InflatableSize(InflatableSizeType.LARGE);
      const small = new InflatableSize(InflatableSizeType.SMALL);
      
      // Act & Assert
      expect(large.isBiggerThan(small)).toBe(true);
      expect(small.isBiggerThan(large)).toBe(false);
    });

    it('should return false when comparing same sizes', () => {
      // Arrange
      const size1 = new InflatableSize(InflatableSizeType.LARGE);
      const size2 = new InflatableSize(InflatableSizeType.LARGE);
      
      // Act & Assert
      expect(size1.isBiggerThan(size2)).toBe(false);
    });
  });

  describe('Factory Methods', () => {
    it('should create Large size using factory method', () => {
      // Act
      const size = InflatableSize.createLarge();
      
      // Assert
      expect(size.getValue()).toBe(InflatableSizeType.LARGE);
    });

    it('should create Small size using factory method', () => {
      // Act
      const size = InflatableSize.createSmall();
      
      // Assert
      expect(size.getValue()).toBe(InflatableSizeType.SMALL);
    });
  });
});
