import React from "react";
import {
  AuthorLabel,
  useCurrentAuthor,
  useCurrentWorkspace,
  useDocument,
  useDocuments,
  usePaths,
} from "react-earthstar";
import { Document, detChoice } from "earthstar";
import "./twodays.css";

export default function TwoDays() {
  const [currentWorkspace] = useCurrentWorkspace();

  return currentWorkspace ? (
    <div id={"twodays-app"}>
      <header>
        <h2>{"Twodays Crossing"}</h2>
        <p>
          {"Welcome, wanderer. Rest by the road and watch the world pass by."}
        </p>
        <p>
          {
            "Your actions — as well of those of whom you see here — will fade away after 48 hours."
          }
        </p>
      </header>
      <section id={"panel"}>
        <MessageList workspace={currentWorkspace} />
        <MessagePoster workspace={currentWorkspace} />
      </section>
    </div>
  ) : (
    <div>{"Select a workspace"}</div>
  );
}

function PastMessages({ workspace }: { workspace: string }) {
  const [currentAuthor] = useCurrentAuthor();
  const pastDocs = useDocuments(workspace, {
    contentIsEmpty: true,
    pathPrefix: "/twodays-v1.0/",
  });
  const livingDocs = useDocuments(workspace, {
    contentIsEmpty: false,
    pathPrefix: "/twodays-v1.0/",
  });

  const getPastMessage = () => {
    const pastOtherAuthorCount = new Set(
      pastDocs
        .map((doc) => doc.author)
        .filter((author) => author !== currentAuthor?.address)
    ).entries.length;

    if (pastOtherAuthorCount > 0 && pastOtherAuthorCount < 2) {
      return "Despite the silence, you get the feeling you're not alone.";
    }

    if (pastOtherAuthorCount > 2) {
      return "Looking around, you see hints of past life: objects have been moved, the still-warm embers of an extinguished camp-fire.";
    }

    if (pastOtherAuthorCount > 5) {
      return "You notice the signs of a life that must have passed through here: wagon tracks; a jumble of footprints, the discarded remains of a meal.";
    }

    if (pastOtherAuthorCount > 10) {
      return "It seems like many people met here once, whether by chance or trade.";
    }

    return "Eerily, the place seems untouched since you were last here.";
  };

  const getLivingMessage = () => {
    const livingOtherAuthorCount = new Set(
      livingDocs
        .map((doc) => doc.author)
        .filter((author) => author !== currentAuthor?.address)
    ).entries.length;

    if (livingOtherAuthorCount > 0 && livingOtherAuthorCount < 1) {
      return "Although you feel relief at seeing someone else here, you treat your unlikely companion with a degree of wariness.";
    }

    if (livingOtherAuthorCount > 2) {
      return "Someone thought to make a small fire here, which you gather around in turn.";
    }

    if (livingOtherAuthorCount > 5) {
      return "You hear the soft chatter of others as you approach the crossing.";
    }

    if (livingOtherAuthorCount > 10) {
      return "You cast a glance at the body of tents set up at the side of the path, and the shadows of life that play against their sides.";
    }

    return "Although it doesn't make sense, you feel as though you're the first living soul to set foot here.";
  };

  return (
    <div id={"preamble"}>
      <em>{livingDocs.length > 0 ? getLivingMessage() : getPastMessage()}</em>
      <hr />
    </div>
  );
}

function MessageList({ workspace }: { workspace: string }) {
  const messagesRef = React.useRef<HTMLDivElement | null>(null);

  const paths = usePaths(workspace, {
    pathPrefix: "/twodays-v1.0/",
  });

  const [lastDoc] = useDocument(workspace, paths[paths.length - 1]);

  const lastDocId = lastDoc?.contentHash ?? "none";

  React.useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [lastDocId]);

  return (
    <>
      <PastMessages workspace={workspace} />
      <div ref={messagesRef} id={"author-messages"}>
        {paths.map((path) => (
          <Message key={path} workspace={workspace} path={path} />
        ))}
      </div>
    </>
  );
}

function ActionisedMessage({
  workspace,
  messageDoc,
}: {
  workspace: string;
  messageDoc: Document;
}) {
  const className = detChoice(messageDoc.author, [
    "author-a",
    "author-b",
    "author-c",
  ]);

  const isAction = messageDoc.content.startsWith("/me ");
  const [displayNameDoc] = useDocument(
    workspace,
    `/about/~${messageDoc.author}/displayName.txt`
  );

  const name = (
    <span className={className}>
      {displayNameDoc ? (
        displayNameDoc.content
      ) : (
        <AuthorLabel address={messageDoc.author} />
      )}
    </span>
  );

  return isAction ? (
    <div id={"author-action"}>
      <em>
        {name} {messageDoc.content.replace("/me", "")}
      </em>
    </div>
  ) : (
    <div id={"author-speech"}>
      {name}
      {" says “"}
      {messageDoc.content}
      {"”"}
    </div>
  );
}

const START_FADING_MINUTES = 360;

function Message({ workspace, path }: { workspace: string; path: string }) {
  const [doc] = useDocument(workspace, path);

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
      <ActionisedMessage workspace={workspace} messageDoc={doc} />
    </div>
  );
}

function MessagePoster({ workspace }: { workspace: string }) {
  const [messageValue, setMessageValue] = React.useState("");
  const [currentAuthor] = useCurrentAuthor();

  const path = `/twodays-v1.0/${currentAuthor?.address}/${Date.now()}.txt!`;

  const [, setDoc] = useDocument(workspace, path);

  if (!currentAuthor) {
    return <div>{"You are a ghost... you cannot speak! Sign in."}</div>;
  }

  const isAction = messageValue.startsWith("/me ");

  return (
    <form
      id={"posting-input"}
      onSubmit={(e) => {
        e.preventDefault();

        setDoc(
          messageValue,
          Date.now() * 1000 + 24 * 60 * 60 * 1000 * 2 * 1000
        );

        setMessageValue("");
      }}
    >
      <input
        placeholder={
          "Speak out at the crossing! Prefix with /me to perform an action"
        }
        value={messageValue}
        onChange={(e) => setMessageValue(e.target.value)}
      />
      <button type={"submit"}>{isAction ? "Do it" : "Speak"}</button>
    </form>
  );
}
