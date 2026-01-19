import net from 'net';


const TIMEOUT_MESSAGE = 'TCP connection timeout';

/**
 * TCP protocol implementation using Node.js built-in net module
 */
export class TcpProtocol {
    constructor(config) {
        this.config = config;
    }

    /**
     * Send a message to the server
     * @param {string} message - Message to send
     * @returns {Promise<void>}
     */
    async send(message) {
        return new Promise((resolve, reject) => {
            const client = new net.Socket();
            let resolved = false;

            // Set timeout
            client.setTimeout(5000);

            // Handle connection
            client.connect(this.config.port, this.config.host, () => {
                if (!resolved) {
                    // Send message with newline
                    const messageWithNewline = message.endsWith('\n') 
                        ? message 
                        : message + '\n';
                    
                    client.write(messageWithNewline, (err) => {
                        if (err) {
                            resolved = true;
                            client.destroy();
                            reject(new Error(`Failed to send message: ${err.message}`));
                        } else {
                            // Wait a bit for the message to be sent, then close
                            setTimeout(() => {
                                resolved = true;
                                client.destroy();
                                resolve();
                            }, 100);
                        }
                    });
                }
            });

            // Handle errors
            client.on('error', (err) => {
                if (!resolved) {
                    resolved = true;
                    reject(new Error(`TCP connection error: ${err.message}`));
                }
            });

            // Handle timeout
            client.on('timeout', () => {
                if (!resolved) {
                    resolved = true;
                    client.destroy();
                    reject(new Error(TIMEOUT_MESSAGE));
                }
            });

            // Handle close
            client.on('close', () => {
                // Connection closed, already handled
            });
        });
    }

    /**
     * Get protocol name
     */
    getProtocolName() {
        return 'TCP';
    }

    /**
     * Test connection to server
     * @returns {Promise<boolean>}
     */
    async testConnection() {
        return new Promise((resolve, reject) => {
            const client = new net.Socket();
            let resolved = false;

            client.setTimeout(2000);

            client.connect(this.config.port, this.config.host, () => {
                if (!resolved) {
                    resolved = true;
                    client.destroy();
                    resolve(true);
                }
            });

            client.on('error', (err) => {
                if (!resolved) {
                    resolved = true;
                    reject(err);
                }
            });

            client.on('timeout', () => {
                if (!resolved) {
                    resolved = true;
                    client.destroy();
                    reject(new Error(TIMEOUT_MESSAGE));
                }
            });
        });
    }
}
