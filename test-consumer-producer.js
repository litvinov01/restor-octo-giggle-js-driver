/**
 * Test script for consumer and producer integration
 * 
 * This script tests the JS driver (producer) sending messages
 * to the Rust transport server (consumer)
 * 
 * Usage:
 *   1. Start the Rust server: cd rust_samples && cargo run
 *   2. Run this script: node test-consumer-producer.js
 */

import Driver from './src/index.js';
import { ProtocolType } from './src/index.js';

const SERVER_ADDRESS = '127.0.0.1:49152';
const TEST_DELAY = 500; // ms between messages

/**
 * Test basic message sending
 */
async function testBasicMessage() {
    console.log('\n=== Test 1: Basic Message Sending ===');
    
    try {
        const driver = Driver.fromAddress(SERVER_ADDRESS);
        await driver.initialize();
        
        console.log('✓ Driver initialized');
        
        await driver.send('Hello from JS Driver!');
        console.log('✓ Message sent: "Hello from JS Driver!"');
        
        await new Promise(resolve => setTimeout(resolve, TEST_DELAY));
        
        return true;
    } catch (error) {
        console.error('✗ Test failed:', error.message);
        return false;
    }
}

/**
 * Test event-based message sending (JSON format)
 */
async function testEventMessage() {
    console.log('\n=== Test 2: Event-Based Message (JSON) ===');
    
    try {
        const driver = Driver.fromAddress(SERVER_ADDRESS);
        await driver.initialize();
        
        // Send JSON event message
        const eventMessage = JSON.stringify({
            msg: 'Test message from JS',
            event_name: 'test_event'
        });
        
        await driver.send(eventMessage);
        console.log('✓ Event message sent:', eventMessage);
        
        await new Promise(resolve => setTimeout(resolve, TEST_DELAY));
        
        return true;
    } catch (error) {
        console.error('✗ Test failed:', error.message);
        return false;
    }
}

/**
 * Test simple format message (event_name:message)
 */
async function testSimpleFormatMessage() {
    console.log('\n=== Test 3: Simple Format Message ===');
    
    try {
        const driver = Driver.fromAddress(SERVER_ADDRESS);
        await driver.initialize();
        
        // Send simple format: event_name:message
        await driver.send('user_login:User john_doe logged in');
        console.log('✓ Simple format message sent: "user_login:User john_doe logged in"');
        
        await new Promise(resolve => setTimeout(resolve, TEST_DELAY));
        
        return true;
    } catch (error) {
        console.error('✗ Test failed:', error.message);
        return false;
    }
}

/**
 * Test batch message sending
 */
async function testBatchMessages() {
    console.log('\n=== Test 4: Batch Message Sending ===');
    
    try {
        const driver = Driver.fromAddress(SERVER_ADDRESS);
        await driver.initialize();
        
        const messages = [
            'Batch message 1',
            'order_created:Order #12345 created',
            JSON.stringify({ msg: 'Batch JSON message', event_name: 'batch_test' }),
            'PING',
            'status_check:Check system status'
        ];
        
        await driver.sendBatch(messages);
        console.log(`✓ Batch of ${messages.length} messages sent`);
        
        await new Promise(resolve => setTimeout(resolve, TEST_DELAY));
        
        return true;
    } catch (error) {
        console.error('✗ Test failed:', error.message);
        return false;
    }
}

/**
 * Test connection before sending
 */
async function testConnection() {
    console.log('\n=== Test 5: Connection Test ===');
    
    try {
        const driver = Driver.fromAddress(SERVER_ADDRESS);
        await driver.initialize();
        
        const isConnected = await driver.testConnection();
        
        if (isConnected) {
            console.log('✓ Connection test passed');
            return true;
        } else {
            console.error('✗ Connection test failed');
            return false;
        }
    } catch (error) {
        console.error('✗ Connection test error:', error.message);
        return false;
    }
}

/**
 * Test error handling (invalid address)
 */
async function testErrorHandling() {
    console.log('\n=== Test 6: Error Handling ===');
    
    try {
        const driver = Driver.fromAddress('127.0.0.1:99999'); // Invalid port
        await driver.initialize();
        
        await driver.send('This should fail');
        console.error('✗ Expected error but message was sent');
        return false;
    } catch (error) {
        console.log('✓ Error handling works:', error.message);
        return true;
    }
}

/**
 * Test with different message types
 */
async function testMessageTypes() {
    console.log('\n=== Test 7: Different Message Types ===');
    
    try {
        const driver = Driver.fromAddress(SERVER_ADDRESS);
        await driver.initialize();
        
        const messages = [
            'Plain text message',
            '{"msg":"JSON message","event_name":"json_event"}',
            'event:message with colon',
            'multiline\nmessage\ntest',
            'special chars: !@#$%^&*()',
        ];
        
        for (const msg of messages) {
            await driver.send(msg);
            console.log(`✓ Sent: ${msg.substring(0, 50)}${msg.length > 50 ? '...' : ''}`);
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        return true;
    } catch (error) {
        console.error('✗ Test failed:', error.message);
        return false;
    }
}

/**
 * Main test runner
 */
async function runTests() {
    console.log('========================================');
    console.log('Consumer-Producer Integration Test');
    console.log('========================================');
    console.log(`\nTarget Server: ${SERVER_ADDRESS}`);
    console.log('Make sure the Rust server is running!\n');
    
    const results = [];
    
    // Run all tests
    results.push(await testConnection());
    results.push(await testBasicMessage());
    results.push(await testEventMessage());
    results.push(await testSimpleFormatMessage());
    results.push(await testBatchMessages());
    results.push(await testMessageTypes());
    results.push(await testErrorHandling());
    
    // Summary
    console.log('\n========================================');
    console.log('Test Summary');
    console.log('========================================');
    
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log(`Passed: ${passed}/${total}`);
    console.log(`Failed: ${total - passed}/${total}`);
    
    if (passed === total) {
        console.log('\n✅ All tests passed!');
        process.exit(0);
    } else {
        console.log('\n❌ Some tests failed');
        process.exit(1);
    }
}

// Handle errors
process.on('unhandledRejection', (error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
});

// Run tests
runTests().catch(console.error);
