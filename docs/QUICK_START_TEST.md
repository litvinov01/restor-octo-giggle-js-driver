# Quick Start: Testing Consumer & Producer

## 🚀 Quick Test (2 Steps)

### Step 1: Start Rust Consumer Server

```bash
cd rust_samples
cargo run --bin test_consumer_server
```

**Expected output:**
```
==========================================
Test Consumer Server
==========================================

Starting test consumer server...
Initializing transport server...
Address: 0.0.0.0:49152
Transport server started successfully!
...
```

### Step 2: Run JS Driver Tests

**In a new terminal:**
```bash
cd drivers/js
npm test
# or
node test-consumer-producer.js
```

**Expected output:**
```
========================================
Consumer-Producer Integration Test
========================================

=== Test 1: Basic Message Sending ===
✓ Driver initialized
✓ Message sent: "Hello from JS Driver!"

=== Test 2: Event-Based Message (JSON) ===
✓ Event message sent: {"msg":"Test message from JS","event_name":"test_event"}

...

✅ All tests passed!
```

## 📋 What Gets Tested

1. ✅ **Connection Test** - Verifies JS driver can connect to Rust server
2. ✅ **Basic Messages** - Simple text message sending
3. ✅ **JSON Event Messages** - Structured event routing
4. ✅ **Simple Format** - `event_name:message` format
5. ✅ **Batch Messages** - Multiple messages at once
6. ✅ **Message Types** - Various formats and edge cases
7. ✅ **Error Handling** - Invalid connections

## 🔍 What to Watch

### Rust Server Console
You should see messages being received:
```
[Message Consumer] Received: Hello from JS Driver!
[Event Router] Event: 'default', Message: 'Hello from JS Driver!'
Processing message: Hello from JS Driver!

[Message Consumer] Received: {"msg":"Test message from JS","event_name":"test_event"}
[Event Router] Event: 'test_event', Message: 'Test message from JS'
...
```

### JS Driver Console
You should see successful sends:
```
✓ Message sent: "Hello from JS Driver!"
✓ Event message sent: {"msg":"Test message from JS","event_name":"test_event"}
...
```

## 🛠️ Troubleshooting

### "Connection Refused"
- ✅ Make sure Rust server is running first
- ✅ Check server is on `0.0.0.0:49152` (or adjust JS driver address)

### "Port Already in Use"
- ✅ Use different port: `set TRANSPORT_ADDRESS=0.0.0.0:49153`
- ✅ Find and stop process using port

### Messages Not Appearing
- ✅ Check both consoles for errors
- ✅ Verify network connectivity
- ✅ Ensure firewall isn't blocking

## 📚 More Info

See `README_TESTING.md` for detailed documentation.
