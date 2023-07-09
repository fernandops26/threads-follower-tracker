import StatsView from "./components/StatsView";
import ConfigView from "./components/ConfigView";
import { useState } from "react";
import ShadowRoot from "react-shadow-root";
import Styles from "./index.css";

const Popup = () => {
  const [view, setView] = useState("stats");

  const switchView = (newView) => {
    setView(newView);
  };

  return (
    <ShadowRoot>
      <style type="text/css">{Styles}</style>
      <div className="w-full min-h-screen bg-gray-200 flex flex-col items-center justify-center">
        <div className="bg-white max-w-md w-full p-4 shadow rounded-lg overflow-hidden">
          <h1 className="text-xl text-gray-900 font-semibold mb-6 text-center">
            Threads Follower Tracker
          </h1>

          <div className="flex justify-start gap-2 mb-4">
            <button
              className={`py-2 px-4 rounded ${
                view === "stats"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
              onClick={() => switchView("stats")}
            >
              Stats
            </button>

            <button
              className={`py-2 px-4 rounded ${
                view === "config"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
              onClick={() => switchView("config")}
            >
              Config
            </button>
          </div>

          {view === "config" ? <ConfigView /> : <StatsView />}
        </div>
      </div>
    </ShadowRoot>
  );
};

export default Popup;
