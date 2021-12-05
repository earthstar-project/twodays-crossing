import React from "react";
import {
  AuthorLabel,
  useCurrentAuthor,
  useCurrentWorkspace,
  useDocument,
  useDocuments,
  useIsLive,
  useStorage,
  useWorkspacePubs,
  useSubscribeToStorages,
} from "react-earthstar";
import {
  Document,
  detChoice,
  generateAuthorKeypair,
  isErr,
  checkAuthorKeypairIsValid,
  WriteEvent,
} from "earthstar";
import "./twodays.css";
import Fireplace0 from "./logs/f0.gif";
import Fireplace1 from "./logs/f1.gif";
import Fireplace2 from "./logs/f2.gif";
import Fireplace3 from "./logs/f3.gif";
import { formatDistanceToNowStrict } from "date-fns";
import Identicon from "identicon.js";

var identicons: Record<string, string> = {};

function getIdenticon(address: string) {
  const result = identicons[address];

  if (!result) {
    const newResult = new Identicon(address, {
      format: "svg",
      size: 10,
      margin: 0,
    }).toString();
    return newResult;
  }

  return result;
}

export default function TwoDays() {
  const [currentWorkspace] = useCurrentWorkspace();

  return (
    <div id={"twodays-app"}>
      {currentWorkspace ? (
        <>
          <section id={"panel"}>
            <header>DEF (Decentralised Ephemeral Fireplace) v1.0</header>
            <Fireplace />
            <ThrowLogOnFireButton />
            <MessageList />
            <MessagePoster />
            <Commands />
            <IdentityPanel />
            <ConnectionStatus />
          </section>
        </>
      ) : (
        <div>
          <p>Shouldn't happen here.</p>
        </div>
      )}
      <footer>
        Powered by <a href="https://earthstar-project.org">Earthstar</a>!{" "}
        <div>
          <a href="https://github.com/earthstar-project/twodays-crossing/tree/holiday-fire">
            Source code
          </a>
        </div>
      </footer>
    </div>
  );
}

function MessageList() {
  const messagesRef = React.useRef<HTMLDivElement | null>(null);

  const docs = useDocuments({
    pathStartsWith: "/twodays-v1.0/",
    contentLengthGt: 0,
  }).filter((doc) => !doc.path.endsWith("characterName.txt"));

  // sort oldest first
  docs.sort((aDoc, bDoc) => (aDoc.timestamp < bDoc.timestamp ? -1 : 1));

  const lastDoc = docs[docs.length - 1];
  const lastDocId = lastDoc?.path ?? "none";

  React.useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [lastDocId]);

  return (
    <>
      <div ref={messagesRef} id={"author-messages"}>
        {docs.map((doc) => (
          <Message key={doc.path} doc={doc} />
        ))}
      </div>
    </>
  );
}

function ActionisedMessage({ messageDoc }: { messageDoc: Document }) {
  const [currentAuthor] = useCurrentAuthor();

  const className = detChoice(messageDoc.author, [
    "author-a",
    "author-b",
    "author-c",
    "author-d",
    "author-e",
    "author-f",
  ]);

  const isAuthorAction = messageDoc.content.startsWith("/me");
  const isDescribeAction = messageDoc.content.startsWith("/describe");
  const isNickAction = messageDoc.content.startsWith("/nick ");

  const [characterNameDoc] = useDocument(
    `/twodays-v1.0/~${messageDoc.author}/characterName.txt`
  );

  const name = (
    <span className={className} title={messageDoc.author}>
      {characterNameDoc ? (
        characterNameDoc.content
      ) : (
        <AuthorLabel address={messageDoc.author} />
      )}
    </span>
  );

  const identicon = getIdenticon(messageDoc.author + currentAuthor?.secret);

  const identiconSvg = (
    <img
      className="identicon"
      src={`data:image/svg+xml;base64,${identicon}`}
      alt={`An identicon represent the address ${messageDoc.author}`}
    />
  );

  if (isAuthorAction) {
    return (
      <div className="author-action">
        <em>
          {name}
          {identiconSvg}
          {messageDoc.content.replace("/me", "")}
        </em>
      </div>
    );
  } else if (isDescribeAction) {
    return (
      <div className="describe-action">
        <em title={messageDoc.author}>
          {messageDoc.content.replace("/describe", "")}
        </em>
      </div>
    );
  } else if (isNickAction) {
    return null;
  } else {
    return (
      <div className="author-speech">
        {name}
        {identiconSvg}
        {" says “"}
        {messageDoc.content}
        {"”"}
      </div>
    );
  }
}

