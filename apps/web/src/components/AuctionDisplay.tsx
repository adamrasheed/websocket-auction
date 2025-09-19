import { useState, useEffect } from "react";
import {
  useSubscription,
  useQuery,
  useMutation,
  useApolloClient,
} from "@apollo/client";
import {
  GET_ACTIVE_AUCTION,
  AUCTION_STARTED_SUBSCRIPTION,
  BID_PLACED_SUBSCRIPTION,
  AUCTION_ENDED_SUBSCRIPTION,
  PLACE_BID,
} from "../graphql/operations";

export function AuctionDisplay() {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [bidderName, setBidderName] = useState<string>("");
  const [bidMessage, setBidMessage] = useState<string>("");

  const client = useApolloClient();
  const {
    data: activeAuctionData,
    loading: auctionLoading,
    refetch,
  } = useQuery(GET_ACTIVE_AUCTION, {
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const [placeBid, { loading: bidLoading }] = useMutation(PLACE_BID);

  // Subscribe to auction events
  useSubscription(AUCTION_STARTED_SUBSCRIPTION, {
    onData: ({ data }) => {
      console.log("Auction started:", data.data?.auctionStarted);
      setBidMessage("Auction started!");

      // Update Apollo cache
      if (data.data?.auctionStarted) {
        client.writeQuery({
          query: GET_ACTIVE_AUCTION,
          data: {
            activeAuction: data.data.auctionStarted,
          },
        });
        // Also refetch to ensure we have the latest data
        refetch();
        console.log("Updated cache and refetched for auction started");
      }
    },
    onError: (error) => {
      console.error("Subscription error:", error);
    },
    onComplete: () => {
      console.log("Subscription completed");
    },
  });

  useSubscription(BID_PLACED_SUBSCRIPTION, {
    onData: ({ data }) => {
      console.log("Bid placed:", data.data?.bidPlaced);
      setBidMessage(
        `New bid: $${data.data?.bidPlaced.amount} by ${data.data?.bidPlaced.bidder}`
      );

      // Update Apollo cache with new auction state
      if (data.data?.bidPlaced && activeAuctionData?.activeAuction) {
        const updatedAuction = {
          ...activeAuctionData.activeAuction,
          currentBid: data.data.bidPlaced.amount,
          currentWinner: data.data.bidPlaced.bidder,
        };

        client.writeQuery({
          query: GET_ACTIVE_AUCTION,
          data: {
            activeAuction: updatedAuction,
          },
        });

        // Update next bid amount for this user
        setBidAmount(data.data.bidPlaced.amount + 1);

        // Also refetch to ensure we have the latest data
        refetch();
      }
    },
  });

  useSubscription(AUCTION_ENDED_SUBSCRIPTION, {
    onData: ({ data }) => {
      console.log("Auction ended:", data.data?.auctionEnded);
      const auction = data.data?.auctionEnded;
      if (auction) {
        if (auction.currentWinner) {
          setBidMessage(
            `🎉 Auction has Ended! ${auction.currentWinner} is the winner!`
          );
        } else {
          setBidMessage("Auction has Ended! No bids were placed.");
        }
      } else {
        setBidMessage("Auction ended!");
      }

      // Update Apollo cache
      if (data.data?.auctionEnded) {
        client.writeQuery({
          query: GET_ACTIVE_AUCTION,
          data: {
            activeAuction: data.data.auctionEnded,
          },
        });
        // Also refetch to ensure we have the latest data
        refetch();
      }
    },
  });

  // Timer effect
  useEffect(() => {
    if (!activeAuctionData?.activeAuction?.isActive) {
      setTimeRemaining(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(
        0,
        activeAuctionData.activeAuction.endTime - now
      );
      const secondsRemaining = Math.ceil(remaining / 1000);
      setTimeRemaining(secondsRemaining);

      // If time has run out on the client side, update the auction state immediately
      if (secondsRemaining <= 0 && activeAuctionData.activeAuction.isActive) {
        console.log("Client-side auction timeout detected, updating cache");

        // Update the Apollo cache to mark auction as inactive
        const updatedAuction = {
          ...activeAuctionData.activeAuction,
          isActive: false,
        };

        client.writeQuery({
          query: GET_ACTIVE_AUCTION,
          data: {
            activeAuction: updatedAuction,
          },
        });

        // Show the auction ended message
        if (updatedAuction.currentWinner) {
          setBidMessage(
            `🎉 Auction has Ended! ${updatedAuction.currentWinner} is the winner!`
          );
        } else {
          setBidMessage("Auction has Ended! No bids were placed.");
        }
      }
    };

    updateTimer();

    // Update more frequently when close to ending for better responsiveness
    const updateFrequency = 100; // Update every 100ms for better responsiveness
    const interval = setInterval(updateTimer, updateFrequency);

    return () => clearInterval(interval);
  }, [activeAuctionData?.activeAuction, client]);

  // Set initial bid amount
  useEffect(() => {
    if (activeAuctionData?.activeAuction) {
      setBidAmount(activeAuctionData.activeAuction.currentBid + 1);
    }
  }, [activeAuctionData?.activeAuction]);

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAuctionData?.activeAuction || !bidderName.trim()) return;

    try {
      const result = await placeBid({
        variables: {
          auctionId: activeAuctionData.activeAuction.id,
          amount: bidAmount,
          bidder: bidderName.trim(),
        },
      });

      if (result.data?.placeBid.success) {
        setBidMessage("Bid placed successfully!");
        // Update next bid amount to current bid + $1
        setBidAmount(result.data.placeBid.auction.currentBid + 1);
      } else {
        // Show specific error messages as per README requirements
        const errorMessage =
          result.data?.placeBid.message || "Failed to place bid";
        setBidMessage(errorMessage);
      }
    } catch (error) {
      setBidMessage("Error placing bid");
      console.error("Bid error:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (auctionLoading) return <div>Loading auction...</div>;

  const auction = activeAuctionData?.activeAuction;

  if (!auction) {
    return (
      <div className="auction-display">
        <h2>No Active Auction</h2>
        <p>Create an auction to get started!</p>
      </div>
    );
  }

  return (
    <div className="auction-display">
      <h2>Live Auction</h2>

      {bidMessage && (
        <div
          className={`bid-message ${
            bidMessage.includes("Error") ||
            bidMessage.includes("Failed") ||
            bidMessage.includes("too low") ||
            bidMessage.includes("too late")
              ? "error"
              : "success"
          }`}
        >
          {bidMessage}
        </div>
      )}

      <div className="auction-info">
        <div className="auction-timer">
          <h3>Time Remaining</h3>
          <div className={`timer ${timeRemaining <= 10 ? "urgent" : ""}`}>
            {formatTime(timeRemaining)}
          </div>
        </div>

        <div className="auction-bid">
          <h3>Current Bid</h3>
          <div className="bid-amount">${auction.currentBid.toFixed(2)}</div>
          {auction.currentWinner ? (
            <div className="current-winner">
              Winner: {auction.currentWinner}
            </div>
          ) : (
            <div className="no-bids">No bids yet</div>
          )}
          <div className="next-bid">
            Next bid: ${(auction.currentBid + 1).toFixed(2)}
          </div>
        </div>
      </div>

      {auction.isActive && (
        <form onSubmit={handleBidSubmit} className="bid-form">
          <h3>Place a Bid</h3>
          <div className="form-group">
            <label htmlFor="bidder">Your Name</label>
            <input
              type="text"
              id="bidder"
              value={bidderName}
              onChange={(e) => setBidderName(e.target.value)}
              required
              disabled={bidLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="bidAmount">
              Bid Amount (Minimum: ${(auction.currentBid + 1).toFixed(2)})
            </label>
            <input
              type="number"
              id="bidAmount"
              min={auction.currentBid + 0.01}
              step="0.01"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              placeholder={`${(auction.currentBid + 1).toFixed(2)}`}
              required
              disabled={bidLoading}
            />
          </div>
          <button type="submit" disabled={bidLoading || timeRemaining === 0}>
            {bidLoading ? "Placing Bid..." : "Place Bid"}
          </button>
        </form>
      )}

      {!auction.isActive && (
        <div className="auction-ended">
          <h3>🎉 Auction has Ended! 🎉</h3>
          {auction.currentWinner ? (
            <div className="winner-announcement">
              <p className="winner-text">
                <strong>{auction.currentWinner}</strong> is the winner!
              </p>
              <p className="winning-bid">
                Winning bid: <strong>${auction.currentBid.toFixed(2)}</strong>
              </p>
            </div>
          ) : (
            <p className="no-winner">No bids were placed - no winner</p>
          )}
        </div>
      )}
    </div>
  );
}
