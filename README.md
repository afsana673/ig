# goatbot-ig-group-manager

A small CommonJS helper for listing and processing pending group invitations using a **GoatBot Instagram Adapter** API instance.

> **Important compatibility note:** the supplied `handlerEvents (1).js` is a message-event handler. It does not expose the Instagram private/API methods for listing, accepting, or rejecting group invitations. Adapter method names vary by fork/version. This package therefore uses a configurable bridge rather than pretending that unverified method names are guaranteed to work.

## Install

After publishing this repository to GitHub and npm:

```bash
npm install goatbot-ig-group-manager
```

Or install directly from GitHub:

```bash
npm install your-github-username/goatbot-ig-group-manager
```

## Basic usage

```js
const GroupManager = require('goatbot-ig-group-manager');

// `api` is the logged-in API instance returned by your GoatBot Instagram Adapter.
const groups = new GroupManager(api, {
  methods: {
    getPending: 'YOUR_ADAPTER_PENDING_METHOD',
    accept: 'YOUR_ADAPTER_ACCEPT_METHOD',
    reject: 'YOUR_ADAPTER_REJECT_METHOD'
  }
});

const pending = await groups.getPending();
console.log(pending);

await groups.accept('INVITATION_ID');
await groups.reject('INVITATION_ID');
```

## If your adapter methods need custom arguments

Use `handlers` to map this package to the exact adapter API:

```js
const groups = new GroupManager(api, {
  handlers: {
    getPending: (api) => api.YOUR_PENDING_METHOD(/* required args */),
    accept: (api, id) => api.YOUR_ACCEPT_METHOD(id /*, required args */),
    reject: (api, id) => api.YOUR_REJECT_METHOD(id /*, required args */)
  }
});
```

## Bulk actions

```js
const pending = await groups.getPending();

// Uses id, invitationId, threadId, or thread_id by default.
const accepted = await groups.acceptAll(pending);
const rejected = await groups.rejectAll(pending);

console.log(accepted); // [{ id, success, result }] or [{ id, success: false, error }]
```

If your invitation objects use a different ID property:

```js
await groups.acceptAll(pending, item => item.request_pk);
```

`acceptAll` and `rejectAll` process invitations sequentially and return a result for each item. They do not stop the whole batch when one item fails.

## API

| Method | Description |
|---|---|
| `getPending(...args)` | Calls the configured pending-invitations method |
| `accept(id, ...args)` | Accepts one invitation |
| `reject(id, ...args)` | Rejects one invitation |
| `acceptAll(list?, getId?)` | Accepts each invitation in a list, or fetches pending invitations |
| `rejectAll(list?, getId?)` | Rejects each invitation in a list, or fetches pending invitations |

## Tests

```bash
npm test
```

## Publishing to npm

1. Create a GitHub repository and upload these files.
2. In the repository folder, run `npm install` (no runtime dependencies are required).
3. Run `npm test`.
4. Log in with `npm login`.
5. Run `npm publish`.

Use a unique package name if `goatbot-ig-group-manager` is already taken.

## Security and responsible use

Use only with an Instagram account and adapter session you own or are authorized to operate. Keep session cookies, passwords, tokens, and private API data out of GitHub and npm.
