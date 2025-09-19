# Shared Types Usage Examples

## Server-side Examples

### GraphQL Resolver with Shared Types

```typescript
// apps/server/src/schema.ts
import { Auction, CreateAuctionInput, PlaceBidInput } from "@shared/types";

export const resolvers = {
  Mutation: {
    createAuction: (_: any, input: CreateAuctionInput): Auction => {
      // Type-safe input parameters
      const { startingBid, duration = 30, extendedBidding = false } = input;

      const auction: Auction = {
        id: generateId(),
        startingBid,
        currentBid: startingBid,
        currentWinner: null,
        duration,
        startTime: Date.now(),
        endTime: Date.now() + duration * 1000,
        isActive: true,
        extendedBidding,
      };

      return auction;
    },

    placeBid: (_: any, input: PlaceBidInput): BidResult => {
      // Type-safe bid placement logic
      const { auctionId, amount, bidder } = input;

      // Implementation...
      return {
        success: true,
        message: null,
        bid: newBid,
        auction: updatedAuction,
      };
    },
  },
};
```

## Client-side Examples

### React Component with Shared Types

```typescript
// apps/web/src/components/AuctionDisplay.tsx
import { Auction, Bid, AuctionStartedEvent } from "@shared/types";

interface Props {
  auction: Auction | null;
}

const AuctionDisplay: React.FC<Props> = ({ auction }) => {
  // Type-safe component props
  if (!auction) return <div>No active auction</div>;

  return (
    <div>
      <h2>Current Bid: ${auction.currentBid}</h2>
      <p>Winner: {auction.currentWinner || "No bids yet"}</p>
    </div>
  );
};
```

### Apollo Client with Shared Types

```typescript
// apps/web/src/hooks/useAuction.ts
import { useQuery, useMutation } from "@apollo/client";
import { Auction, CreateAuctionInput } from "@shared/types";

const GET_AUCTION = gql`
  query GetAuction {
    activeAuction {
      id
      currentBid
      currentWinner
      # ... other fields
    }
  }
`;

export const useAuction = () => {
  const { data } = useQuery<{ activeAuction: Auction | null }>(GET_AUCTION);

  return {
    auction: data?.activeAuction || null,
  };
};
```

### Type-safe Event Handlers

```typescript
// apps/web/src/components/AuctionDisplay.tsx
import { AuctionStartedEvent, BidPlacedEvent } from "@shared/types";

const AuctionDisplay = () => {
  useSubscription<AuctionStartedEvent>(AUCTION_STARTED_SUBSCRIPTION, {
    onData: ({ data }) => {
      // Type-safe event data
      const auction = data.data?.auctionStarted;
      if (auction) {
        console.log("Auction started:", auction.id);
      }
    },
  });

  useSubscription<BidPlacedEvent>(BID_PLACED_SUBSCRIPTION, {
    onData: ({ data }) => {
      // Type-safe bid data
      const bid = data.data?.bidPlaced;
      if (bid) {
        console.log("New bid:", bid.amount, "by", bid.bidder);
      }
    },
  });
};
```

## Benefits Demonstrated

1. **Type Safety**: Compile-time checking ensures data consistency
2. **IntelliSense**: IDE provides autocomplete and documentation
3. **Refactoring**: Changes to types are automatically propagated
4. **Documentation**: JSDoc comments provide inline help
5. **Consistency**: Same types used across server and client
