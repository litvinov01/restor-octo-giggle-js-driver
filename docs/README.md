# restor-octo-giggle JavaScript Driver

JavaScript driver library for the restor-octo-giggle transport bus. This driver allows you to send messages to the Rust transport server and listen for specific event messages.

## Features

- ✅ **Message Production** - Send messages to the transport bus
- ✅ **Event Listening** - Listen for specific event messages
- ✅ **Multiple Formats** - Support for JSON and simple format messages
- ✅ **TCP Protocol** - Built-in TCP client implementation
- ✅ **Zero Dependencies** - Uses only Node.js built-in modules

## Installation

```bash
npm install
```

## Quick Start

### Sending Messages (Producer)

```javascript
import Driver from './src/index.js';

// Create driver
const driver = Driver.fromAddress('127.0.0.1:49152');
await driver.initialize();

// Send a message
await driver.send('Hello from JS!');

// Send event message (JSON)
await driver.send(JSON.stringify({
    msg: 'User logged in',
    event_name: 'user_login'
}));

// Send simple format
await driver.send('user_login:User john_doe logged in');
```

### Listening for Events (Consumer)

```javascript
import Driver from './src/index.js';

const driver = Driver.fromAddress('127.0.0.1:49152');
await driver.initialize();

// Start event listener (defaults to port + 1)
await driver.startEventListener();

// Listen for specific event
const unsubscribe = driver.on('user_login', (message, eventMessage) => {
    console.log('User login event:', message);
    console.log('Full event:', eventMessage);
});

// Listen for all events
driver.on('*', (message, eventMessage) => {
    console.log('Any event:', eventMessage.event_name, message);
});

// Unsubscribe
unsubscribe();
```

## API Reference

### Driver

#### Static Methods

- `Driver.create()` - Create driver with default config
- `Driver.fromAddress(address)` - Create driver from address string
- `Driver.withConfig(config)` - Create driver with full config

#### Instance Methods

**Message Sending:**
- `initialize()` - Initialize the driver
- `send(message)` - Send a message
- `sendBatch(messages[])` - Send multiple messages
- `testConnection()` - Test connection to server

**Event Listening:**
- `startEventListener(config?)` - Start listening for events
- `stopEventListener()` - Stop listening
- `on(eventName, callback)` - Register event listener
- `off(eventName, callback)` - Remove event listener
- `getEventListener()` - Get event listener instance

## Message Formats

### JSON Format
```json
{
    "msg": "Message content",
    "event_name": "event_name"
}
```

### Simple Format
```
event_name:message content
```

## Examples

See `example.js` for basic usage examples.

See `test-consumer-producer.js` for integration testing examples.

## Documentation

All documentation is in this `docs/` folder:

- **README.md** (this file) - Main driver documentation
- [API Reference](DOCUMENTATION.md) - Detailed API documentation
- [Testing Guide](README_TESTING.md) - Integration testing
- [Quick Start Testing](QUICK_START_TEST.md) - Quick test guide
- [Structure](STRUCTURE.md) - Code structure overview

## License

MIT
