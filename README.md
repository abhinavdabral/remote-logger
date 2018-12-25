# remote-logger

## How to use

### Dependencies

The project is uses Yarn, so you can run

```bash
yarn install
```

### Server

Start the socket server using

```bash
node socket.js
```

Open Logs using

_in development mode._

```bash
yarn start
```

_or in production mode_

```bash
yarn build
```

and open **index.html** from **build** folder, in browser of your choice.

---

### Client side setup

**1. Connect to server**

- Add the following code to wherever you'd like to
  subscribe to the remote-logger

```javascript
const logger_socket_options = {
  transports: ["websocket"],
  reconnection: true,
  reconnectionDelay: 5000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 99999
};

debugger_socket = io.connect(
  "http://localhost:7777",
  logger_socket_options
);

debugger_socket.on("connect", () => {
  console.log("Connected to remote-logger.");
});

debugger_socket.on("ACK", (socket_id, joinRoom) => {
  /**
   * Ideally you would subscribe to __public__ first
   * and to some other meaningful group, like the user's
   * username after successful authentication.
   **/

  joinRoom("__public__");
});
```

**2. Create method that can be used to emit logs to remote-logger**

- And add the following code to somewhere where the _debugger_socket_ from above is accessible.

```javascript
/**
 * Used to change room after the socket is connected. This can be used
 * to switch from __public__ to some specific room for socket, like
 * User's username.
 *
 * @param {string} room
 **/
export function changeRoom(room) {
  if (debugger_socket) {
    debugger_socket.emit("join", room);
  }
}

/**
 * Emit logs to remote-logger.
 *
 * @param {object} data // JSON Object
 * @param {string} name // Group name
 **/
export function rlog(data, name = "[INFO]") {
    LOG("<" + (new Date()).toTimeString() + "> - " + name);
    debugger_socket &&
      debugger_socket.emit("logdata", {
        name,
        timestamp: new Date(),
        data
      });
  }
}
```

**3. Use it**

- Here's an example

```javascript
rlog(
  {
    someData: someValue,
    someOtherData: {
      key1: "value1"
    }
  },
  "[REQUEST]"
);
```

## Change Log

- 0.0.1 - (25/12/2018) Initial Release

## Contribution

Feel free to post Pull Requests if you've some improvements.

## License

**remote-logger** is licensed under MIT license.
