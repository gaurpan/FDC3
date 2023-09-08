---
sidebar_label: Channel
title: Channel
hide_title: true
original_id: Channel
---
# `Channel`

Represents a context channel that applications can use to send and receive context data.

A channel can be either a ["User" channel](../spec#joining-user-channels) (retrieved with [`getUserChannels`](DesktopAgent#getuserchannels)), a custom ["App" channel](../spec#app-channels) (obtained through [`getOrCreateChannel`](DesktopAgent#getorcreatechannel)) or a ["Private" channel](../spec#private-channels) (obtained via an intent result).

:::note

There are differences in behavior when you interact with a User channel via the `DesktopAgent` interface and the `Channel` interface. Specifically, when 'joining' a User channel or adding a context listener when already joined to a channel via the `DesktopAgent` interface, existing context (matching the type of the context listener) on the channel is received by the context listener immediately. Whereas, when a context listener is added via the `Channel` interface, context is not received automatically, but may be retrieved manually via the [`getCurrentContext()`](#getcurrentcontext) function.

:::

Channels each have a unique identifier, some display metadata and operations for broadcasting context to other applications, or receiving context from other applications.

```ts
interface Channel {
  // properties
  id: string;
  type: "user" | "app" | "private";
  displayMetadata?: DisplayMetadata;

  // functions
  broadcast(context: Context): Promise<void>;
  getCurrentContext(contextType?: string): Promise<Context|null>;
  addContextListener(contextType: string | null, handler: ContextHandler): Promise<Listener>;
  
  //deprecated functions
  /**
   * @deprecated Use `addContextListener(null, handler)` instead of `addContextListener(handler)`
   */
  addContextListener(handler: ContextHandler): Promise<Listener>;
}
```

#### See also

* [`Context`](Types#context)
* [`Listener`](Types#listener)
* [`DesktopAgent.getUserChannels`](DesktopAgent#getuserchannels)
* [`DesktopAgent.getOrCreateChannel`](DesktopAgent#getorcreatechannel)
* [`DesktopAgent.joinUserChannel`](DesktopAgent#joinuserchannel)

## Properties

### `id`

```ts
public readonly id: string;
```

Uniquely identifies the channel. It is either assigned by the desktop agent (User Channel) or defined by an application (App Channel).

### `type`

```ts
public readonly type: "user" | "app" | "private";
```

Can be _user_,  _app_ or _private_.

### `displayMetadata`

```ts
public readonly displayMetadata?: DisplayMetadata;
```

DisplayMetadata can be used to provide display hints for User Channels intended to be visualized and selectable by end users.

#### See also

* [`DisplayMetadata`](Metadata#displaymetadata)

## Functions

### `addContextListener`

```ts
public addContextListener(contextType: string | null, handler: ContextHandler): Promise<Listener>;
```

Adds a listener for incoming contexts of the specified _context type_ whenever a broadcast happens on this channel.

If, when this function is called, the channel already contains context that would be passed to the listener it is NOT called or passed this context automatically (this behavior differs from that of the [`fdc3.addContextListener`](DesktopAgent#addcontextlistener) function). Apps wishing to access to the current context of the channel should instead call the [`getCurrentContext(contextType)`](#getcurrentcontext) function.

Optional metadata about each context message received, including the app that originated the message, SHOULD be provided by the desktop agent implementation.

#### Examples

Add a listener for any context that is broadcast on the channel:

```ts
const listener = await channel.addContextListener(null, context => {
    if (context.type === 'fdc3.contact') {
        // handle the contact
    } else if (context.type === 'fdc3.instrument') => {
        // handle the instrument
    }
});

// later
listener.unsubscribe();
```

Adding listeners for specific types of context that is broadcast on the channel:

```ts
const contactListener = await channel.addContextListener('fdc3.contact', contact => {
    // handle the contact
});

const instrumentListener = await channel.addContextListener('fdc3.instrument', instrument => {
    // handle the instrument
});

// later
contactListener.unsubscribe();
instrumentListener.unsubscribe();
```

#### See also

* [`Listener`](Types#listener)
* [`ContextHandler`](Types#contexthandler)
* [`broadcast`](#broadcast)
* [`getCurrentContext`](#getcurrentcontext)

### `broadcast`

```typescript
public broadcast(context: Context): Promise<void>;
```

Broadcasts a context on the channel. This function can be used without first joining the channel, allowing applications to broadcast on both App Channels and User Channels that they aren't a member of.

If the broadcast is denied by the channel or the channel is not available, the promise will be rejected with an `Error` with a `message` string from the [`ChannelError`](Errors#channelerror) enumeration.

Channel implementations should ensure that context messages broadcast by an application on a channel should not be delivered back to that same application if they are joined to the channel.

If you are working with complex context types composed of other simpler types (as recommended by the [FDC3 Context Data specification](../../context/spec#assumptions)) then you should broadcast each individual type (starting with the simpler types, followed by the complex type) that you want other apps to be able to respond to. Doing so allows applications to filter the context types they receive by adding listeners for specific context types.

#### Example

```javascript
const instrument = {
    type: 'fdc3.instrument',
    id: {
        ticker: 'AAPL'
    }
};

try {
    channel.broadcast(instrument);
} catch (err: ChannelError) {
    // handler errror
}
```

#### See also

* [`ChannelError`](Errors#channelerror)
* [`getCurrentContext`](#getcurrentcontext)
* [`addContextListener`](#addcontextlistener)

### `getCurrentContext`

```ts
public getCurrentContext(contextType?: string): Promise<Context|null>;
```

When a _context type_ is provided, the most recent context matching the type will be returned, or `null` if no matching context is found.

If no _context type_ is provided, the most recent context that was broadcast on the channel - regardless of type - will be returned.  If no context has been set on the channel, it will return `null`.

It is up to the specific Desktop Agent implementation whether and how recent contexts are stored. For example, an implementation could store context history for a channel in a single array and search through the array for the last context matching a provided type, or context could be maintained as a dictionary keyed by context types. An implementation could also choose not to support context history, in which case this method will return `null` for any context type not matching the type of the most recent context.

If getting the current context fails, the promise will be rejected with an `Error` with a `message` string from the [`ChannelError`](Errors#channelerror) enumeration.

#### Examples

Without specifying a context type:

```ts
try {
    const context = await channel.getCurrentContext();
} catch (err: ChannelError) {
    // handler errror
}
```

Specifying a context type:

```ts
try {
    const contact = await channel.getCurrentContext('fdc3.contact');
} catch (err: ChannelError) {
    // handler errror
}
```

#### See also

* [`ChannelError`](Errors#channelerror)
* [`broadcast`](#broadcast)
* [`addContextListener`](#addcontextlistener)

## Deprecated Functions

### `addContextListener` (deprecated)

```ts
/**
 * @deprecated Use `addContextListener(null, handler)` instead of `addContextListener(handler)`
 */
public addContextListener(handler: ContextHandler): Promise<Listener>;
```

Adds a listener for incoming contexts whenever a broadcast happens on the channel.

#### See also

* [`addContextListener`](#addcontextlistener)