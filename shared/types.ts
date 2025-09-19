/**
 * Shared types between server and client
 *
 * This file contains all the common TypeScript interfaces and types
 * used across both the GraphQL server and React client applications.
 * This ensures type consistency and reduces duplication.
 */

/**
 * Represents an auction with all its properties
 */
export interface Auction {
  /** Unique identifier for the auction */
  id: string;
  /** The initial bid amount when the auction started */
  startingBid: number;
  /** The current highest bid amount */
  currentBid: number;
  /** Name of the current highest bidder, null if no bids */
  currentWinner: string | null;
  /** Duration of the auction in seconds */
  duration: number;
  /** Timestamp when the auction started (milliseconds since epoch) */
  startTime: number;
  /** Timestamp when the auction ends (milliseconds since epoch) */
  endTime: number;
  /** Whether the auction is currently active */
  isActive: boolean;
  /** Whether extended bidding is enabled (extends auction by 10s if bid placed with <10s remaining) */
  extendedBidding: boolean;
}

/**
 * Represents a bid placed on an auction
 */
export interface Bid {
  /** Unique identifier for the bid */
  id: string;
  /** ID of the auction this bid was placed on */
  auctionId: string;
  /** Amount of the bid */
  amount: number;
  /** Name of the bidder */
  bidder: string;
  /** Timestamp when the bid was placed (milliseconds since epoch) */
  timestamp: number;
}

/**
 * Result of a bid placement operation
 */
export interface BidResult {
  /** Whether the bid was successfully placed */
  success: boolean;
  /** Error message if the bid failed, null if successful */
  message: string | null;
  /** The bid object if successful, null if failed */
  bid: Bid | null;
  /** Updated auction state after the bid */
  auction: Auction | null;
}

/**
 * Input parameters for creating a new auction
 */
export interface CreateAuctionInput {
  /** The starting bid amount (required) */
  startingBid: number;
  /** Duration in seconds (optional, defaults to 30) */
  duration?: number;
  /** Whether extended bidding is enabled (optional, defaults to false) */
  extendedBidding?: boolean;
}

/**
 * Input parameters for placing a bid
 */
export interface PlaceBidInput {
  /** ID of the auction to bid on */
  auctionId: string;
  /** Amount to bid */
  amount: number;
  /** Name of the bidder */
  bidder: string;
}

/**
 * GraphQL subscription event types
 */
export interface AuctionStartedEvent {
  auctionStarted: Auction;
}

export interface BidPlacedEvent {
  bidPlaced: Bid;
}

export interface AuctionEndedEvent {
  auctionEnded: Auction;
}
