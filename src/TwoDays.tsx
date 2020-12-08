import React from "react";
import {
  AuthorLabel,
  useCurrentAuthor,
  useCurrentWorkspace,
  useDocument,
  useDocuments,
} from "react-earthstar";
import { Document, detChoice } from "earthstar";
import { useWindupString } from 'windups';

import TitleImage from "./crossing.png";
import "./twodays.css";
import { useHourOf } from './seasonal-hours';

export default function TwoDays() {
  const [currentWorkspace] = useCurrentWorkspace();
  let [hourOf] = useHourOf();

  document.body.className = hourOf.season; //todo: useEffect hook?

  return (
    <div id={"twodays-app"}>
      {currentWorkspace ? (
        <>
          <header>
            <img
              src={TitleImage}
              alt={
                "Twodays Crossing - an illustration of a wooded clearing with a small stone platform in its centre"
              }
            />
            <aside>
              <p>
                {
                  "Welcome, wanderer. Rest by the road and watch the world pass by."
                }
              </p>
              <p>
                {
                  "Your actions — as well of those of whom you see here — will fade away after 48 hours."
                }
              </p>
              <p className="seasonal-hour">
                It is the {hourOf.longName} in {hourOf.season}.
              </p>
            </aside>
          </header>
          <section id={"panel"}>
            <MessageList />
            <MessagePoster />
          </section>
          <section id="help">
            <details>
              <summary>Commands</summary>
              <ul>
                <li>
                  Hello world. &rarr; <b>MyName</b> says "Hello world."
                </li>
                <li>
                  <b>/me</b> looks at the sky. &rarr; <i><b>MyName</b> looks at the
                  sky.</i>
                </li>
                <li>
                  <b>/describe</b> The sun sets. &rarr; <i>The sun sets.</i>
                </li>
                <li>
                  <b>/nick</b> Puppy &rarr; <i><b>@name</b> changed their name to <b>Puppy</b>.</i>
                </li>
              </ul>
            </details>
          </section>
        </>
      ) : (
        <div>
          <p>
            {
              "To enter Twodays Crossing, you must first join and select a workspace."
            }
          </p>
          <p>
            {
              "If you don't know any yet, find a friend who can give you an invitation code."
            }
          </p>
        </div>
      )}
    </div>
  );
}

