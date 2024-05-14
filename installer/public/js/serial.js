import {
	sendButton,
	sendLog,
	connectionButton,
} from './selectors.js'
export class RegenfassSerial {

	static port

	/** @type {ReadableStream<Uint8Array>|null} */
	static reader = null

	/** @type {WritableStream<Uint8Array>|null} */
	static writer = null

	/** @type {TextDecoder} */
	static textEncoder = new TextEncoder()

	/** @type {TextDecoder} */
	static textDecoder = new TextDecoder()


	/**
	 * Connect to serial device
	 *
	 * @throws {DOMException} - Error message
	 * @return void
	 **/
	static async connect() {
		this.port = await navigator.serial.requestPort()
		await this.port.open({
			baudRate: 115200,
			parity: "none",
			stopBits: 1,
			flowControl: "none",
		})
		sendButton.disabled = false
		connectionButton.textContent = "Disconnect"

		this.reader = this.port.readable.getReader()
		this.writer = this.port.writable.getWriter()

		return true
	}

	/**
	 * Disconnect from serial device
	 **/
	static async disconnect() {
		if (this.port) {
			// Kill read and write stream
			if (this.reader) {
				await this.reader.cancel()
				await this.reader.releaseLock()
			}
			if (this.writer) {
				await this.writer.abort()
				await this.writer.releaseLock()
			}

			await this.port.close()
			this.port = null

			sendButton.disabled = true
			connectionButton.textContent = "Connect"
			return false
		}
	}

	/**
	 * Read data from serial device
	 *
	 * @throws {DOMException} - Error message
	 * @return void
	 **/
	static async read() {
		try {
			while (true) {
				const {value, done} = await this.reader.read()
				const decoded = this.textDecoder.decode(value)

				sendLog.textContent += decoded

				if (done) break
			}
		} catch (err) {
			const errorMessage = `error reading data: ${err}`
			console.error(errorMessage)
			sendLog.textContent += errorMessage + "\n"
			/*
			setStatusIndicator("written-indicator", "error")
			*/
		}
	}

	/**
	 * Write data to serial device
	 *
	 * @param {string} data - Data to write to the serial device
	 * @throws {DOMException} - Error message
	 * @return void
	 **/
	static async write(data) {
		try {
			await this.writer.write(this.textEncoder.encode(data + "\n"))
			console.log("Write: " + data)
			sendLog.textContent += `Write: ${data} \n`
			// setStatusIndicator("written-indicator", "success")
		} catch (err) {
			const errorMessage = `Error writing data: ${err}`
			console.error(errorMessage)
			sendLog.textContent += errorMessage + "\n"
			/*
			setStatusIndicator(
				"written-indicator",
				"error",
				"Error writing data: " + err
			)
			*/
		}
	}

}
