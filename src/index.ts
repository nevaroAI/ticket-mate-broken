/**
 * Main Entry Point - Contains intentional complex bugs for demo
 */

import { ApiClient } from './lib/api';
import { formatError } from './utils/error-handler';

// BUG 1: Async operation not awaited - promise chain issue
function main() {
  const api = new ApiClient('https://api.example.com');
  
  // BUG: Async function called but result not awaited
  // BUG: If getUser throws, error is unhandled promise rejection
  api.getUser('user-123')
    .then(user => {
      console.log('User:', user.id);
    })
    .catch(error => {
      // BUG: formatError expects ErrorContext | null, but we're passing Error | unknown
      const errorContext = { code: 'UNKNOWN', message: String(error) };
      console.error(formatError(errorContext));
    });
}

// BUG 2: Resource leak - fetch request never aborted, can hang forever
async function fetchUserData(userId: string) {
  // BUG: No timeout, no abort controller
  // BUG: If network is slow, this hangs indefinitely
  // BUG: No error handling for network failures
  const response = await fetch(`/api/users/${userId}`);
  const data = await response.json();
  return data;
}

// BUG 3: Race condition - multiple concurrent operations updating shared state
let globalCounter = 0;

async function incrementCounter() {
  // BUG: Non-atomic operation, race condition with concurrent calls
  const current = globalCounter;
  await new Promise(resolve => setTimeout(resolve, 10)); // Simulate async work
  globalCounter = current + 1; // BUG: Lost update if multiple calls happen concurrently
  return globalCounter;
}

// BUG 4: Closure capturing mutable variable - all callbacks share same variable
function setupEventHandlers() {
  const handlers: Array<() => void> = [];
  
  for (let i = 0; i < 5; i++) {
    // BUG: All handlers capture same 'i' variable
    handlers.push(() => {
      console.log('Handler', i); // BUG: All will log 5 (final value of i)
    });
  }
  
  return handlers;
}

// BUG 5: Promise chain without proper error propagation
async function complexOperation() {
  try {
    const data = await fetchUserData('123');
    // BUG: processData may throw, but error handling is incomplete
    const processed = await data.processData(); // BUG: Assumes processData exists and is async
    return processed;
  } catch (error) {
    // BUG: Error caught but not logged or re-thrown with context
    return null; // BUG: Silent failure, caller can't distinguish error from null result
  }
}

main();
