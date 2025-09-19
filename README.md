# Take-home for backend engineers

## Context

The goal of this project is to implement a basic version of a real-time auction feature.

This feature works as follows (which is a slightly simplified version of how auctions work on Fanatics Live):

1. When an auction starts, it has (a) a starting bid amount and (b) a duration. The default duration of an auction is 30 seconds.
2. The duration is used to drive a countdown timer.
3. While the auction is active, users can bid.
4. If a bid is (a) strictly higher than the current bid and (b) before the end of the auction, every user sees that the user who placed the current bid is currently winning.
   1. If a bid is not strictly higher than the current bid, the user who makes the bid gets an error "bid too low".
   2. If a bid is after the end of the auction, the user who makes the bid gets an error "bid too late".
   3. If a bid is successful, the UI is updated with (a) the current highest bid, (b) the name of the current winner, and (c) the next bid (for simplicity this should default to +$1 of the current highest bid).
5. When the timer ends, if there is at least one bid, the name of the highest bidder is shown as the winner.
6. For auctions with "extended bidding" enabled, if a bid is successfully placed with under 10 seconds remaining, the end of the auction is extended up to 10 seconds. Otherwise, bids do not impact the end of the auction.

## Your tasks

Implement these features in the auction feature, ideally in the sequence shown below:

1. Implement the logic for creating a new auction (currently unimplemented in the skeleton repo). This should be a mutation on the server. Ensure that at most one auction is active at any given time.
2. Implement the logic for processing bids on the backend, as described above.
3. Implement real-time updates for (a) auction started, (b) bid placed, (c) auction ended. This should be using [GraphQL subscriptions](https://www.apollographql.com/docs/apollo-server/data/subscriptions).
4. Implement the UI to show the auction and bid information: (a) current bid and winner, (b) timer, (c) next bid.

### Bonus points

If you have enough time, here are some extra credit challenges:

1. Think about clock drift -- the device time may be off compared to the server time, which can lead to incorrect "seconds remaining" shown in the UI. How would you address this?
2. Implement 'proxy bidding': a user can enter the max amount they're willing to bid upfront, the system bids on the user's behalf (e.g. +$1) every time they're outbid.

## Guidance

We strongly encourage using AI (e.g. Cursor or Windsurf) to tackle this project. However, the produced code is something that you should be comfortable explaining how it works, why certain choices were made, etc.

To save time, we provide this skeleton project as a starting point. It's using [Apollo Server](https://www.apollographql.com/docs/apollo-server) in the backend with a [Vite react-ts](https://vite.dev/) web app in the frontend. These are all bundled together in a monorepo using [Turborepo](https://turborepo.com/).

If you are more comfortable with something else, feel free to ignore this skeleton project. What we care about is that the feature works as expected and it's implemented using GraphQL.

## Getting started

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run dev
```
