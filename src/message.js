/**
 * Event message parsing utilities
 */
export class EventMessage {
    /**
     * Parse from JSON string
     * @param {string} json - JSON string
     * @returns {EventMessage}
     */
    static fromJSON(json) {
        try {
            const obj = JSON.parse(json);
            return {
                msg: obj.msg || '',
                event_name: obj.event_name || 'default'
            };
        } catch (err) {
            throw new Error(`Invalid JSON format: ${err.message}`);
        }
    }

    /**
     * Parse from simple format: "event_name:message"
     * @param {string} text - Simple format string
     * @returns {EventMessage}
     */
    static fromSimpleFormat(text) {
        const parts = text.split(':');
        if (parts.length >= 2) {
            return {
                event_name: parts[0].trim(),
                msg: parts.slice(1).join(':').trim()
            };
        } else {
            return {
                event_name: 'default',
                msg: text.trim()
            };
        }
    }

    /**
     * Create event message
     * @param {string} msg - Message content
     * @param {string} eventName - Event name
     * @returns {string} JSON string
     */
    static create(msg, eventName = 'default') {
        return JSON.stringify({ msg, event_name: eventName });
    }
}
