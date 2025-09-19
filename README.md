# Websocket Powered Auctions

## Context

This is a coding excercise I did to get more familiar with websockets, and GraphQL subscriptions. Its a graphql powered backend, and a react-powered frontend.

The goal of this project is to implement a basic version of a real-time auction feature.

### Features:

1. When an auction starts, it has (a) a starting bid amount and (b) a duration. The default duration of an auction is 30 seconds.
2. The duration is used to drive a countdown timer.
3. While the auction is active, users can bid.
4. If a bid is (a) strictly higher than the current bid and (b) before the end of the auction, every user sees that the user who placed the current bid is currently winning.
   1. If a bid is not strictly higher than the current bid, the user who makes the bid gets an error "bid too low".
   2. If a bid is after the end of the auction, the user who makes the bid gets an error "bid too late".
   3. If a bid is successful, the UI is updated with (a) the current highest bid, (b) the name of the current winner, and (c) the next bid (for simplicity this should default to +$1 of the current highest bid).
5. When the timer ends, if there is at least one bid, the name of the highest bidder is shown as the winner.
6. For auctions with "extended bidding" enabled, if a bid is successfully placed with under 10 seconds remaining, the end of the auction is extended up to 10 seconds. Otherwise, bids do not impact the end of the auction.

## Instructions

1. Clone directory
2. run `bun install`
3. run `bun run dev`
