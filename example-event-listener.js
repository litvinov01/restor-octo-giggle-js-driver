/**
 * Example: Using Event Listener to consume specific event messages
 */

import Driver from './src/index.js';

async function main() {
    console.log('=== Event Listener Example ===\n');

    try {
        // Create driver for sending messages
        const producer = Driver.fromAddress('127.0.0.1:49152');
        await producer.initialize();
        console.log('✓ Producer initialized\n');

        // Create driver for listening to events
        const consumer = Driver.fromAddress('127.0.0.1:49152');
        await consumer.initialize();
        
        // Start event listener (listens on port 49153 by default)
        await consumer.startEventListener('127.0.0.1:49153');
        console.log('✓ Event listener started\n');

        // Register listeners for specific events
        console.log('Registering event listeners...\n');

        // Listen for user_login events
        consumer.on('user_login', (message, eventMessage) => {
            console.log(`[user_login] ${message}`);
            console.log(`  Full event: ${JSON.stringify(eventMessage)}\n`);
        });

        // Listen for order_created events
        consumer.on('order_created', (message, eventMessage) => {
            console.log(`[order_created] ${message}`);
            console.log(`  Full event: ${JSON.stringify(eventMessage)}\n`);
        });

        // Listen for all events (wildcard)
        consumer.on('*', (message, eventMessage) => {
            console.log(`[*] Event '${eventMessage.event_name}': ${message}`);
        });

        console.log('Event listeners registered. Waiting for events...\n');
        console.log('Subscribed events:', consumer.getEventListener().getSubscribedEvents());
        console.log('\nSending test messages...\n');

        // Wait a bit for listener to be ready
        await new Promise(resolve => setTimeout(resolve, 500));

        // Send some test messages
        await producer.send(JSON.stringify({
            msg: 'User john_doe logged in',
            event_name: 'user_login'
        }));

        await new Promise(resolve => setTimeout(resolve, 200));

        await producer.send(JSON.stringify({
            msg: 'Order #12345 created',
            event_name: 'order_created'
        }));

        await new Promise(resolve => setTimeout(resolve, 200));

        await producer.send('user_login:User jane_doe logged in');

        await new Promise(resolve => setTimeout(resolve, 200));

        await producer.send(JSON.stringify({
            msg: 'System status check',
            event_name: 'system_status'
        }));

        console.log('\nWaiting for more events (press Ctrl+C to exit)...\n');

        // Keep running
        process.on('SIGINT', () => {
            console.log('\n\nStopping event listener...');
            consumer.stopEventListener();
            process.exit(0);
        });

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main().catch(console.error);
