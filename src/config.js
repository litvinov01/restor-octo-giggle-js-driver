/**
 * Protocol types supported by the driver
 */
export const ProtocolType = {
    TCP: 'TCP',
    // Future protocols can be added here
    // UDP: 'UDP',
    // WebSocket: 'WebSocket',
};

/**
 * Default configuration
 */
export const DEFAULT_CONFIG = {
    protocol: ProtocolType.TCP,
    host: '127.0.0.1',
    port: 49152,
};

/**
 * Server configuration class
 */
export class DriverConfig {
    constructor(config = {}) {
        this.protocol = config.protocol || DEFAULT_CONFIG.protocol;
        this.host = config.host || DEFAULT_CONFIG.host;
        this.port = config.port || DEFAULT_CONFIG.port;
    }

    /**
     * Get the full address string
     */
    getAddress() {
        return `${this.host}:${this.port}`;
    }

    /**
     * Create config from address string
     */
    static fromAddress(address) {
        const [host, port] = address.split(':');
        return new DriverConfig({
            host: host || DEFAULT_CONFIG.host,
            port: parseInt(port, 10) || DEFAULT_CONFIG.port,
        });
    }
}