const START_FADING_MINUTES = 360;

function Message({ doc }: { doc: Document }) {
  const twoDaysAgo = Date.now() * 1000 - 24 * 60 * 60 * 1000 * 2 * 1000;

  if (!doc || doc.timestamp < twoDaysAgo) {
    return null;
  }

  const expiryTimestamp =
    doc.deleteAfter || doc.timestamp + 24 * 60 * 60 * 1000 * 2 * 1000;

  const minutesFromExpiring = (expiryTimestamp / 1000 - Date.now()) / 1000 / 60;

  const messageOpacity =
    minutesFromExpiring > START_FADING_MINUTES
      ? 1
      : Math.max(0.2, minutesFromExpiring / START_FADING_MINUTES);

  return (
    <div style={{ opacity: messageOpacity }}>
      <ActionisedMessage messageDoc={doc} />
    </div>
  );
}

const fireplaceGraphics = [Fireplace0, Fireplace1, Fireplace2, Fireplace3];
const fireplaceDescriptions = [
  "An unlit fireplace. Cold.",
  "A small fire flickers in a fireplace. Cosy",
  "A robust fire warms a fireplace. Toasty.",
  "A roaring fire fills a fireplace. Hot!",
];

function Fireplace() {
  const logDocs = useDocuments({
    pathStartsWith: `/fireplace/`,
    pathEndsWith: `.log`,
  });

  // I had to do some weird stuff here to get React to notice documents being deleted. Not an issue in future versions of react-earthstar.
  const [followedDocs, setFollowedDocs] = React.useState(logDocs);

  const onWrite = React.useCallback((event: WriteEvent) => {
    setFollowedDocs((prevDocs) => {
      return prevDocs.map((doc) => {
        if (doc.path === event.document.path) {
          return event.document;
        }

        return doc;
      });
    });
  }, []);

  useSubscribeToStorages({
    paths: logDocs.map((doc) => doc.path),
    onWrite,
  });

  React.useEffect(() => setFollowedDocs(logDocs), [logDocs]);

  const numberOfLogs = followedDocs.filter(
    (doc) => doc.content.length > 0
  ).length;

  return (
    <img
      id="fireplace"
      alt={fireplaceDescriptions[numberOfLogs] || fireplaceDescriptions[3]}
      src={fireplaceGraphics[numberOfLogs] || Fireplace3}
    />
  );
}

function ThrowLogOnFireButton() {
  const [currentAuthor] = useCurrentAuthor();

  const [document, setDocument] = useDocument(
    `/fireplace/~${currentAuthor?.address}/!log.log`
  );

  const hasActiveLog = document ? document.content !== "" : false;

  const memoDocs = React.useMemo(
    () => (document ? [document] : []),
    [document]
  );

  useDiscardAfterExpiry(memoDocs);

  return (
    <button
      id="log-button"
      disabled={currentAuthor === null || hasActiveLog}
      onClick={() => {
        const now = Date.now() * 1000;

        setDocument("log", now + 1000 * 1000 * 60 * 60);
      }}
    >
      {currentAuthor === null ? (
        "Anonymous users cannot throw logs on fires"
      ) : hasActiveLog ? (
        <LogTimeRemaining doc={document as Document} />
      ) : (
        "Throw log on fire"
      )}
    </button>
  );
}

