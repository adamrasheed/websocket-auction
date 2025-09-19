import { gql } from "graphql-tag";
import { PubSub } from "graphql-subscriptions";
import { Auction, Bid, CreateAuctionInput, PlaceBidInput } from "@shared/types";

let counter = 0;

// Auction state management
let activeAuction: Auction | null = null;
let auctionsList: Auction[] = [];

console.log("Server starting - auctionsList initialized with", auctionsList.length, "auctions");

// PubSub for real-time subscriptions
const pubsub = new PubSub();

export const typeDefs = gql`
  type Query {
    counter: Int
    activeAuction: Auction
    auctions: [Auction!]!
  }

  type Mutation {
    incrementCounter: Int
    createAuction(
      startingBid: Float!
      duration: Int
      extendedBidding: Boolean
    ): Auction
    placeBid(auctionId: ID!, amount: Float!, bidder: String!): BidResult
  }

  type Subscription {
    auctionStarted: Auction
    bidPlaced: Bid
    auctionEnded: Auction
    auctionsUpdated: [Auction!]!
  }

  type Auction {
    id: ID!
    startingBid: Float!
    currentBid: Float!
    currentWinner: String
    duration: Int!
    startTime: Float!
    endTime: Float!
    isActive: Boolean!
    extendedBidding: Boolean!
  }

  type Bid {
    id: ID!
    auctionId: ID!
    amount: Float!
    bidder: String!
    timestamp: Float!
  }

  type BidResult {
    success: Boolean!
    message: String
    bid: Bid
    auction: Auction
  }
`;

export const resolvers = {
  Query: {
    counter: () => counter,
    activeAuction: () => activeAuction,
    auctions: () => {
      console.log("auctions query called, returning:", auctionsList.length, "auctions");
      return auctionsList;
    },
  },
  Mutation: {
    incrementCounter: () => {
      counter += 1;
      return counter;
    },
    createAuction: (
      _: any,
      {
        startingBid,
        duration = 30,
        extendedBidding = false,
      }: CreateAuctionInput
    ) => {
      // Ensure at most one auction is active at any given time
      if (activeAuction && activeAuction.isActive) {
        throw new Error(
          "An auction is already active. Only one auction can be active at a time."
        );
      }

      const now = Date.now();
      const auctionId = `auction_${now}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const newAuction: Auction = {
        id: auctionId,
        startingBid,
        currentBid: startingBid,
        currentWinner: null,
        duration,
        startTime: now,
        endTime: now + duration * 1000,
        isActive: true,
        extendedBidding,
      };

      activeAuction = newAuction;

      auctionsList.push(newAuction);
      console.log("Added auction to auctionsList. Total auctions:", auctionsList.length);

      // Publish auction started event
      console.log("Publishing AUCTION_STARTED event:", newAuction.id);
      pubsub.publish("AUCTION_STARTED", { auctionStarted: newAuction });

      // Publish auctions list update for live revalidation
      console.log(
        "Publishing AUCTIONS_UPDATED event (auction created) with auctions:",
        auctionsList.length
      );
      pubsub.publish("AUCTIONS_UPDATED", { auctionsUpdated: auctionsList });

      // Set up auction end timer
      setTimeout(() => {
        if (activeAuction && activeAuction.id === newAuction.id) {
          activeAuction.isActive = false;

          // Update the auction in the auctionsList as well
          const auctionInList = auctionsList.find(
            (auction) => auction.id === newAuction.id
          );
          if (auctionInList) {
            auctionInList.isActive = false;
          }

          pubsub.publish("AUCTION_ENDED", { auctionEnded: activeAuction });

          // Publish auctions list update for live revalidation
          console.log(
            "Publishing AUCTIONS_UPDATED event with auctions:",
            auctionsList.length
          );
          pubsub.publish("AUCTIONS_UPDATED", { auctionsUpdated: auctionsList });
        }
      }, duration * 1000);

      return newAuction;
    },
    placeBid: (_: any, { auctionId, amount, bidder }: PlaceBidInput) => {
      if (!activeAuction || !activeAuction.isActive) {
        return {
          success: false,
          message: "No active auction found",
          bid: null,
          auction: activeAuction,
        };
      }

      if (activeAuction.id !== auctionId) {
        return {
          success: false,
          message: "Auction ID mismatch",
          bid: null,
          auction: activeAuction,
        };
      }

      const now = Date.now();
      if (now > activeAuction.endTime) {
        return {
          success: false,
          message: "bid too late",
          bid: null,
          auction: activeAuction,
        };
      }

      if (amount <= activeAuction.currentBid) {
        return {
          success: false,
          message: "bid too low",
          bid: null,
          auction: activeAuction,
        };
      }

      // Create new bid
      const bid: Bid = {
        id: `bid_${now}_${Math.random().toString(36).substr(2, 9)}`,
        auctionId,
        amount,
        bidder,
        timestamp: now,
      };

      // Update auction
      activeAuction.currentBid = amount;
      activeAuction.currentWinner = bidder;

      // Update the auction in the auctionsList as well
      const auctionInList = auctionsList.find(
        (auction) => auction.id === auctionId
      );
      if (auctionInList) {
        auctionInList.currentBid = amount;
        auctionInList.currentWinner = bidder;
      }

      // Handle extended bidding
      if (activeAuction.extendedBidding) {
        const timeRemaining = activeAuction.endTime - now;
        if (timeRemaining < 10000) {
          // Less than 10 seconds
          activeAuction.endTime = now + 10000; // Extend to 10 seconds from now

          // Update the end time in the auctionsList as well
          if (auctionInList) {
            auctionInList.endTime = activeAuction.endTime;
          }
        }
      }

      // Publish bid placed event
      pubsub.publish("BID_PLACED", { bidPlaced: bid });

      // Publish auctions list update for live revalidation
      console.log(
        "Publishing AUCTIONS_UPDATED event (bid placed) with auctions:",
        auctionsList.length
      );
      pubsub.publish("AUCTIONS_UPDATED", { auctionsUpdated: auctionsList });

      return {
        success: true,
        message: "Bid placed successfully",
        bid,
        auction: activeAuction,
      };
    },
  },
  Subscription: {
    auctionStarted: {
      subscribe: () => {
        console.log("Client subscribed to AUCTION_STARTED");
        return pubsub.asyncIterableIterator("AUCTION_STARTED");
      },
    },
    bidPlaced: {
      subscribe: () => {
        console.log("Client subscribed to BID_PLACED");
        return pubsub.asyncIterableIterator("BID_PLACED");
      },
    },
    auctionEnded: {
      subscribe: () => {
        console.log("Client subscribed to AUCTION_ENDED");
        return pubsub.asyncIterableIterator("AUCTION_ENDED");
      },
    },
    auctionsUpdated: {
      subscribe: () => {
        console.log("Client subscribed to AUCTIONS_UPDATED");
        return pubsub.asyncIterableIterator("AUCTIONS_UPDATED");
      },
    },
  },
};
