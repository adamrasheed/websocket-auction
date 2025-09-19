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
  } = useQuery<{ auctions: Auction[] }>(GET_AUCTIONS, {
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  // Subscribe to live updates
  useSubscription(AUCTIONS_UPDATED_SUBSCRIPTION, {
    shouldResubscribe: true,
  });

  const inActiveAuctions = useMemo(() => {
    const auctions = data?.auctions || [];
    return auctions.filter((auction) => !auction.isActive);
  }, [data?.auctions]);

  if (auctionsLoading) {
    return <div className="auction-list empty">Loading auctions...</div>;
  }

  if (auctionsError) {
    return <div className="auction-list empty">Error loading auctions</div>;
  }

  if (inActiveAuctions.length === 0) {
    return <div className="auction-list empty">No auctions created yet</div>;
  }

  const latestAuction = inActiveAuctions[0] || null;
  const winnerTitle = latestAuction?.currentWinner
    ? `Winner: ${latestAuction.currentWinner}`
    : "Latest Auction";

  return (
    <div className="auction-list card">
      <h2>Latest Auction</h2>
      <div className="auction-grid">
        <div className="auction-card">
          <h3>{latestAuction ? winnerTitle : "No auctions created yet"}</h3>
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