function LogTimeRemaining({ doc }: { doc: Document }) {
  const distance =
    doc && doc.deleteAfter
      ? formatDistanceToNowStrict(doc.deleteAfter / 1000)
      : "";
  const [timeRemaining, setTimeRemaining] = React.useState(distance);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (doc && doc.deleteAfter) {
        const distance = formatDistanceToNowStrict(doc.deleteAfter / 1000);
        setTimeRemaining(distance);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [doc]);

  return <span>{`Your log will burn for ${timeRemaining}`}</span>;
}

function MessagePoster() {
  const [messageValue, setMessageValue] = React.useState("");
  const [currentAuthor] = useCurrentAuthor();

  const path = `/twodays-v1.0/~${currentAuthor?.address}/${Date.now()}.txt!`;

  const [, setDoc] = useDocument(path);

  const [, setCharacterNameDoc] = useDocument(
    `/twodays-v1.0/~${currentAuthor?.address}/characterName.txt`
  );

  if (!currentAuthor) {
    return null;
  }

  const isAction = messageValue.startsWith("/me ");
  const isNickAction = messageValue.startsWith("/nick ");

  return (
    <form
      id={"posting-input"}
      onSubmit={(e) => {
        e.preventDefault();

        if (messageValue.trim().length === 0) {
          return;
        }

        if (isNickAction) {
          const newName = `${messageValue}`.replace("/nick ", "");

          setCharacterNameDoc(newName);
        }

        setDoc(
          messageValue.trim(),
          Date.now() * 1000 + 2 * 24 * 60 * 60 * 1000 * 1000
        );

        setMessageValue("");
      }}
    >
      <input
        placeholder="Messages disappear after 48 hours... like tears in rain..."
        value={messageValue}
        onChange={(e) => setMessageValue(e.target.value)}
      />
      <button type={"submit"}>{isAction ? "Do it" : "Say"}</button>
    </form>
  );
}

function IdentityPanel() {
  const [currentAuthor, setCurrentAuthor] = useCurrentAuthor();

  const [shortname, setShortname] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");

  const [authorAddress, setAuthorAddress] = React.useState("");
  const [secret, setSecret] = React.useState("");

  const storage = useStorage();

  const identicon = getIdenticon(
    "" + currentAuthor?.address + currentAuthor?.secret
  );

  const identiconSvg = (
    <img
      className="identicon"
      src={`data:image/svg+xml;base64,${identicon}`}
      alt={`An identicon represent the address ${currentAuthor?.address}`}
    />
  );

  if (currentAuthor) {
    return (
      <details key="signed-in">
        <summary>
          👤 Signed in as <AuthorLabel address={currentAuthor.address} />
          {identiconSvg}
        </summary>
        <div>
          <dl>
            <dt>Address</dt>
            <dd>{currentAuthor.address}</dd>
            <dt>Secret (highlight to see)</dt>
            <dd className="highlight-secret">{currentAuthor.secret}</dd>
          </dl>
          <button onClick={() => setCurrentAuthor(null)}>Sign out</button>
        </div>
      </details>
    );
  }

  return (
    <details key="signed-out">
      <summary>✍️ Sign in to participate</summary>
      <fieldset>
        <legend>For new users</legend>
        <label>
          Shortname
          <input
            type="text"
            placeholder="4 lowercase letters / numbers, permanent"
            value={shortname}
            onChange={(e) => {
              if (e.target.value.length <= 4) {
                setShortname(e.target.value);
              }
            }}
          />
        </label>
        <label>
          Display name
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            type="text"
            placeholder="However long you want, change whenever"
          />
        </label>
        <button
          onClick={() => {
            const result = generateAuthorKeypair(shortname);

            if (isErr(result)) {
              alert(result);
              return;
            }

            setCurrentAuthor(result);

            if (displayName.length > 0) {
              storage?.set(result, {
                path: `/twodays-v1.0/~${result.address}/characterName.txt`,
                content: displayName,
                format: "es.4",
              });
            }

            setShortname("");
            setDisplayName("");
            setAuthorAddress("");
            setSecret("");
          }}
        >
          Generate new identity
        </button>
      </fieldset>
      <hr />
      <fieldset>
        <legend>For existing users</legend>
        <label>
          Address
          <input
            value={authorAddress}
            onChange={(e) => setAuthorAddress(e.target.value)}
            type="text"
            placeholder="@name.xxxxxx"
          />
        </label>
        <label>
          Secret
          <input
            onChange={(e) => setSecret(e.target.value)}
            type="password"
            value={secret}
          />
        </label>
        <button
          onClick={() => {
            const keypair = {
              address: authorAddress,
              secret: secret,
            };

            const result = checkAuthorKeypairIsValid(keypair);

            if (isErr(result)) {
              alert(result);
              return;
            }

            setCurrentAuthor(keypair);

            setShortname("");
            setDisplayName("");
            setAuthorAddress("");
            setSecret("");
          }}
        >
          Sign in
        </button>
      </fieldset>
    </details>
  );
}

