import React from "react";

import { StorageLocalStorage, StorageToAsync, ValidatorEs4 } from "earthstar";
import {
  EarthstarPeer,
  useLocalStorageEarthstarSettings,
  LocalStorageSettingsWriter,
} from "react-earthstar";
import "react-earthstar/styles/layout.css";
import "react-earthstar/styles/junior.css";
import TwoDays from "./TwoDays";

const HOLIDAY_SPACE = "+plaza.prm27p8eg65c";

function App() {
  const { initCurrentAuthor, initIsLive } =
    useLocalStorageEarthstarSettings("twodays");

  const storage = new StorageLocalStorage([ValidatorEs4], HOLIDAY_SPACE);
  const asyncStorage = new StorageToAsync(storage);

  return (
    <EarthstarPeer
      initCurrentAuthor={initCurrentAuthor}
      initIsLive={initIsLive}
      initCurrentWorkspace={HOLIDAY_SPACE}
      initPubs={{
        [HOLIDAY_SPACE]: [
          "https://earthstar-demo-pub-6b.fly.dev",
          "https://earthstar-demo-pub-v6-a.glitch.me",
        ],
      }}
      initWorkspaces={[asyncStorage]}
    >
      <TwoDays />
      <LocalStorageSettingsWriter storageKey={"twodays"} />
    </EarthstarPeer>
  );
}

export default App;
