import React from "react";
import {
    useCurrentAuthor,
    useCurrentWorkspace,
    useDocument
} from "react-earthstar";

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
