import { useState } from "react";
import { useMutation, gql, useApolloClient } from "@apollo/client";

interface FormData {
  startingBid: number;
  duration: number;
  extendedBidding: boolean;
}

const CREATE_AUCTION = gql`
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

const initialFormData: FormData = {
  startingBid: 1,
  duration: 30,
  extendedBidding: true,
};

const GET_ACTIVE_AUCTION = gql`
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

export function CreateAuctionForm() {
  const [formData, setFormData] = useState<FormData>({
    ...initialFormData,
  });

  const client = useApolloClient();

  const [createAuction, { loading, error }] = useMutation(CREATE_AUCTION, {
    onCompleted: (data) => {
      setFormData({
        ...initialFormData,
      });
      console.log("Auction created:", data.createAuction);

      // Update Apollo cache to trigger UI update
      if (data.createAuction) {
        console.log("Updating cache with new auction:", data.createAuction);
        client.writeQuery({
          query: GET_ACTIVE_AUCTION,
          data: {
            activeAuction: data.createAuction,
          },
        });
        console.log("Cache updated successfully");

        // Also trigger a refetch to ensure UI updates
        client.refetchQueries({
          include: [GET_ACTIVE_AUCTION],
        });
      }
    },
    onError: (error) => {
      console.error("Error creating auction:", error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAuction({
      variables: {
        startingBid: formData.startingBid,
        duration: formData.duration,
        extendedBidding: formData.extendedBidding,
      },
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : Number(value),
    }));
  };

  return (
    <div className="auction-section">
      <form onSubmit={handleSubmit} className="auction-form">
        <h2>Create New Auction</h2>
        {error && <div className="error-message">Error: {error.message}</div>}
        <div className="form-group">
          <label htmlFor="startingBid">Starting Bid (USD)</label>
          <input
            type="number"
            id="startingBid"
            name="startingBid"
            min="0.01"
            step="0.01"
            value={formData.startingBid}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="duration">Duration (seconds)</label>
          <input
            type="number"
            id="duration"
            name="duration"
            min="1"
            value={formData.duration}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group checkbox-group">
          <label className="toggle-label">
            <input
              type="checkbox"
              name="extendedBidding"
              checked={formData.extendedBidding}
              onChange={handleChange}
              disabled={loading}
            />
            <span className="toggle-text">Extended Bidding</span>
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Auction"}
        </button>
      </form>
    </div>
  );
}
