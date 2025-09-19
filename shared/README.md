# Shared Types

This directory contains shared TypeScript types and interfaces used across both the server and client applications.

## Overview

The `types.ts` file defines all the common interfaces and types that are used in both:

- **Server**: GraphQL resolvers, mutations, and subscriptions
- **Client**: React components, Apollo Client operations, and UI state

## Usage

### Server-side

```typescript
import { Auction, Bid, CreateAuctionInput, PlaceBidInput } from "@shared/types";

// Use in resolver functions
const createAuction = (_: any, input: CreateAuctionInput) => {
  // Implementation
};
```

### Client-side

```typescript
import { Auction, Bid, AuctionStartedEvent } from "@shared/types";

// Use in React components
const MyComponent: React.FC<{ auction: Auction }> = ({ auction }) => {
  // Implementation
};
```

## Type Definitions

### Core Types

- **`Auction`**: Complete auction object with all properties
- **`Bid`**: Individual bid information
- **`BidResult`**: Result of bid placement operation

### Input Types

- **`CreateAuctionInput`**: Parameters for creating new auctions
- **`PlaceBidInput`**: Parameters for placing bids

### Event Types

- **`AuctionStartedEvent`**: GraphQL subscription event
- **`BidPlacedEvent`**: GraphQL subscription event
- **`AuctionEndedEvent`**: GraphQL subscription event

## Benefits

1. **Type Safety**: Ensures server and client use the same data structures
2. **Consistency**: Single source of truth for all type definitions
3. **Maintainability**: Changes to types are automatically reflected everywhere
4. **Documentation**: JSDoc comments provide clear documentation
5. **IntelliSense**: Better IDE support with shared types

## Configuration

The TypeScript configuration in both `apps/server/tsconfig.json` and `apps/web/tsconfig.app.json` includes path mapping to resolve `@shared/*` imports to the `../shared/*` directory.
