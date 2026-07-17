export interface RetryConfig {
  retries?: number;
  delay?: number;
  factor?: number;
}

export async function retry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const retries = config.retries ?? 3;
  const delay = config.delay ?? 1000;
  const factor = config.factor ?? 2;

  let attempt = 0;
  
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= retries) {
        throw error;
      }
      const currentDelay = delay * Math.pow(factor, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, currentDelay));
    }
  }

  throw new Error("Retry logic failed unexpected code path");
}
