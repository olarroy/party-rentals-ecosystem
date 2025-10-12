export enum InflatableSizeType {
  LARGE = 'LARGE',
  SMALL = 'SMALL'
}

export class InflatableSize {
  private readonly value: InflatableSizeType;

  constructor(value: InflatableSizeType) {
    if (!Object.values(InflatableSizeType).includes(value)) {
      throw new Error('Invalid inflatable size type');
    }
    this.value = value;
  }

  getValue(): InflatableSizeType {
    return this.value;
  }

  getDisplayName(): string {
    const displayNames = {
      [InflatableSizeType.LARGE]: 'Grande',
      [InflatableSizeType.SMALL]: 'Pequeño'
    };
    return displayNames[this.value];
  }

  getMaxCapacity(): number {
    const capacities = {
      [InflatableSizeType.LARGE]: 15,
      [InflatableSizeType.SMALL]: 8
    };
    return capacities[this.value];
  }

  getDimensions(): string {
    const dimensions = {
      [InflatableSizeType.LARGE]: '6m x 6m x 4m',
      [InflatableSizeType.SMALL]: '4m x 4m x 3m'
    };
    return dimensions[this.value];
  }

  equals(other: InflatableSize): boolean {
    return this.value === other.value;
  }

  isBiggerThan(other: InflatableSize): boolean {
    if (this.value === other.value) {
      return false;
    }
    return this.value === InflatableSizeType.LARGE && other.value === InflatableSizeType.SMALL;
  }

  // Factory methods
  static createLarge(): InflatableSize {
    return new InflatableSize(InflatableSizeType.LARGE);
  }

  static createSmall(): InflatableSize {
    return new InflatableSize(InflatableSizeType.SMALL);
  }
}
