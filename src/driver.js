import { DriverConfig, ProtocolType, DEFAULT_CONFIG } from './config.js';
import { ProtocolFactory } from './protocol-factory.js';
import { EventListener } from './event-listener.js';
import { RegistrationClient } from './registration-client.js';

/**
 * Driver class that encapsulates protocol and sends messages to the bus
 * Also supports event listening for consuming specific event messages
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
        this.eventListener = null;
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
     * Start listening for events
     * @param {string|object} listenerConfig - Listener config (address string or config object)
     * @param {object} registrationConfig - Registration config (optional)
     * @returns {Promise<EventListener>}
     */
    async startEventListener(listenerConfig = null, registrationConfig = null) {
        // If registration config provided, register as consumer first
        if (registrationConfig) {
            const regClient = new RegistrationClient(
                registrationConfig.registrationAddress || `${this.config.host}:49153`,
                registrationConfig.consumerAddress || `${this.config.host}:${this.config.port + 1}`
            );
            
            const consumerId = registrationConfig.consumerId || `js-consumer-${Date.now()}`;
            const events = registrationConfig.events || [];
            
            await regClient.register(consumerId, events);
            console.log(`[Driver] Registered as consumer '${consumerId}' for events:`, events);
        }

        // Setup listener
        if (!listenerConfig) {
            // Use same config as driver, but different port
            listenerConfig = {
                host: this.config.host,
                port: this.config.port + 1, // Default to port + 1 for listener
            };
        } else if (typeof listenerConfig === 'string') {
            // Parse address string
            const [host, port] = listenerConfig.split(':');
            listenerConfig = { host, port: parseInt(port) };
        }

        this.eventListener = new EventListener(listenerConfig);
        await this.eventListener.start();
        return this.eventListener;
    }

    /**
     * Stop event listener
     */
    stopEventListener() {
        if (this.eventListener) {
            this.eventListener.stop();
            this.eventListener = null;
        }
    }

    /**
     * Register event listener callback
     * @param {string} eventName - Event name to listen for ('*' for all events)
     * @param {Function} callback - Callback function (message, eventMessage) => void
     * @returns {Function} Unsubscribe function
     */
    on(eventName, callback) {
        if (!this.eventListener) {
            throw new Error('Event listener not started. Call startEventListener() first.');
        }
        return this.eventListener.on(eventName, callback);
    }

    /**
     * Remove event listener
     * @param {string} eventName - Event name
     * @param {Function} callback - Callback function
     */
    off(eventName, callback) {
        if (this.eventListener) {
            this.eventListener.off(eventName, callback);
        }
    }

    /**
     * Get event listener instance
     * @returns {EventListener|null}
     */
    getEventListener() {
        return this.eventListener;
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
