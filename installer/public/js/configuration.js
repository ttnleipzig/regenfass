import {Type, Line} from './line.js'
import {RegenfassSerial} from './serial.js'
import { UI } from './ui.js'

import {
	sendButton,
	connectionButton,
	credentialsAppkey,
	credentialsDeveui,
	credentialsJoineui,
	eventLog,
} from './selectors.js'

let isConnected = false

/**
 * encode form data
 */
async function encodeFormData() {
	let data = [
		new Line(Type.SET, ["deveui", credentialsDeveui.value]),
		new Line(Type.SET, ["joineui", credentialsJoineui.value]),
		new Line(Type.SET, ["appkey", credentialsAppkey.value])
	]

	return data.join("\n")
}

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// Connect to serial device and save status to the indicator
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
connectionButton.addEventListener("click", async () => {
	if ("serial" in navigator) {
		if (isConnected) {
			try {
				isConnected = await RegenfassSerial.disconnect()
				UI.setStatusIndicator(
					"connection-indicator",
					"info",
					"Disconnected"
				)
				UI.setStatusIndicator(
					"port-indicator",
					null,
					"Port closed"
				)
				UI.setStatusIndicator(
					"readable-indicator",
					null,
					"Not readable"
				)
				UI.setStatusIndicator(
					"writeable-indicator",
					null,
					"Not writeable"
				)
				UI.setStatusIndicator("written-indicator", null, "…")
			} catch (error) {
				UI.setStatusIndicator(
					"connection-indicator",
					"error",
					error.message
				)
			}
		}
		else {
			try {
				isConnected = await RegenfassSerial.connect()
				UI.setStatusIndicator(
					"connection-indicator",
					"success",
					"Connected"
				)
				UI.setStatusIndicator(
					"port-indicator",
					"success",
					"Port opened"
				)
				UI.setStatusIndicator(
					"readable-indicator",
					"success",
					"Readable"
				)
				UI.setStatusIndicator(
					"writeable-indicator",
					"success",
					"Writeable"
				)
			} catch (error) {
				UI.setStatusIndicator(
					"connection-indicator",
					"error",
					error.message
				)
			}
		}
	} else {
		UI.setStatusIndicator(
			"connection-indicator",
			"error",
			"Your browser does not support the Web Serial API."
		)
	}
})

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// Send data to the serial device
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
sendButton.addEventListener("click", async function (event) {
	setCustomValidity("#credentials-deveui", "DevEUI")
	setCustomValidity("#credentials-joineui", "JoinEUI")
	setCustomValidity("#credentials-appkey", "AppKey")
})

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// Method to set custom html validation error messages
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
function setCustomValidity(inputId, name) {
	const inputField = document.querySelector(inputId)
	if (inputField.validity.valueMissing) {
		inputField.setCustomValidity(`Pleas enter a value for ${name}.`)
	} else if (inputField.validity.patternMismatch) {
		inputField.setCustomValidity(`Please use the valid format for ${name}.`)
	} else {
		inputField.setCustomValidity("") // Remove the custom message if valid
	}
}

// :::::: Check for serial port on load :::::
navigator.serial.getPorts().then((ports) => {
	if (ports.length > 0) {
		eventLog.textContent +=
			"Connected to " +
			ports[0].getInfo().usbProductId +
			"\n"
	} else {
		eventLog.textContent += "No device connected\n"
	}
})

document.getElementById("form-configuration").addEventListener("submit", async (e) => {
	let data = encodeFormData()
	UI.setStatusIndicator("written-indicator", "info", "Sending data …")
	const response = await RegenfassSerial.write(data)
	console.log(response)
	UI.setStatusIndicator("written-indicator", "success", "Data sent")
})
