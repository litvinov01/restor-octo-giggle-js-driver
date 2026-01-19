import { ProtocolType } from './config.js';
import { TcpProtocol } from './protocols/index.js';

/**
 * Factory for creating protocol instances
 */
export class ProtocolFactory {
    /**
     * Create a protocol instance based on protocol type
     * @param {string} protocolType - Protocol type (from ProtocolType enum)
     * @param {DriverConfig} config - Driver configuration
     * @returns {object} Protocol instance
     */
    static create(protocolType, config) {
        switch (protocolType) {
            case ProtocolType.TCP:
                return new TcpProtocol(config);
            
            // Future protocols can be added here
            // case ProtocolType.UDP:
            //     return new UdpProtocol(config);
            
            default:
                throw new Error(`Unsupported protocol type: ${protocolType}`);
        }
    }

    /**
     * Get protocol name by type
     * @param {string} protocolType - Protocol type
     * @returns {string} Protocol name
     */
    static getProtocolName(protocolType) {
        return protocolType;
    }
}
