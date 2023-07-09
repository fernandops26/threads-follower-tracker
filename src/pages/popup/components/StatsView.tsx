import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import dayjs from "dayjs";
import { onMessage, sendMessage } from "webext-bridge/popup";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = (period, data) => ({
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
  },
  scales: {
    x: {
      ticks: {
        // Forcing the display of specific ticks
        autoSkip: true,
        callback: function (value, index, values) {
          if (index == 0 || index == values.length - 1)
            return data.labels[index];
        },
      },
    },
    y: {
      ticks: {
        precision: 0,
      },
    },
  },
});

const periods = {
  "24h": dayjs().subtract(1, "day").valueOf(),
  "7d": dayjs().subtract(7, "day").valueOf(),
  "1m": dayjs().subtract(1, "month").valueOf(),
  "3m": dayjs().subtract(3, "months").valueOf(),
};

export default function StatsView() {
  const [followerData, setFollowerData] = useState<any>(null);
  const [period, setPeriod] = useState("24h");

  useEffect(() => {
    getData();

    const onDataChangeListener = onMessage("onDataChange", ({ data }) => {
      setFollowerData(filterData(data.followerHistory));
    });

    return () => {
      onDataChangeListener();
    };
  }, [period]);

  const getData = async () => {
    const data = await sendMessage("getData", {}, "background");
    setFollowerData(filterData(data.followerHistory));
  };

  const filterData = (data) => {
    const filteredData = data.filter(
      (entry) => entry.timestamp >= periods[period]
    );

    let dailyMaxData = [];

    if (period !== "24h") {
      const groupedByDay = filteredData.reduce((acc, entry) => {
        const day = dayjs(entry.timestamp).startOf("day").format("MMM D");
        if (!acc[day]) acc[day] = [];
        acc[day].push(entry);
        return acc;
      }, {});

      dailyMaxData = Object.values(groupedByDay).map((entries) => {
        const maxCountEntry = entries.reduce(
          (max, entry) => (entry.count > max.count ? entry : max),
          entries[0]
        );
        return maxCountEntry;
      });
    } else {
      dailyMaxData = filteredData;
    }

    const labels = dailyMaxData.map((entry) => {
      const date = dayjs(entry.timestamp);
      return period === "24h" ? date.format("h:mm A") : date.format("MMM D");
    });

    const followers = dailyMaxData.map((entry) => entry.count);

    return {
      filteredData: dailyMaxData,
      labels,
      datasets: [
        {
          label: "Followers",
          data: followers,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
      ],
    };
  };

  return (
    <div className=" min-h-fit">
      <h2 className="text-sm font-medium">Follower Growth Over Time</h2>
      <div className="mb-4 gap-1 flex mt-2">
        {Object.keys(periods).map((p) => (
          <button
            key={p}
            className={`px-3 py-1 rounded-lg ${
              period === p
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setPeriod(p)}
          >
            {p}
          </button>
        ))}
      </div>
      <div>
        {followerData !== null && (
          <Line options={options(period, followerData)} data={followerData} />
        )}
      </div>
    </div>
  );
}
