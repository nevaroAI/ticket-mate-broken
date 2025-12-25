/**
 * React Hook - Contains intentional complex bugs for demo
 */

import { useState, useEffect, useRef } from 'react';

interface Data {
  id: string;
  value: string;
  timestamp: number;
}

// BUG 1: Stale closure - missing dependency causes hook to use old userId value
export function useData(userId: string) {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // BUG: userId not in deps, closure captures initial value
    // BUG: If userId changes, effect doesn't re-run, uses stale userId
    async function fetchData() {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}/data`);
      const result = await response.json();
      setData(result);
      setLoading(false);
    }

    fetchData();
  }, []); // BUG: Should include userId

  return { data, loading };
}

// BUG 2: Memory leak - event listener added but never cleaned up, multiple listeners accumulate
export function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function handleResize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    // BUG: Missing cleanup function - listener never removed
    // BUG: If component re-renders, new listener added without removing old one
    handleResize();
  }, []); // BUG: Empty deps but uses window object

  return size;
}

// BUG 3: Race condition - no cleanup means stale requests can update state after unmount/unmount
export function useUserData(userId: string) {
  const [user, setUser] = useState<any>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    // BUG: No abort controller - can't cancel request if userId changes
    // BUG: If userId changes quickly, multiple requests fire, last one wins (race condition)
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        // BUG: mountedRef check exists but ref never set to false in cleanup
        if (mountedRef.current) {
          setUser(data); // BUG: May set stale data if userId changed during fetch
        }
      });

    // BUG: Missing cleanup to set mountedRef.current = false
  }, [userId]);

  return user;
}

// BUG 4: Infinite loop potential - state update in effect without proper dependency
export function useCounter(initialValue: number) {
  const [count, setCount] = useState(initialValue);
  
  useEffect(() => {
    // BUG: Effect runs on every render, sets state, causes re-render, infinite loop
    if (count < 10) {
      setCount(count + 1); // BUG: Should use functional update: setCount(c => c + 1)
    }
  }, [count]); // BUG: Dependency on count causes effect to run when count changes

  return count;
}

// BUG 5: Closure issue with timers - cleanup doesn't capture the right timer ID
export function useInterval(callback: () => void, delay: number | null) {
  useEffect(() => {
    if (delay === null) return;
    
    const id = setInterval(callback, delay);
    
    // BUG: Cleanup function captures 'id' from closure, but if delay changes
    // before cleanup runs, the wrong timer might be cleared
    return () => {
      clearInterval(id); // BUG: Should use ref to store latest timer ID
    };
  }, [delay, callback]); // BUG: callback in deps means new timer created on every callback change
}
