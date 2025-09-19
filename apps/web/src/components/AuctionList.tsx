interface Auction {
  id: string;
  title: string;
  startingBid: number;
  duration: number;
  extendedBidding: boolean;
  createdAt: string;
}

interface AuctionListProps {
  auctions: Auction[];
}

export function AuctionList({ auctions }: AuctionListProps) {
  if (auctions.length === 0) {
    return <div className="auction-list empty">No auctions created yet</div>;
  }

  const latestAuction = auctions[0];

  return (
    <div className="auction-list">
      <h2>Latest Auction</h2>
      <div className="auction-grid">
        <div className="auction-card">
          <h3>{latestAuction.title}</h3>
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
              {new Date(latestAuction.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
