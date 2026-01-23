# JavaScript Driver Documentation

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [API Reference](#api-reference)
5. [Event Listening](#event-listening)
6. [Examples](#examples)
7. [Testing](#testing)

## Overview

The JavaScript driver provides a simple interface for:
- **Producing messages** - Send messages to the transport bus
- **Consuming events** - Listen for specific event messages
- **Registration** - Register as a consumer for event routing

## Installation

```bash
npm install
```

## Quick Start

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

// Register and start listening
await driver.startEventListener(
    '127.0.0.1:9000', // Consumer address
    {
        registrationAddress: '127.0.0.1:49153',
        consumerId: 'my-consumer',
        events: ['user_login', 'order_created']
    }
);

// Listen for events
driver.on('user_login', (message, eventMessage) => {
    console.log('User logged in:', message);
});
```

## API Reference

See [README.md](README.md) for full API documentation.

## Event Listening

The driver supports event-based message consumption:

1. **Register as Consumer** - Register with the registration server
2. **Start Listener** - Start listening on your consumer address
3. **Subscribe to Events** - Listen for specific event names

## Examples

- [Basic Example](example.js) - Simple message sending
- [Event Listener Example](example-event-listener.js) - Event consumption
- [Integration Test](test-consumer-producer.js) - Full integration test

## Testing

See [README_TESTING.md](README_TESTING.md) for testing guide.

See [QUICK_START_TEST.md](QUICK_START_TEST.md) for quick test instructions.