function PastMessages() {
  const [currentAuthor] = useCurrentAuthor();
  const pastDocs = useDocuments({
    contentIsEmpty: true,
    pathPrefix: "/twodays-v1.0/",
  });
  const livingDocs = useDocuments({
    contentIsEmpty: false,
    pathPrefix: "/twodays-v1.0/",
  });

  const getPastMessage = () => {
    const pastOtherAuthorCount = new Set(
      pastDocs
        .map((doc) => doc.author)
        .filter((author) => author !== currentAuthor?.address)
    ).size;

    if (pastOtherAuthorCount > 10) {
      return "It seems like many people met here once, whether by chance or trade.";
    }

    if (pastOtherAuthorCount > 5) {
      return "You notice the signs of a life that must have passed through here: wagon tracks; a jumble of footprints, the discarded remains of a meal.";
    }

    if (pastOtherAuthorCount > 2) {
      return "Looking around, you see hints of past life: objects have been moved, the still-warm embers of an extinguished camp-fire.";
    }

    if (pastOtherAuthorCount > 0 && pastOtherAuthorCount < 2) {
      return "Despite the silence, you get the feeling you're not alone.";
    }

    return "Eerily, the place seems untouched since you were last here.";
  };

  const getLivingMessage = () => {
    const livingOtherAuthorCount = new Set(
      livingDocs
        .map((doc) => doc.author)
        .filter((author) => author !== currentAuthor?.address)
    ).size;

    if (livingOtherAuthorCount > 10) {
      return "You cast a glance at the body of tents set up at the side of the path, and the shadows of life that play against their sides.";
    }

    if (livingOtherAuthorCount > 5) {
      return "You hear the soft chatter of others as you approach the crossing.";
    }

    if (livingOtherAuthorCount > 1) {
      return "Someone thought to make a small fire here, which you gather around in turn.";
    }

    if (livingOtherAuthorCount > 0 && livingOtherAuthorCount < 2) {
      return "Although you feel relief at seeing someone else here, you treat your unlikely companion with a degree of wariness.";
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

function MessageList() {
  const messagesRef = React.useRef<HTMLDivElement | null>(null);

  const docs = useDocuments({
    pathPrefix: "/twodays-v1.0/",
    contentIsEmpty: false,
  });

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
      <PastMessages />
      <div ref={messagesRef} id={"author-messages"}>
        {docs.map((doc) => (
          <Message key={doc.path} doc={doc} />
        ))}
      </div>
    </>
  );
}

function ActionisedMessage({ messageDoc }: { messageDoc: Document }) {
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
  const isNickAction = messageDoc.content.startsWith("/nick");
  // const olderThanFiveMin = 

  const masticatedMessage = (() => {
    if (isAuthorAction) {
      return messageDoc.content.replace("/me", "").trim();
    }
    if (isDescribeAction) {
      return messageDoc.content.replace("/describe", "").trim();
    }
    return messageDoc.content.trim();
  })();
  
  const [displayNameDoc] = useDocument(
    `/about/~${messageDoc.author}/displayName.txt`
  );
  const [woundUpMessage, ] = useWindupString(masticatedMessage);

  const displayMessage = (() => {
    if ((Date.now() - (messageDoc.timestamp / 1000)) < (5 * 60 * 1000)) {
      console.log(messageDoc.timestamp + " IS THE TIMMMMEEEEEE");
      return woundUpMessage; 
    }
    console.log("OLDER THAN 5 MIN");
    return masticatedMessage; 

  })();

  const name = (
    <span className={className} title={messageDoc.author}>
      {displayNameDoc ? (
        displayNameDoc.content
      ) : (
        <AuthorLabel address={messageDoc.author} />
      )}
    </span>
  );

  if (isAuthorAction) {
    return (
      <div className="author-action">
        <em>
          {name}
          {displayMessage}
        </em>
      </div>
    );
  } else if (isDescribeAction) {
    return (
      <div className="describe-action">
        <em title={messageDoc.author}>
          {displayMessage}
        </em>
      </div>
    );
  } else if (isNickAction) {
    return (
      <div className="author-action">
        <em>
          <AuthorLabel address={messageDoc.author} />
          {" changed their name to "}
          {name}
          {"."}
        </em>
      </div>
    );
  } else {
    return (
      <div className="author-speech">
        {name}
        {" says “"}
        {displayMessage}
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

function MessagePoster() {
  const [messageValue, setMessageValue] = React.useState("");
  const [currentAuthor] = useCurrentAuthor();

  const path = `/twodays-v1.0/~${currentAuthor?.address}/${Date.now()}.txt!`;

  const [, setDoc] = useDocument(path);
  const [, setNameDoc] = useDocument(`/about/~${currentAuthor?.address}/displayName.txt`);

  const isAction = messageValue.startsWith("/me");
  const isDescribe = messageValue.startsWith("/describe");
  const isNick = messageValue.startsWith("/nick");

  const getButtonLabel = () => {
    if (isAction) {
      return "Do it";
    }

    if (isDescribe) {
      return "Make it so";
    }

    if (isNick) {
      return "Rename";
    }

    return "Speak";
  };

  if (!currentAuthor) {
    return <div>{"You are a ghost... you cannot speak! Sign in."}</div>;
  }

  return (
    <form
      id={"posting-input"}
      onSubmit={(e) => {
        e.preventDefault();

        if (messageValue.trim().length === 0) {
          return;
        }

        if (isNick) {
          const newNick = messageValue.replace("/nick", "").trim();
          if (newNick !== "") {
            setNameDoc(newNick);
          }
        }

        const res = setDoc(
          messageValue.trim(),
          Date.now() * 1000 + 2 * 24 * 60 * 60 * 1000 * 1000
        );

        console.log(res);

        setMessageValue("");
      }}
    >
      <input
        placeholder="Speak out at the crossing!"
        value={messageValue}
        onChange={(e) => setMessageValue(e.target.value)}
      />
      <button type={"submit"}>{getButtonLabel()}</button>
    </form>
  );
}
