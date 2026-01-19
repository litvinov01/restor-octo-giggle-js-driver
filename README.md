# restor-octo-giggle Driver

JavaScript driver library for sending messages to the restor-octo-giggle transport bus. This library provides protocol encapsulation similar to the Rust server implementation.

## Features

- 🔌 **Protocol Encapsulation**: Transport protocols are fully encapsulated and interchangeable
- 📨 **Simple API**: Easy-to-use interface for sending messages
- 🚀 **Minimal Dependencies**: Uses only Node.js built-in modules (no external dependencies)
- 🔧 **Extensible Design**: Easy to add new transport protocols
- ⚙️ **Configurable**: Support for custom addresses and protocols

## Installation

No installation required if using Node.js built-in modules. Just import the driver:

```javascript
import Driver from './src/index.js';
```

Or if you want to use it as a package, ensure you have Node.js 14+ and ES modules support.

## Quick Start

### Basic Usage

```javascript
import Driver from './src/index.js';

// Create driver with default configuration (127.0.0.1:49152)
const driver = Driver.create();
await driver.initialize();

// Send a message
await driver.send('Hello, restor-octo-giggle server!');
```

### Custom Address

```javascript
import Driver from './src/index.js';

// Create driver with custom address
const driver = Driver.fromAddress('127.0.0.1:49152');
await driver.initialize();

await driver.send('Custom address message');
```

### Full Configuration

```javascript
import Driver, { ProtocolType } from './src/index.js';

const driver = Driver.withConfig({
    protocol: ProtocolType.TCP,
    host: '127.0.0.1',
    port: 49152,
});

await driver.initialize();
await driver.send('Full config message');
```

## API Reference

### Driver Class

#### Constructor

```javascript
new Driver(config)
```

- `config`: `DriverConfig` object or plain object with:
  - `protocol`: Protocol type (default: `ProtocolType.TCP`)
  - `host`: Server hostname (default: `'127.0.0.1'`)
  - `port`: Server port (default: `49152`)

#### Methods

##### `initialize()`

Initialize the driver with the configured protocol.

```javascript
await driver.initialize();
```

##### `send(message)`

Send a message to the server.

```javascript
await driver.send('Hello, server!');
```

- `message`: String message to send
- Returns: `Promise<void>`
- Throws: Error if sending fails

##### `sendBatch(messages)`

Send multiple messages sequentially.

```javascript
await driver.sendBatch([
    'Message 1',
    'Message 2',
    'Message 3',
]);
```

- `messages`: Array of message strings
- Returns: `Promise<void>`

##### `testConnection()`

Test if the server is reachable.

```javascript
const isConnected = await driver.testConnection();
console.log(isConnected); // true or false
```

- Returns: `Promise<boolean>`

##### `getConfig()`

Get the current driver configuration.

```javascript
const config = driver.getConfig();
console.log(config.getAddress()); // "127.0.0.1:49152"
```

- Returns: `DriverConfig` object

##### `isInitialized()`

Check if the driver is initialized.

```javascript
if (driver.isInitialized()) {
    // Driver is ready
}
```

- Returns: `boolean`

#### Static Methods

##### `Driver.create()`

Create a driver with default configuration.

```javascript
const driver = Driver.create();
```

##### `Driver.fromAddress(address)`

Create a driver from an address string.

```javascript
const driver = Driver.fromAddress('127.0.0.1:49152');
```

- `address`: String in format `"host:port"`

##### `Driver.withConfig(config)`

Create a driver with full configuration.

```javascript
const driver = Driver.withConfig({
    protocol: ProtocolType.TCP,
    host: '127.0.0.1',
    port: 49152,
});
```

### DriverConfig Class

#### Methods

##### `getAddress()`

Get the full address string.

```javascript
const address = config.getAddress(); // "127.0.0.1:49152"
```

#### Static Methods

##### `DriverConfig.fromAddress(address)`

Create config from address string.

```javascript
const config = DriverConfig.fromAddress('127.0.0.1:49152');
```

## Architecture

The driver follows a similar architecture to the Rust server:

```
Driver
    ↓
ProtocolFactory.create(ProtocolType)
    ↓
TcpProtocol (or other protocol implementation)
    ↓
Node.js net.Socket
    ↓
Rust Server (127.0.0.1:49152)
```

## Protocol Implementation

### TCP Protocol

The TCP protocol uses Node.js built-in `net` module:

- Creates a socket connection for each message
- Sends message with newline terminator
- Automatically closes connection after sending
- Handles errors and timeouts

## Examples

See `example.js` for complete usage examples.

### Simple Message Sending

```javascript
import Driver from './src/driver.js';

const driver = Driver.create();
await driver.initialize();
await driver.send('Hello, World!');
```

### Batch Messages

```javascript
import Driver from './src/driver.js';

const driver = Driver.create();
await driver.initialize();

await driver.sendBatch([
    'PING',
    'GET /status',
    'SET value=42',
]);
```

### Error Handling

```javascript
import Driver from './src/driver.js';

const driver = Driver.create();

try {
    await driver.send('Hello!');
} catch (error) {
    console.error('Failed to send:', error.message);
}
```

### Connection Testing

```javascript
import Driver from './src/driver.js';

const driver = Driver.create();
const isConnected = await driver.testConnection();

if (isConnected) {
    console.log('Server is reachable!');
    await driver.send('Hello!');
} else {
    console.log('Server is not reachable. Make sure Rust server is running.');
}
```

## Adding New Protocols

To add a new protocol (e.g., UDP):

1. **Implement the protocol class**:
   ```javascript
   // src/protocols/udp.js
   export class UdpProtocol {
       constructor(config) {
           this.config = config;
       }
       
       async send(message) {
           // UDP implementation
       }
       
       getProtocolName() {
           return 'UDP';
       }
   }
   ```

2. **Add to ProtocolType**:
   ```javascript
   // src/config.js
   export const ProtocolType = {
       TCP: 'TCP',
       UDP: 'UDP',
   };
   ```

3. **Update ProtocolFactory**:
   ```javascript
   // src/protocol-factory.js
   import { UdpProtocol } from './protocols/udp.js';
   
   switch (protocolType) {
       case ProtocolType.TCP:
           return new TcpProtocol(config);
       case ProtocolType.UDP:
           return new UdpProtocol(config);
   }
   ```

## Requirements

- Node.js 14+ (for ES modules support)
- Rust Samples server running and accessible

## Default Configuration

- **Protocol**: TCP
- **Host**: `127.0.0.1`
- **Port**: `49152`

These match the restor-octo-giggle Rust server's default configuration.

## Troubleshooting

### Connection Refused

If you get connection errors:
1. Ensure the Rust server is running
2. Check the server address and port match
3. Verify firewall settings allow connections

### Timeout Errors

If messages timeout:
1. Check network connectivity
2. Verify server is listening on the correct address
3. Increase timeout in protocol implementation if needed

## License

MIT
