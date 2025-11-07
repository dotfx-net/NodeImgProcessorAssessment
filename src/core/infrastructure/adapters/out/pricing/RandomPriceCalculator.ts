import { PriceCalculator } from '@/core/application/ports/out/PriceCalculator';
import { randomInt } from '@/shared/utils/randomInt';

export class RandomPriceCalculator implements PriceCalculator {
  private readonly minPrice: number;
  private readonly maxPrice: number;
  private readonly decimals: number;

  constructor(minPrice: number = 5, maxPrice: number = 50, decimals: number = 1) {
    this.minPrice = minPrice;
    this.maxPrice = maxPrice;
    this.decimals = decimals;
  }

  calculate(): number {
    const integerPrice = randomInt(this.minPrice * 10, this.maxPrice * 10);
    const price = integerPrice / 10;

    return Math.round(price * Math.pow(10, this.decimals)) / Math.pow(10, this.decimals);
  }
};
