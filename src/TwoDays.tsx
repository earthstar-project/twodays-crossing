import React from "react";
import {
  AuthorLabel,
  useCurrentAuthor,
  useCurrentWorkspace,
  useDocument,
  usePaths,
} from "react-earthstar";
import { Document } from "earthstar";

export default function TwoDays() {
  const [currentWorkspace] = useCurrentWorkspace();

  return currentWorkspace ? (
    <div>
      <MessagePoster workspace={currentWorkspace} />
      <MessageList workspace={currentWorkspace} />
    </div>
  ) : (
    <div>{"Select a workspace"}</div>
  );
}

function MessageList({ workspace }: { workspace: string }) {
  const paths = usePaths(workspace, {
    pathPrefix: "/twodays-v1.0/",
  });

  const reversed = [...paths].reverse();

  return (
    <ul>
      {reversed.map((path) => (
        <Message key={path} workspace={workspace} path={path} />
      ))}
    </ul>
  );
}

function ActionisedMessage({
  workspace,
  messageDoc,
}: {
  workspace: string;
  messageDoc: Document;
}) {
  const isAction = messageDoc.content.startsWith("/me ");
  const [displayNameDoc] = useDocument(
    workspace,
    `/about/~${messageDoc.author}/displayName.txt`
  );

  const name = displayNameDoc ? (
    displayNameDoc.content
  ) : (
    <AuthorLabel address={messageDoc.author} />
  );

  return isAction ? (
    <div>
      <em>
        {name} {messageDoc.content.replace("/me", "")}
      </em>
    </div>
  ) : (
    <div>
      {name}
      {" says “"}
      {messageDoc.content}
      {"”"}
    </div>
  );
}

function Message({ workspace, path }: { workspace: string; path: string }) {
  const [doc] = useDocument(workspace, path);

  const twoDaysAgo = Date.now() * 1000 - 24 * 60 * 60 * 1000 * 2 * 1000;

  if (!doc || doc.timestamp < twoDaysAgo) {
    return null;
  }

  return <ActionisedMessage workspace={workspace} messageDoc={doc} />;
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
      onSubmit={(e) => {
        e.preventDefault();

        setDoc(
          messageValue,
          Date.now() * 1000 + 24 * 60 * 60 * 1000 * 2 * 1000
        );

        setMessageValue("");
      }}
    >
      <textarea
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
