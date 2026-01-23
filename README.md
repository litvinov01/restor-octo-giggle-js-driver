# restor-octo-giggle JavaScript Driver

JavaScript driver library for the restor-octo-giggle transport bus. This driver allows you to send messages to the Rust transport server and listen for specific event messages.

## Quick Start

### Installation

```bash
npm install
```

### Sending Messages

```javascript
import Driver from './src/index.js';

const driver = Driver.fromAddress('127.0.0.1:49152');
await driver.initialize();
await driver.send('Hello from JS!');
```

### Listening for Events

```javascript
const driver = Driver.fromAddress('127.0.0.1:49152');
await driver.initialize();

// Start event listener
await driver.startEventListener('127.0.0.1:9000', {
    registrationAddress: '127.0.0.1:49153',
    consumerId: 'my-consumer',
    events: ['user_login', 'order_created']
});

// Listen for events
driver.on('user_login', (message, eventMessage) => {
    console.log('User logged in:', message);
});
```

## Features

- ✅ **Message Production** - Send messages to the transport bus
- ✅ **Event Listening** - Listen for specific event messages
- ✅ **Multiple Formats** - Support for JSON and simple format messages
- ✅ **TCP Protocol** - Built-in TCP client implementation
- ✅ **Zero Dependencies** - Uses only Node.js built-in modules

## Documentation

📚 **All documentation is in the [`docs/`](docs/) folder:**

- [Complete Documentation](docs/README.md) - Full driver documentation
- [API Reference](docs/DOCUMENTATION.md) - Detailed API documentation
- [Testing Guide](docs/README_TESTING.md) - Integration testing
- [Quick Start Testing](docs/QUICK_START_TEST.md) - Quick test guide
- [Structure](docs/STRUCTURE.md) - Code structure overview

## Examples

- [Basic Example](example.js) - Simple message sending
- [Event Listener Example](example-event-listener.js) - Event consumption

## Scripts

```bash
npm run example          # Run basic example
npm run example:listener # Run event listener example
npm test                 # Run integration tests
```

## License

MIT
