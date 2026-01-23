# Integration Testing Guide

This guide explains how to test the JS driver (producer) with the Rust consumer server.

## Overview

- **JS Driver**: Acts as a producer, sending messages to the server
- **Rust Server**: Acts as a consumer, receiving and processing messages

## Prerequisites

1. Rust server must be built and ready
2. Node.js installed (for running JS driver)
3. Both servers should be able to communicate on the same network

## Quick Start

### Step 1: Start the Rust Consumer Server

```bash
# From rust_samples directory
cd rust_samples

# Option 1: Run the test consumer server (recommended for testing)
cargo run --bin test_consumer_server

# Option 2: Run the main server
cargo run
```

The server will start listening on `0.0.0.0:49152` (or the address specified in `TRANSPORT_ADDRESS` env var).

### Step 2: Run the JS Driver Tests

```bash
# From drivers/js directory
cd drivers/js

# Run the integration test
node test-consumer-producer.js
```

## Test Scenarios

The test script (`test-consumer-producer.js`) includes:

1. **Connection Test** - Verifies connection to server
2. **Basic Message** - Sends a simple text message
3. **Event Message (JSON)** - Sends JSON-formatted event message
4. **Simple Format** - Sends `event_name:message` format
5. **Batch Messages** - Sends multiple messages at once
6. **Message Types** - Tests various message formats
7. **Error Handling** - Tests error scenarios

## Expected Output

### Rust Server Output

```
==========================================
Test Consumer Server
==========================================

Starting test consumer server...
Initializing transport server...
Address: 0.0.0.0:49152

[Message Consumer] Received: Hello from JS Driver!
Processing message: Hello from JS Driver!

[Message Consumer] Received: {"msg":"Test message from JS","event_name":"test_event"}
Processing message: {"msg":"Test message from JS","event_name":"test_event"}

...
```

### JS Driver Output

```
========================================
Consumer-Producer Integration Test
========================================

Target Server: 127.0.0.1:49152
Make sure the Rust server is running!

=== Test 1: Basic Message Sending ===
✓ Driver initialized
✓ Message sent: "Hello from JS Driver!"

=== Test 2: Event-Based Message (JSON) ===
✓ Event message sent: {"msg":"Test message from JS","event_name":"test_event"}

...

========================================
Test Summary
========================================
Passed: 7/7
Failed: 0/7

✅ All tests passed!
```

## Manual Testing

You can also test manually using the example script:

```bash
# Run the example
node example.js
```

Or use the driver programmatically:

```javascript
import Driver from './src/index.js';

const driver = Driver.fromAddress('127.0.0.1:49152');
await driver.initialize();
await driver.send('My test message');
```

## Troubleshooting

### Connection Refused

**Error:** `ECONNREFUSED` or connection timeout

**Solutions:**
1. Ensure Rust server is running
2. Check the server address matches (default: `127.0.0.1:49152`)
3. Verify firewall isn't blocking the connection
4. Check if port is already in use: `netstat -ano | findstr :49152` (Windows)

### Port Already in Use

**Error:** `Address already in use` (Rust server)

**Solutions:**
1. Use a different port: `set TRANSPORT_ADDRESS=0.0.0.0:49153`
2. Find and stop the process using the port
3. Restart the server

### Messages Not Received

**Symptoms:** JS driver sends but server doesn't receive

**Solutions:**
1. Check server logs for errors
2. Verify message format (should end with newline)
3. Check network connectivity
4. Ensure server is listening on correct interface (0.0.0.0 for all interfaces)

## Advanced Testing

### Custom Server Address

```bash
# Set custom address for Rust server
set TRANSPORT_ADDRESS=0.0.0.0:9000
cargo run --bin test_consumer_server
```

```javascript
// Use custom address in JS driver
const driver = Driver.fromAddress('127.0.0.1:9000');
```

### Testing with Event Routing

If you have producers registered for specific events:

```javascript
// Send event message
const eventMsg = JSON.stringify({
    msg: 'Test message',
    event_name: 'my_event'
});
await driver.send(eventMsg);
```

The server will route this to producers subscribed to `my_event`.

### Performance Testing

```javascript
// Send many messages quickly
const driver = Driver.fromAddress('127.0.0.1:49152');
await driver.initialize();

for (let i = 0; i < 1000; i++) {
    await driver.send(`Message ${i}`);
}
```

## Next Steps

- Add more test scenarios
- Test with multiple concurrent connections
- Test error recovery
- Test with different message sizes
- Performance benchmarking
