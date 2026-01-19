import Driver from './src/index.js';
import { ProtocolType } from './src/index.js';

/**
 * Example usage of the restor-octo-giggle Driver library
 */

async function main() {
    console.log('=== restor-octo-giggle Driver Example ===\n');

    try {
        // Example 1: Use default configuration
        console.log('Example 1: Default configuration');
        const driver1 = Driver.create();
        await driver1.initialize();
        
        const connectionTest1 = await driver1.testConnection();
        console.log(`Connection test: ${connectionTest1 ? 'SUCCESS' : 'FAILED'}\n`);

        if (connectionTest1) {
            await driver1.send('Hello from default driver!');
            console.log('Message sent successfully\n');
        }

        // Example 2: Custom address
        console.log('Example 2: Custom address');
        const driver2 = Driver.fromAddress('127.0.0.1:49152');
        await driver2.initialize();
        
        await driver2.send('Hello from custom address driver!');
        console.log('Message sent successfully\n');

        // Example 3: Full configuration
        console.log('Example 3: Full configuration');
        const driver3 = Driver.withConfig({
            protocol: ProtocolType.TCP,
            host: '127.0.0.1',
            port: 49152,
        });
        await driver3.initialize();
        
        await driver3.send('Hello from full config driver!');
        console.log('Message sent successfully\n');

        // Example 4: Send multiple messages
        console.log('Example 4: Sending batch of messages');
        const driver4 = Driver.create();
        await driver4.initialize();
        
        await driver4.sendBatch([
            'Message 1',
            'Message 2',
            'Message 3',
            'PING',
            'GET /status',
        ]);
        console.log('Batch sent successfully\n');

        // Example 5: Error handling
        console.log('Example 5: Error handling');
        try {
            const driver5 = Driver.fromAddress('127.0.0.1:99999');
            await driver5.send('This will fail');
        } catch (error) {
            console.log(`Expected error caught: ${error.message}\n`);
        }

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }

    console.log('All examples completed!');
}

// Run the example
main().catch(console.error);
