import net from 'net';

/**
 * Client for registering as a consumer with the registration server
 */
export class RegistrationClient {
    constructor(registrationAddress, consumerAddress) {
        const [host, port] = registrationAddress.split(':');
        this.registrationHost = host;
        this.registrationPort = parseInt(port);
        
        const [consumerHost, consumerPort] = consumerAddress.split(':');
        this.consumerHost = consumerHost;
        this.consumerPort = parseInt(consumerPort);
    }

    /**
     * Register as a consumer
     * @param {string} consumerId - Unique consumer ID
     * @param {string[]} events - Events to subscribe to
     * @returns {Promise<string>} Consumer address to listen on
     */
    async register(consumerId, events = []) {
        return new Promise((resolve, reject) => {
            const client = new net.Socket();
            let resolved = false;
            let responseData = '';

            client.setTimeout(5000);

            client.connect(this.registrationPort, this.registrationHost, () => {
                // Read welcome message
                client.on('data', (data) => {
                    responseData += data.toString();
                    
                    if (responseData.includes('REGISTRATION_SERVER')) {
                        // Send registration command
                        const eventsStr = events.length > 0 ? ' ' + events.join(' ') : '';
                        const command = `REGISTER ${consumerId} tcp://${this.consumerHost}:${this.consumerPort}${eventsStr}\n`;
                        client.write(command);
                    } else if (responseData.includes('OK:') || responseData.includes('ERROR:')) {
                        // Parse response
                        const lines = responseData.split('\n');
                        for (const line of lines) {
                            if (line.startsWith('OK:')) {
                                resolved = true;
                                client.destroy();
                                resolve(`${this.consumerHost}:${this.consumerPort}`);
                                return;
                            } else if (line.startsWith('ERROR:')) {
                                resolved = true;
                                client.destroy();
                                reject(new Error(line.substring(6)));
                                return;
                            }
                        }
                    }
                });
            });

            client.on('error', (err) => {
                if (!resolved) {
                    resolved = true;
                    reject(new Error(`Registration error: ${err.message}`));
                }
            });

            client.on('timeout', () => {
                if (!resolved) {
                    resolved = true;
                    client.destroy();
                    reject(new Error('Registration timeout'));
                }
            });
        });
    }

    /**
     * Subscribe to additional events
     * @param {string} consumerId - Consumer ID
     * @param {string} eventName - Event name
     * @returns {Promise<void>}
     */
    async subscribe(consumerId, eventName) {
        return this.sendCommand(`SUBSCRIBE ${consumerId} ${eventName}`);
    }

    /**
     * Unsubscribe from an event
     * @param {string} consumerId - Consumer ID
     * @param {string} eventName - Event name
     * @returns {Promise<void>}
     */
    async unsubscribe(consumerId, eventName) {
        return this.sendCommand(`UNSUBSCRIBE ${consumerId} ${eventName}`);
    }

    /**
     * Send a command to registration server
     * @private
     */
    async sendCommand(command) {
        return new Promise((resolve, reject) => {
            const client = new net.Socket();
            let resolved = false;
            let responseData = '';

            client.setTimeout(5000);

            client.connect(this.registrationPort, this.registrationHost, () => {
                client.on('data', (data) => {
                    responseData += data.toString();
                    
                    if (responseData.includes('REGISTRATION_SERVER')) {
                        client.write(command + '\n');
                    } else if (responseData.includes('OK:') || responseData.includes('ERROR:')) {
                        const lines = responseData.split('\n');
                        for (const line of lines) {
                            if (line.startsWith('OK:')) {
                                resolved = true;
                                client.destroy();
                                resolve();
                                return;
                            } else if (line.startsWith('ERROR:')) {
                                resolved = true;
                                client.destroy();
                                reject(new Error(line.substring(6)));
                                return;
                            }
                        }
                    }
                });
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
                    reject(new Error('Command timeout'));
                }
            });
        });
    }
}
