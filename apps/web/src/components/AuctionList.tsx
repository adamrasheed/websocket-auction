import { useQuery, useSubscription } from "@apollo/client";
import type { Auction } from "@shared/types";
import {
  GET_AUCTIONS,
  AUCTIONS_UPDATED_SUBSCRIPTION,
} from "../graphql/operations";
import { useMemo } from "react";

export function AuctionList() {
  const {
    data,
    loading: auctionsLoading,
    error: auctionsError,
    refetch,
  } = useQuery<{ auctions: Auction[] }>(GET_AUCTIONS, {
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    pollInterval: 2000, // Poll every 2 seconds as a fallback
  });

  // Subscribe to live updates
  useSubscription(AUCTIONS_UPDATED_SUBSCRIPTION, {
    onData: () => {
      // Force refetch when subscription data is received
      refetch();
    },
    onError: (error) => {
      console.error("AuctionList - subscription error:", error);
    },
    onComplete: () => {
      console.log("AuctionList - subscription completed");
    },
    shouldResubscribe: true,
  });

  // Use query data (will be updated by refetch when subscription fires)
  const auctions = data?.auctions || [];

  const latestAuction = auctions[0] || null;
  const isActive = latestAuction?.isActive || false;

  const title = useMemo(() => {
    if (!latestAuction) return "";
    if (latestAuction.currentWinner) {
      return `${latestAuction.currentWinner} won the auction`;
    }
    return isActive ? "Latest Auction" : "Latest Auction (Inactive)";
  }, [latestAuction, isActive]);

  if (auctionsLoading) {
    return <div className="auction-list empty">Loading auctions...</div>;
  }

  if (auctionsError) {
    return <div className="auction-list empty">Error loading auctions</div>;
  }

  if (auctions.length === 0) {
    return <div className="auction-list empty">No auctions created yet</div>;
  }

  return (
    <div className="auction-list">
      <h2>Latest Auction</h2>
      <div className="auction-grid">
        <div className="auction-card">
          <h3>{title}</h3>
          <div className="auction-details">
            <p>
              <strong>Starting Bid:</strong> $
              {latestAuction.startingBid.toFixed(2)}
            </p>
            <p>
              <strong>Duration:</strong> {latestAuction.duration} seconds
            </p>
            <p>
              <strong>Extended Bidding:</strong>{" "}
              <span
                className={
                  latestAuction.extendedBidding
                    ? "status-enabled"
                    : "status-disabled"
                }
              >
                {latestAuction.extendedBidding ? "Enabled" : "Disabled"}
              </span>
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {new Date(latestAuction.startTime).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
