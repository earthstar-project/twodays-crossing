import React from "react";
import "./App.css";
import {
  EarthstarPeer,
  Earthbar,
  useCurrentAuthor,
  useCurrentWorkspace,
  WorkspaceTab,
  AuthorTab,
  Spacer,
  useDocument,
  useLocalStorageEarthstarSettings,
  LocalStorageSettingsWriter,
} from "react-earthstar";
import "react-earthstar/styles/layout.css";
import "react-earthstar/styles/junior.css";
import TwoDays from "./TwoDays";

function App() {
  const initValues = useLocalStorageEarthstarSettings("twodays");

  return (
    <EarthstarPeer {...initValues}>
      <Earthbar>
        <WorkspaceTab />
        <Spacer />
        <AuthorTab />
        <DisplayName />
      </Earthbar>
      <TwoDays />
      <LocalStorageSettingsWriter storageKey={"twodays"} />
    </EarthstarPeer>
  );
}

export default App;

function DisplayName() {
  const [currentWorkspace] = useCurrentWorkspace();
  const [currentAuthor] = useCurrentAuthor();

  const [displayNameDoc] = useDocument(
    `/twodays-v1.0/~${currentAuthor?.address}/characterName.txt`
  );

  if (!currentWorkspace || !currentAuthor || !displayNameDoc?.content) {
    return null;
  }

  return (
    <div id={"earthbar-display-name"}>{`(${displayNameDoc.content})`}</div>
  );
}
