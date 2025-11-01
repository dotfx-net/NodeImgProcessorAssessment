import { randomPrice } from '../../services/task.service';

describe('Task service', () => {
  describe('randomPrice', () => {
    it('should generate a random price within the defined range', () => {
      const price = randomPrice(5, 50);

      expect(price).toBeGreaterThanOrEqual(5);
      expect(price).toBeLessThanOrEqual(50);
    });
  });
});
