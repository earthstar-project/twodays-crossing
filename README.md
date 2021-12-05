# DEF (Decentralised Ephemeral Fireplace) v1.0

A virtual fireplace and chat app built on [Earthstar](https://github.com/earthstar-project/earthstar), made to showcase Earthstar's ephemeral, auto-destructing documents.

It is a modified version of Twodays Crossing.

## Visit it

https://fireplace.earthstar-project.org

## Document scheme

### Messages

New chat messages are written to paths with the format like this:

```
/twodays-v1.0/~{AUTHOR_ADDRESS}/${UNIX_TIMESTAMP}.txt!
```

and have their `deleteAfter` property set to 48 hours after their creation.

### Logs

Logs (i.e. the ones you throw on the fire) use this format for their paths:

`/fireplace/~${AUTHOR_ADDRESS}/!log.log`

This way each user can only have one active log on the fire at a time.

They have their `deleteAfter` property set to 2 hours after their creation.

### Display names

Because this is arguably a roleplaying application, display names are not saved to the standard path. Instead, they're at:

`/twodays-v1.0/~${AUTHOR_ADDRESS}/characterName.txt`
