import flLogo from "/FanaticsLiveLogoIcon.png";
import "./App.css";
import { CreateAuctionForm } from "./components/CreateAuctionForm";
import { AuctionDisplay } from "./components/AuctionDisplay";

function App() {
  return (
    <>
      <div>
        <a href="https://fanatics.live" target="_blank">
          <img src={flLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <h1>Fanatics Live</h1>
      <AuctionDisplay />
      <CreateAuctionForm />
    </>
  );
}

export default App;
