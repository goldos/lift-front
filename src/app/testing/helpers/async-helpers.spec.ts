import { waitUntil } from './async-helpers';

describe('waitUntil', () => {
  it('should resolve immediately if the condition is already true', async () => {
    await expect(waitUntil(() => true)).resolves.toBeUndefined();
  });

  it('should resolve when the condition becomes true after a delay', async () => {
    let condition = false;

    setTimeout(() => {
      condition = true;
    }, 200);

    await expect(waitUntil(() => condition)).resolves.toBeUndefined();
  });

  it('should reject if the condition does not become true within the timeout', async () => {
    await expect(waitUntil(() => false, 200)).rejects.toThrow('waitUntil timed out.');
  });

  it('should not reject if the assertion inside fails initially but succeeds later', async () => {
    let counter = 0;
    const conditionFn = () => {
      counter++;
      return counter >= 5;
    };

    await expect(waitUntil(conditionFn)).resolves.toBeUndefined();

    expect(counter).toBe(5);
  });
});
