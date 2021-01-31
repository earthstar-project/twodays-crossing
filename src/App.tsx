import React from "react";
import "./App.css";
import {
  EarthstarPeer,
  Earthbar,
  useStorages,
  usePubs,
  useCurrentAuthor,
  useCurrentWorkspace,
  useSubscribeToStorages,
  WorkspaceTab,
  AuthorTab,
  Spacer,
  useDocument,
} from "react-earthstar";
import {
  AuthorKeypair,
  StorageMemory,
  ValidatorEs4,
  Document,
} from "earthstar";
import "react-earthstar/styles/layout.css";
import "react-earthstar/styles/junior.css";
import TwoDays from "./TwoDays";

import { useLocalStorage, writeStorage } from "@rehooks/local-storage";

const LS_AUTHOR_KEY = "earthstar-twodays-currentAuthor";
const LS_PUBS_KEY = "earthstar-twodays-pubs";
const LS_STORAGES_DOCS_KEY = "earthstar-twodays-storages-docs";
const LS_CURRENT_WORKSPACE_KEY = "earthstar-twodays-current-workspace";

function App() {
  const [workspacesDocsInStorage] = useLocalStorage<
    Record<
      string,
      {
        [path: string]: {
          [author: string]: Document;
        };
      }
    >
  >(LS_STORAGES_DOCS_KEY, {});

  const [pubsInStorage] = useLocalStorage<Record<string, string[]>>(
    LS_PUBS_KEY,
    {}
  );

  const [currentAuthorInStorage] = useLocalStorage<AuthorKeypair>(
    LS_AUTHOR_KEY
  );

  const [currentWorkspaceInStorage] = useLocalStorage(LS_CURRENT_WORKSPACE_KEY);

  const initWorkspaces = Object.entries(workspacesDocsInStorage).map(
    ([address, docs]) => {
      const storage = new StorageMemory([ValidatorEs4], address);

      storage._docs = docs;

      return storage;
    }
  );

  return (
    <EarthstarPeer
      initPubs={pubsInStorage}
      initWorkspaces={initWorkspaces}
      initCurrentAuthor={currentAuthorInStorage}
      initCurrentWorkspace={currentWorkspaceInStorage}
    >
      <Earthbar>
        <WorkspaceTab />
        <Spacer />
        <AuthorTab />
        <DisplayName />
      </Earthbar>
      <TwoDays />
      <Persistor />
    </EarthstarPeer>
  );
}

export default App;

function DisplayName() {
  const [currentWorkspace] = useCurrentWorkspace();
  const [currentAuthor] = useCurrentAuthor();

  const [displayNameDoc] = useDocument(
    `/about/~${currentAuthor?.address}/displayName.txt`
  );

  if (!currentWorkspace || !currentAuthor || !displayNameDoc?.content) {
    return null;
  }

  return (
    <div id={"earthbar-display-name"}>{`(${displayNameDoc.content})`}</div>
  );
}

function Persistor() {
  const [storages] = useStorages();
  const [pubs] = usePubs();
  const [currentAuthor] = useCurrentAuthor();
  const [currentWorkspace] = useCurrentWorkspace();

  useSubscribeToStorages({
    onWrite: (event) => {
      const storage = storages[event.document.workspace];

      writeStorage(LS_STORAGES_DOCS_KEY, {
        ...storages,
        [event.document.workspace]: (storage as StorageMemory)._docs,
      });
    },
  });

  React.useEffect(() => {
    Object.values(storages).forEach((storage) => {
      writeStorage(LS_STORAGES_DOCS_KEY, {
        ...storages,
        [storage.workspace]: (storage as StorageMemory)._docs,
      });
    });
  }, [storages]);

  React.useEffect(() => {
    writeStorage(LS_PUBS_KEY, pubs);
  }, [pubs]);

  React.useEffect(() => {
    writeStorage(LS_AUTHOR_KEY, currentAuthor);
  }, [currentAuthor]);

  React.useEffect(() => {
    writeStorage(LS_CURRENT_WORKSPACE_KEY, currentWorkspace);
  }, [currentWorkspace]);

  return null;
}
