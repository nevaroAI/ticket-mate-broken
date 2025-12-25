/**
 * User Card Component - Contains intentional complex bugs for demo
 */

import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  metadata?: {
    lastLogin?: string;
    preferences?: Record<string, any>;
  };
}

interface UserCardProps {
  user: User | null;
  onClick?: () => void;
}

// BUG 1: Type safety issue - using any bypasses all type checking
export function UserList({ users }: { users: any[] }) {
  // BUG: any[] type allows anything, loses all type safety
  // BUG: No validation that users array items have required properties
  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}

// BUG 2: Side effect in render - API call during render causes issues
export function UserCardWithData({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  
  // BUG: Fetch called directly in component body (not in useEffect)
  // BUG: Runs on every render, creates infinite loop if setUser triggers re-render
  fetch(`/api/users/${userId}`)
    .then(res => res.json())
    .then(data => setUser(data));
  
  if (!user) return <div>Loading...</div>;
  
  return <UserCard user={user} />;
}

// BUG 3: Nested optional chaining without null check - accessing deep property unsafely
export function UserCardDetailed({ user }: { user: User | null }) {
  if (!user) return <div>No user</div>;
  
  // BUG: user is checked above, but nested properties accessed without checks
  const lastLogin = user.metadata?.lastLogin;
  const theme = user.metadata?.preferences?.theme;
  
  return (
    <div>
      <UserCard user={user} />
      <p>Last login: {lastLogin || 'Never'}</p>
      <p>Theme: {theme || 'default'}</p>
    </div>
  );
}

// BUG 4: Event handler closure issue - captures stale state
export function UserCardInteractive({ user }: { user: User }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // BUG: Effect depends on user but also updates state based on user
    // BUG: If user changes, effect runs but count state might be stale
    const interval = setInterval(() => {
      setCount(count + 1); // BUG: Uses count from closure, should use functional update
    }, 1000);
    
    return () => clearInterval(interval);
  }, [user]); // BUG: Missing count in deps, but also shouldn't be there (would cause re-creation)
  
  const handleLike = () => {
    // BUG: Async operation that may complete after component unmounts
    fetch(`/api/users/${user.id}/like`, { method: 'POST' })
      .then(() => setLiked(true)); // BUG: State update may happen after unmount
  };
  
  return (
    <div>
      <UserCard user={user} />
      <button onClick={handleLike}>{liked ? 'Liked' : 'Like'}</button>
      <span>Views: {count}</span>
    </div>
  );
}

function UserCard({ user, onClick }: UserCardProps) {
  if (!user) return <div>No user</div>;
  
  return (
    <div onClick={onClick}>
      <img src={user.avatar} alt={user.name} />
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <span>ID: {user.id}</span>
    </div>
  );
}

export { UserCard };
