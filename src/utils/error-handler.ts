/**
 * Error Handler - Contains intentional bugs for demo
 */

interface ErrorContext {
  code: string;
  message: string;
  stack?: string;
  timestamp?: number;
  userId?: string;
}

// BUG 1: Type narrowing issue - accessing optional property without check
export function formatError(error: ErrorContext | null): string {
  if (!error) {
    return 'Unknown error';
  }
  // BUG: timestamp is optional, but using it without check - will crash if undefined
  const time = new Date(error.timestamp).toISOString();
  return `[${time}] ${error.code}: ${error.message}`;
}

// BUG 2: Async closure issue - captures error variable that may change
export async function logErrorAsync(error: ErrorContext | null) {
  // BUG: setTimeout callback captures 'error' which may become null/undefined before execution
  setTimeout(() => {
    if (error) {
      console.error('Async error:', error.message);
      // BUG: Accessing optional property without check
      console.error('User:', error.userId.toUpperCase()); // userId is optional, could be undefined
    }
  }, 1000);
}

// BUG 3: Resource leak - promise rejection not handled, can cause unhandled rejection
export async function safeOperation<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    // BUG: Error caught but not logged or handled properly
    // BUG: Returning null hides the actual error, making debugging difficult
    return null;
  }
}

// BUG 4: Complex race condition - retry logic fires all attempts simultaneously
export function retryOperation(
  operation: () => Promise<boolean>, 
  maxRetries: number
): Promise<boolean> {
  let retries = 0;
  let lastError: Error | null = null;
  
  // BUG: This loop doesn't properly wait for async operations
  // BUG: All retries fire simultaneously instead of sequentially
  while (retries < maxRetries) {
    operation()
      .then(success => {
        if (success) return Promise.resolve(true);
        retries++;
        if (retries >= maxRetries) {
          throw lastError || new Error('Max retries exceeded');
        }
        return operation(); // BUG: Doesn't await, creates multiple concurrent operations
      })
      .catch(error => {
        lastError = error;
        retries++;
      });
  }
  
  return Promise.resolve(false);
}
