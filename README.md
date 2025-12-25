# Ticket Mate Broken

An intentionally broken codebase for demonstrating Ticket Mate's bug tracker capabilities.

## About

This repository contains deliberately broken code with various types of bugs:
- Null reference errors
- Missing type safety
- Memory leaks
- Race conditions
- Missing error handling
- And more!

## Purpose

This codebase is used by the Ticket Mate bug tracker demo to showcase real bug detection capabilities. The demo scans this codebase and automatically creates Jira tickets for detected issues.

## Bugs Included

### Critical Bugs
- Null reference errors (accessing properties on undefined/null objects)
- Missing null checks in error handlers

### High Severity Bugs
- Missing error handling in async operations
- Race conditions in async code
- Type safety issues (using `any` type)

### Medium Severity Bugs
- Missing dependencies in React useEffect hooks
- Memory leaks (event listeners not cleaned up)
- Unhandled promise rejections

### Low Severity Bugs
- Using deprecated APIs
- Code style issues
- Anti-patterns (using index as React key)

## Usage

This repository is used as a git submodule in the main Ticket Mate project. It's automatically scanned during the bug tracker demo on the home page.

## Structure

```
src/
├── lib/
│   └── api.ts          # API client with null reference bugs
├── utils/
│   └── error-handler.ts # Error handling with missing null checks
├── hooks/
│   └── useData.ts      # React hooks with memory leaks
├── components/
│   └── UserCard.tsx    # React components with type issues
└── index.ts            # Main entry point with various bugs
```
