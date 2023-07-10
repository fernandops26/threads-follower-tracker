import React, { useEffect, useState } from "react";
import "@pages/popup/Popup.css";
import { onMessage, sendMessage } from "webext-bridge/popup";

type Milestone = {
  id: number;
  value: number;
};

let nextId = 1;

const ConfigView = () => {
  const [username, setUsername] = useState<string>("");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [followers, setFollowers] = useState<number>(0);
  const [newMilestone, setNewMilestone] = useState<number>(0);
  const [followerThreshold, setFollowerThreshold] = useState<number>(0);

  useEffect(() => {
    getData();

    // Listening for changes from background script
    onMessage("onDataChange", async ({ data }) => {
      const { followers } = data as { followers: number };

      setFollowers(followers);
    });
  }, []);

  const getData = async () => {
    const data = await sendMessage("getData", {}, "background");

    const { username, milestones, followers, followerThreshold } = data as {
      username: string;
      milestones: Milestone[];
      followers: number;
      followerThreshold: number;
    };

    setUsername(username);
    setMilestones(milestones);
    setFollowers(followers);
    setFollowerThreshold(followerThreshold);

    nextId = milestones.length + 1;
  };

  const saveUsername = () => {
    sendMessage("setUsername", { username: username }, "background");
  };

  const addMilestone = () => {
    const milestone = { id: nextId++, value: newMilestone };
    setMilestones([...milestones, milestone]);
    setNewMilestone(0);
    sendMessage("addMilestone", { milestone }, "background");
  };

  const removeMilestone = (id: number) => {
    setMilestones(milestones.filter((milestone) => milestone.id !== id));
    sendMessage("removeMilestone", { id }, "background");
  };

  const updateMilestone = (id: number, value: number) => {
    setMilestones(
      milestones.map((milestone) =>
        milestone.id === id ? { ...milestone, value } : milestone
      )
    );
    sendMessage("updateMilestone", { id, value }, "background");
  };

  const saveMilestones = () => {
    sendMessage("setMilestones", { milestones: milestones }, "background");
  };

  const saveFollowerThreshold = () => {
    sendMessage(
      "setFollowerThreshold",
      { followerThreshold: followerThreshold },
      "background"
    );
  };

  return (
    <div>
      <label className="text-gray-700">Username</label>
      <div className="flex items-center bg-gray-200 rounded-lg shadow-inner mb-6">
        <input
          className="flex-grow p-2 bg-transparent outline-none text-gray-700"
          placeholder="Enter username"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
        <button
          onClick={saveUsername}
          className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none min-w-[80px]"
        >
          Save
        </button>
      </div>

      <div className="mb-6 text-center">
        <span className="text-gray-700">Current Followers</span>
        <span className="text-blue-600 font-bold ml-2">{followers}</span>
      </div>
      <div className="mb-6">
        <label className="text-gray-700">Notification Threshold</label>
        <div className="flex items-center bg-gray-200 rounded-lg shadow-inner my-3">
          <input
            type="number"
            className="flex-grow p-2 bg-transparent outline-none text-gray-700"
            placeholder="New follower threshold"
            value={followerThreshold}
            onChange={(e) => setFollowerThreshold(parseInt(e.target.value))}
          />
          <button
            onClick={saveFollowerThreshold}
            className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none min-w-[80px]"
          >
            Save
          </button>
        </div>
      </div>

      <label className="text-gray-700">Milestones</label>
      {milestones.map((milestone, index) => (
        <div
          key={index}
          className="flex items-center bg-gray-200 rounded-lg shadow-inner my-3"
        >
          <input
            type="number"
            className="flex-grow p-2 bg-transparent outline-none text-gray-700"
            value={milestone.value}
            onChange={(e) =>
              updateMilestone(milestone.id, parseInt(e.target.value))
            }
          />
          <button
            onClick={() => removeMilestone(milestone.id)}
            className="bg-red-500 text-white px-4 py-2 rounded-r-lg hover:bg-red-600 focus:outline-none min-w-[80px]"
          >
            Remove
          </button>
        </div>
      ))}
      <div className="flex items-center bg-gray-200 rounded-lg shadow-inner my-3">
        <input
          type="number"
          className="flex-grow p-2 bg-transparent outline-none text-gray-700"
          placeholder="New milestone"
          value={newMilestone}
          onChange={(e) => setNewMilestone(parseInt(e.target.value))}
        />
        <button
          onClick={addMilestone}
          className="bg-gray-500 text-white px-4 py-2 rounded-r-lg hover:bg-gray-600 focus:outline-none min-w-[80px]"
        >
          Add
        </button>
      </div>

      <button
        onClick={saveMilestones}
        className="w-full mt-6 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none"
      >
        Save Milestones
      </button>
    </div>
  );
};

export default ConfigView;