function ConnectionStatus() {
  const [pubs] = useWorkspacePubs();
  const [isLive, setIsLive] = useIsLive();
  const [currentWorkspace] = useCurrentWorkspace();

  return (
    <div id="connection-status">
      <details>
        <summary>
          {isLive ? (
            <span>🌍 {`Connected to ${pubs.length} pockets`}</span>
          ) : (
            <span>🏝 Working offline</span>
          )}
        </summary>
        {isLive ? (
          <div>
            Your own in-browser pocket (keyed to {` ${currentWorkspace}`}) is
            syncing with the following cloud pockets:
            <ul>
              {pubs.map((url) => (
                <li key={url}>{url}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div>
            Your in-browser pocket (keyed to {` ${currentWorkspace}`}) is not
            being synced with any other pockets.
          </div>
        )}
      </details>
      <label>
        <input
          type="checkbox"
          checked={isLive}
          onClick={(e) => {
            e.stopPropagation();
            setIsLive(!isLive);
          }}
        />
        Online
      </label>
    </div>
  );
}

function Commands() {
  const [currentAuthor] = useCurrentAuthor();

  if (!currentAuthor) {
    return null;
  }

  return (
    <details>
      <summary>⌨️ Commands</summary>
      <dl>
        <dt>Season's greetings!.</dt>
        <dd>
          <b>MyName</b> says "Season's greetings"
        </dd>
        <dt>
          <b>{"/nick "}</b>
          My New Name
        </dt>
        <dd>{"Changes your nickname to My New Name"}</dd>

        <dt>
          <b>/me</b> sips something warming
        </dt>
        <dd>
          <b>MyName</b> sips something warming.
        </dd>

        <dt>
          <b>/describe</b> Jingling commences!
        </dt>
        <dd>
          <i>Jingling commences!</i>
        </dd>
      </dl>
    </details>
  );
}

function useDiscardAfterExpiry(docs: Document[]) {
  const storage = useStorage();

  const [, forceRender] = React.useState(true);

  React.useEffect(() => {
    const clears = docs.map((doc) => {
      const now = Date.now();

      if (doc.deleteAfter && doc.deleteAfter / 1000 > now) {
        const msFromNow = doc.deleteAfter / 1000 - Date.now();

        const timeout = setTimeout(() => {
          storage?.discardExpiredDocuments().then(() => {
            storage.onWrite.send({
              kind: "DOCUMENT_WRITE",
              isLatest: true,
              isLocal: true,
              document: { ...doc, content: "" },
              fromSessionId: storage.sessionId,
            });
            forceRender((prev) => !prev);
          });
        }, msFromNow);

        return () => clearTimeout(timeout);
      }

      return () => {};
    });

    return () => {
      clears.forEach((clear) => clear());
    };
  }, [storage, docs]);
}
