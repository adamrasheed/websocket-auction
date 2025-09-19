import { CreateAuctionForm } from "./components/CreateAuctionForm";
import { AuctionDisplay } from "./components/AuctionDisplay";

import "./App.css";
import { AuctionList } from "./components/AuctionList";

function App() {
  return (
    <>
      <div className="header">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="logo"
        >
          <path d="m14 13-8.381 8.38a1 1 0 0 1-3.001-3l8.384-8.381" />
          <path d="m16 16 6-6" />
          <path d="m21.5 10.5-8-8" />
          <path d="m8 8 6-6" />
          <path d="m8.5 7.5 8 8" />
        </svg>
        <h1>Live Auctions</h1>
      </div>
      <AuctionDisplay />
      <AuctionList />
      <CreateAuctionForm />
    </>
  );
}

export default App;
