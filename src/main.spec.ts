import { add } from './additionNumbers';

describe('add', () => {
  it('should sum the parameters', (): void => {
    const param1: number = 4;
    const param2: number = 5;

    const result: number = add(param1, param2);

    expect(result).toBe(9);
  });

  it('should sum negative numbers', (): void => {
    const param1: number = -4;
    const param2: number = -5;

    const result: number = add(param1, param2);

    expect(result).toBe(-9);
  });
});
