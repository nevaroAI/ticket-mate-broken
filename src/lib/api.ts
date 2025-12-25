/**
 * API Client - Intentionally broken for demo purposes
 * This file contains several complex bugs that the bug tracker should detect
 */

interface User {
  id: string;
  name: string;
  email: string;
  preferences?: {
    theme: string;
    notifications: boolean;
  };
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers?: Record<string, string>;
}

export class ApiClient {
  private baseUrl: string;
  private users: User[] = [];
  private cache: Map<string, any> = new Map();
  private requestQueue: Map<string, Promise<any>> = new Map();

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // BUG 1: Null reference - accessing property on potentially undefined object
  async getUser(userId: string): Promise<User> {
    const user = this.users.find(u => u.id === userId);
    // BUG: No null check - will crash if user not found
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  // BUG 2: Missing error handling + type assumption - assumes response is always valid JSON
  async fetchData(endpoint: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    // BUG: No check for response.ok or response.status
    // BUG: Assumes response is always JSON, will crash on HTML error pages
    const data = await response.json();
    return {
      data,
      status: response.status,
    };
  }

  // BUG 3: Memory leak - cache grows unbounded, never cleared
  async getCachedData(key: string): Promise<any> {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    const data = await this.fetchData(`/cache/${key}`);
    // BUG: Cache never expires, grows indefinitely
    this.cache.set(key, data);
    return data;
  }

  // BUG 4: Race condition - multiple simultaneous requests for same resource
  async fetchWithDedup(key: string, fetcher: () => Promise<any>): Promise<any> {
    // BUG: If request already in queue, should return existing promise, but logic is wrong
    if (this.requestQueue.has(key)) {
      // BUG: Returns the promise but doesn't properly handle rejection
      return this.requestQueue.get(key)!; // Non-null assertion without guarantee
    }
    
    const promise = fetcher().finally(() => {
      this.requestQueue.delete(key); // BUG: If promise rejects, this still runs but promise is lost
    });
    
    this.requestQueue.set(key, promise);
    return promise;
  }

  // BUG 5: Closure/stale data issue - event listener captures old state
  setupListener() {
    let count = 0;
    window.addEventListener('resize', () => {
      // BUG: Event listener captures 'count' in closure, but listener never removed
      // BUG: Multiple calls to setupListener() create duplicate listeners
      count++;
      console.log('Resize count:', count); // BUG: Each listener has its own count
    });
  }

  // BUG 6: Type safety - using any and unsafe property access
  async processData(data: any): Promise<any> {
    // BUG: No validation that data is array, will crash if data is null/undefined/object
    // BUG: Using 'any' bypasses type safety completely
    return data.map((item: any) => {
      // BUG: No check that item.value exists
      return item.value.toUpperCase(); // Will crash if value is undefined
    });
  }

  // BUG 7: Promise chain without proper error handling
  async batchOperation(ids: string[]): Promise<User[]> {
    // BUG: If any request fails, entire batch fails silently
    // BUG: No timeout, can hang forever
    // BUG: All requests fire simultaneously, no rate limiting
    return Promise.all(
      ids.map(id => 
        fetch(`${this.baseUrl}/users/${id}`)
          .then(res => res.json())
          .then(data => data.user) // BUG: Assumes response structure without validation
      )
    );
  }
}

export default new ApiClient('https://api.example.com');
