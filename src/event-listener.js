import net from 'net';
import { EventMessage } from './message.js';

/**
 * Note: The event listener connects to a TCP server that sends messages.
 * For the JS driver to receive messages, you need to:
 * 1. Register as a consumer via the registration server (port 49153)
 * 2. The Rust server will forward messages to registered consumers
 * 3. This listener connects to your registered consumer endpoint
 */

/**
 * Event listener for consuming specific event messages from the server
 */
export class EventListener {
    constructor(config) {
        this.config = config;
        this.socket = null;
        this.listeners = new Map(); // event_name -> Set of callbacks
        this.isListening = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    /**
     * Start listening for events
     * @returns {Promise<void>}
     */
    async start() {
        if (this.isListening) {
            return;
        }

        return new Promise((resolve, reject) => {
            this.socket = new net.Socket();
            let resolved = false;

            this.socket.setTimeout(0); // No timeout for persistent connection

            // Handle connection
            this.socket.connect(this.config.port, this.config.host, () => {
                if (!resolved) {
                    resolved = true;
                    this.isListening = true;
                    this.reconnectAttempts = 0;
                    console.log(`[EventListener] Connected to ${this.config.host}:${this.config.port}`);
                    resolve();
                }
            });

            // Handle incoming data
            this.socket.on('data', (data) => {
                this.handleMessage(data.toString());
            });

            // Handle errors
            this.socket.on('error', (err) => {
                if (!resolved) {
                    resolved = true;
                    reject(new Error(`Connection error: ${err.message}`));
                } else {
                    console.error(`[EventListener] Error: ${err.message}`);
                    this.handleReconnect();
                }
            });

            // Handle close
            this.socket.on('close', () => {
                console.log('[EventListener] Connection closed');
                this.isListening = false;
                this.handleReconnect();
            });

            // Handle timeout
            this.socket.on('timeout', () => {
                console.log('[EventListener] Connection timeout');
                this.socket.destroy();
            });
        });
    }

    /**
     * Stop listening for events
     */
    stop() {
        if (this.socket) {
            this.socket.destroy();
            this.socket = null;
        }
        this.isListening = false;
        this.listeners.clear();
    }

    /**
     * Register a listener for a specific event
     * @param {string} eventName - Event name to listen for
     * @param {Function} callback - Callback function (message) => void
     * @returns {Function} Unsubscribe function
     */
    on(eventName, callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }

        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }

        this.listeners.get(eventName).add(callback);

        // Return unsubscribe function
        return () => this.off(eventName, callback);
    }

    /**
     * Remove a listener for a specific event
     * @param {string} eventName - Event name
     * @param {Function} callback - Callback function to remove
     */
    off(eventName, callback) {
        if (this.listeners.has(eventName)) {
            this.listeners.get(eventName).delete(callback);
            if (this.listeners.get(eventName).size === 0) {
                this.listeners.delete(eventName);
            }
        }
    }

    /**
     * Remove all listeners for an event
     * @param {string} eventName - Event name (optional, removes all if not provided)
     */
    removeAllListeners(eventName) {
        if (eventName) {
            this.listeners.delete(eventName);
        } else {
            this.listeners.clear();
        }
    }

    /**
     * Get list of subscribed events
     * @returns {string[]}
     */
    getSubscribedEvents() {
        return Array.from(this.listeners.keys());
    }

    /**
     * Handle incoming message
     * @param {string} data - Raw message data
     */
    handleMessage(data) {
        const lines = data.split('\n').filter(line => line.trim().length > 0);
        
        for (const line of lines) {
            try {
                // Try to parse as EventMessage
                let eventMessage;
                try {
                    eventMessage = EventMessage.fromJSON(line);
                } catch {
                    // Try simple format
                    eventMessage = EventMessage.fromSimpleFormat(line);
                }

                // Notify listeners for this event
                if (this.listeners.has(eventMessage.event_name)) {
                    const callbacks = this.listeners.get(eventMessage.event_name);
                    for (const callback of callbacks) {
                        try {
                            callback(eventMessage.msg, eventMessage);
                        } catch (err) {
                            console.error(`[EventListener] Error in callback for event '${eventMessage.event_name}':`, err);
                        }
                    }
                }

                // Also notify 'all' listeners if any
                if (this.listeners.has('*')) {
                    const callbacks = this.listeners.get('*');
                    for (const callback of callbacks) {
                        try {
                            callback(eventMessage.msg, eventMessage);
                        } catch (err) {
                            console.error('[EventListener] Error in wildcard callback:', err);
                        }
                    }
                }
            } catch (err) {
                console.error('[EventListener] Error parsing message:', err);
            }
        }
    }

    /**
     * Handle reconnection
     */
    async handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[EventListener] Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * this.reconnectAttempts;

        console.log(`[EventListener] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

        setTimeout(async () => {
            try {
                await this.start();
            } catch (err) {
                console.error('[EventListener] Reconnection failed:', err);
            }
        }, delay);
    }

    /**
     * Check if currently listening
     * @returns {boolean}
     */
    isActive() {
        return this.isListening && this.socket && !this.socket.destroyed;
    }
}
