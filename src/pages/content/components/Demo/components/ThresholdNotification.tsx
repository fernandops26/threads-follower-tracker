import cn from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import CountUp from "react-countup";
import threads from "@assets/img/threads.png";
import { useEffect, useRef, useState } from "react";

const ThresholdNotification = ({ lastCount }) => {
  const ref = useRef(null);

  return (
    <AnimatePresence>
      {lastCount !== null && (
        <motion.div
          key={""}
          layout
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.5 }}
          className={cn("")}
          role="status"
        >
          <div className="flex items-end">
            <div
              ref={ref}
              className="px-8 py-5 rounded bg-white text-black border min-w-[310px]"
            >
              <div className="flex items-center text-3xl">
                <img
                  src={chrome.runtime.getURL(threads)}
                  width={100}
                  height={100}
                  className=" w-8 h-auto rounded "
                />
                <div className="ml-auto flex">
                  <div className=" font-bold ml-3">
                    <CountUp start={0} delay={2} end={lastCount} duration={3} />{" "}
                    followers
                  </div>
                  <span className=" ml-2">🎉</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ThresholdNotification;
