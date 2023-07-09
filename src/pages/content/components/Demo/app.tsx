import React, { useEffect, useState } from "react";
import { onMessage } from "webext-bridge/content-script";
import Notification from "./components/Notification";
import ThresholdNotification from "./components/ThresholdNotification";
import ShadowRoot from "react-shadow-root";
import Styles from "./../../style.scss";

export default function App() {
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [lastFollowerCount, setLastFollowerCount] = useState<number | null>(
    null
  );

  useEffect(() => {
    const milestoneListener = onMessage("milestoneReached", ({ data }) => {
      setFollowerCount(data.followers);
      setTimeout(() => setFollowerCount(null), 8000);
    });

    const followerThresholdReachedListener = onMessage(
      "followerThresholdReached",
      ({ data }) => {
        setLastFollowerCount(data.followers);
        setTimeout(() => setLastFollowerCount(null), 8000);
      }
    );

    return () => {
      // cleanup listener when component is unmounted
      milestoneListener();
      followerThresholdReachedListener();
    };
  }, []);

  return (
    <ShadowRoot>
      <style type="text/css">{Styles}</style>
      <div className="fixed bottom-3 right-10">
        <Notification followerCount={followerCount} />
        <ThresholdNotification lastCount={lastFollowerCount} />
      </div>
    </ShadowRoot>
  );
}
