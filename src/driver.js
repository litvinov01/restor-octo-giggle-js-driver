import { DriverConfig, ProtocolType, DEFAULT_CONFIG } from './config.js';
import { ProtocolFactory } from './protocol-factory.js';

/**
 * Driver class that encapsulates protocol and sends messages to the bus
 */
export class Driver {
    /**
     * Create a new driver instance
     * @param {DriverConfig|object} config - Driver configuration
     */
    constructor(config = {}) {
        // Convert plain object to DriverConfig if needed
        if (!(config instanceof DriverConfig)) {
            config = new DriverConfig(config);
        }
        
        this.config = config;
        this.protocol = null;
        this._initialized = false;
    }

    /**
     * Initialize the driver with the configured protocol
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this._initialized) {
            return;
        }

        try {
            this.protocol = ProtocolFactory.create(this.config.protocol, this.config);
            this._initialized = true;
            console.log(`Driver initialized with ${this.config.protocol} protocol`);
            console.log(`Target address: ${this.config.getAddress()}`);
        } catch (error) {
            throw new Error(`Failed to initialize driver: ${error.message}`);
        }
    }

    /**
     * Send a message to the bus
     * @param {string} message - Message to send
     * @returns {Promise<void>}
     */
    async send(message) {
        if (!this._initialized) {
            await this.initialize();
        }

        if (!message || typeof message !== 'string') {
            throw new Error('Message must be a non-empty string');
        }

        try {
            await this.protocol.send(message);
        } catch (error) {
            throw new Error(`Failed to send message: ${error.message}`);
        }
    }

    /**
     * Send multiple messages sequentially
     * @param {string[]} messages - Array of messages to send
     * @returns {Promise<void>}
     */
    async sendBatch(messages) {
        if (!Array.isArray(messages)) {
            throw new Error('Messages must be an array');
        }

        for (const message of messages) {
            await this.send(message);
            // Small delay between messages
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    /**
     * Test connection to the server
     * @returns {Promise<boolean>}
     */
    async testConnection() {
        if (!this._initialized) {
            await this.initialize();
        }

        return await this.protocol.testConnection();
    }

    /**
     * Get the current configuration
     * @returns {DriverConfig}
     */
    getConfig() {
        return this.config;
    }

    /**
     * Check if driver is initialized
     * @returns {boolean}
     */
    isInitialized() {
        return this._initialized;
    }

    /**
     * Create a driver with default configuration
     * @returns {Driver}
     */
    static create() {
        return new Driver(DEFAULT_CONFIG);
    }

    /**
     * Create a driver with custom address
     * @param {string} address - Address in format "host:port"
     * @returns {Driver}
     */
    static fromAddress(address) {
        const config = DriverConfig.fromAddress(address);
        return new Driver(config);
    }

    /**
     * Create a driver with full configuration
     * @param {object} config - Configuration object
     * @returns {Driver}
     */
    static withConfig(config) {
        return new Driver(config);
    }
}

// Export default for convenience
export default Driver;
