		/** @type {SerialPort|null} */
		let port = null

		const textEncoder = new TextEncoder()
		const textDecoder = new TextDecoder()
		/** @type {ReadableStream<Uint8Array>|null} */
		let reader = null
		/** @type {WritableStream<Uint8Array>|null} */
		let writer = null

		let isConnected = false,
			serialCommunicationBox = document.getElementById(
				"serial-communication-box"
			),
			connectionButton = document.getElementById("connection-button"),
			sendInput = document.getElementById("send-input"),
			sendButton = document.getElementById("send-button"),
			sendLog = document.getElementById("send-log"),
			eventLog = document.getElementById("event-log"),
			classSuccessBg = "bg-green-400",
			classSuccessText = "text-green-500",
			classInfoBg = "bg-sky-400",
			classInfoText = "text-sky-500",
			classErrorBg = "bg-red-400",
			classErrorText = "text-red-500,",
			classDefaultBg = "bg-slate-300",
			classDefaultText = "text-slate-500"

		// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
		// Function to set status indicator an write log for given id
		// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
		let setStatusIndicator = (id, status, log, reset = true) => {
			let indicator = document.getElementById(id)
			let ledElement = indicator.children[0]
			let logElement = indicator.children[2]

			if (reset) {
				ledElement.classList.remove(classSuccessBg)
				ledElement.classList.remove(classInfoBg)
				ledElement.classList.remove(classErrorBg)
				ledElement.classList.add(classDefaultBg)
			}

			switch (status) {
				case "success":
					ledElement.classList.remove(classDefaultBg)
					ledElement.classList.add(classSuccessBg)
					logElement.textContent = log || "Success"
					break
				case "info":
					ledElement.classList.remove(classDefaultBg)
					ledElement.classList.add(classInfoBg)
					logElement.textContent = log || "Warning"
					break
				case "warning":
					ledElement.classList.remove(classDefaultBg)
					ledElement.classList.add(classDefaultBg)
					logElement.textContent = log || "Warning"
					break
				case "error":
					ledElement.classList.remove(classDefaultBg)
					ledElement.classList.add(classErrorBg)
					logElement.textContent = log || "Error"
					break
				default:
					ledElement.classList.add(classDefaultBg)
					logElement.textContent = log || "Unknown"
					break
			}
		}

		/**
		 * Connect to serial device
		 *
		 * @throws {DOMException} - Error message
		 * @return void
		 **/
		async function serialConnect() {
			try {
				port = await navigator.serial.requestPort()
				await port.open({
					baudRate: 115200,
					parity: "none",
					stopBits: 1,
					flowControl: "none",
				})
				setStatusIndicator(
					"connection-indicator",
					"success",
					"Connected"
				)
				setStatusIndicator(
					"port-indicator",
					"success",
					"Port opened"
				)
				setStatusIndicator(
					"readable-indicator",
					"success",
					"Readable"
				)
				setStatusIndicator(
					"writeable-indicator",
					"success",
					"Writeable"
				)
				sendButton.disabled = false
				connectionButton.textContent = "Disconnect"
				isConnected = true

				// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
				// Event listener for serial connection (not working)
				// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
				// port.addEventListener("connect", (e) => {
				//     eventLog.textContent +=
				//         "Connected to " +
				//         e.target.getInfo().usbProductId +
				//         "\n"
				// })

				// port.serial.addEventListener("disconnect", (e) => {
				//     eventLog.textContent +=
				//         "Disconnected from " +
				//         e.target.getInfo().usbProductId +
				//         "\n"
				// })

				reader = port.readable.getReader()
				writer = port.writable.getWriter()
			} catch (e) {
				setStatusIndicator(
					"connection-indicator",
					"error",
					e.message
				)
				console.error(e)
			}
		}

		/**
		 * Disconnect from serial device
		 **/
		async function serialDisconnect() {
			if (port) {
				try {
					// kill read and write stream
					if (reader) {
						await reader.cancel()
						await reader.releaseLock()
					}
					if (writer) {
						await writer.abort()
						await writer.releaseLock()
					}

					await port.close()
					port = null

					setStatusIndicator(
						"connection-indicator",
						"info",
						"Disconnected"
					)
					setStatusIndicator(
						"port-indicator",
						null,
						"Port closed"
					)
					setStatusIndicator(
						"readable-indicator",
						null,
						"Not readable"
					)
					setStatusIndicator(
						"writeable-indicator",
						null,
						"Not writeable"
					)
					setStatusIndicator("written-indicator", null, "…")
					sendButton.disabled = true
					connectionButton.textContent = "Connect"
					isConnected = false
				} catch (e) {
					setStatusIndicator(
						"connection-indicator",
						"error",
						e.message
					)
					setStatusIndicator("port-indicator", null, "…")
					setStatusIndicator("readable-indicator", null, "…")
					setStatusIndicator("writeable-indicator", null, "…")
					setStatusIndicator("written-indicator", null, "…")
					console.error(e)
				}
			}
		}

		/**
		 * Read data from serial device
		 *
		 * @throws {DOMException} - Error message
		 * @return void
		 **/
		async function serialRead() {
			try {
				while (true) {
					const {value, done} = await reader.read()
					const decoded = textDecoder.decode(value)

					sendLog.textContent += decoded

					if (done) break
				}
			} catch (err) {
				const errorMessage = `error reading data: ${err}`
				console.error(errorMessage)
				sendLog.textContent += errorMessage + "\n"
				setStatusIndicator("written-indicator", "error")
			}
		}

		/**
		 * Write data to serial device
		 *
		 * @param {string} data - Data to write to the serial device
		 * @throws {DOMException} - Error message
		 * @return void
		 **/
		async function serialWrite(data) {
			try {
				await writer.write(textEncoder.encode(data + "\n"))
				console.log("Write: " + data)
				sendLog.textContent += `Write: ${data} \n`
				setStatusIndicator("written-indicator", "success")
			} catch (err) {
				const errorMessage = `Error writing data: ${err}`
				console.error(errorMessage)
				sendLog.textContent += errorMessage + "\n"
				setStatusIndicator(
					"written-indicator",
					"error",
					"Error writing data: " + err
				)
			}
		}

		// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
		// Connect to serial device and save status to the indicator
		// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
		connectionButton.addEventListener("click", async () => {
			if ("serial" in navigator) {
				isConnected ? serialDisconnect() : serialConnect()
			} else {
				setStatusIndicator(
					"connection-indicator",
					"error",
					"Your browser does not support the Web Serial API."
				)
			}
		})

		// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
		// Send data to the serial device
		// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
		sendButton.addEventListener("click", async () => {
			await serialWrite(sendInput.value)
			await serialRead()
		})

		navigator.serial.getPorts().then((ports) => {
			if (ports.length > 0) {
				eventLog.textContent +=
					"Connected to " +
					ports[0].getInfo().usbProductId +
					"\n"
			} else {
				eventLog.textContent += "No device connected\n"
			}
		});
