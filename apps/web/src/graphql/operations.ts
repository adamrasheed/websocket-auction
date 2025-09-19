import { gql } from "@apollo/client";

export const GET_COUNTER = gql`
  query GetCounter {
    counter
  }
`;

export const GET_ACTIVE_AUCTION = gql`
  query GetActiveAuction {
    activeAuction {
      id
      startingBid
      currentBid
      currentWinner
      duration
      startTime
      endTime
      isActive
      extendedBidding
    }
  }
`;

export const GET_AUCTIONS = gql`
  query GetAuctions {
    auctions {
      id
      startingBid
      currentBid
      currentWinner
      duration
      startTime
      endTime
      isActive
      extendedBidding
    }
  }
`;

export const CREATE_AUCTION = gql`
  mutation CreateAuction(
    $startingBid: Float!
    $duration: Int
    $extendedBidding: Boolean
  ) {
    createAuction(
      startingBid: $startingBid
      duration: $duration
      extendedBidding: $extendedBidding
    ) {
      id
      startingBid
      currentBid
      currentWinner
      duration
      startTime
      endTime
      isActive
      extendedBidding
    }
  }
`;

export const PLACE_BID = gql`
  mutation PlaceBid($auctionId: ID!, $amount: Float!, $bidder: String!) {
    placeBid(auctionId: $auctionId, amount: $amount, bidder: $bidder) {
      success
      message
      bid {
        id
        amount
        bidder
        timestamp
      }
      auction {
        id
        currentBid
        currentWinner
        endTime
        isActive
      }
    }
  }
`;

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

export const AUCTION_STARTED_SUBSCRIPTION = gql`
  subscription AuctionStarted {
    auctionStarted {
      id
      startingBid
      currentBid
      currentWinner
      duration
      startTime
      endTime
      isActive
      extendedBidding
    }
  }
`;

export const BID_PLACED_SUBSCRIPTION = gql`
  subscription BidPlaced {
    bidPlaced {
      id
      auctionId
      amount
      bidder
      timestamp
    }
  }
`;

export const AUCTION_ENDED_SUBSCRIPTION = gql`
  subscription AuctionEnded {
    auctionEnded {
      id
      startingBid
      currentBid
      currentWinner
      duration
      startTime
      endTime
      isActive
      extendedBidding
    }
  }
`;

export const AUCTIONS_UPDATED_SUBSCRIPTION = gql`
  subscription AuctionsUpdated {
    auctionsUpdated {
      id
      startingBid
      currentBid
      currentWinner
      duration
      startTime
      endTime
      isActive
      extendedBidding
    }
  }
`;
