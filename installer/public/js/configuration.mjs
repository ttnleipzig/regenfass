import initScp, { LineType } from "./scp.js";
import { RegenfassSerial } from './serial.mjs'
import { UI } from './ui.js'
import {
	buttonConfigurationConnect,
	buttonConfiguration,
	configurationForm,
	credentialsAppkey,
	credentialsDeveui,
	credentialsJoineui,
	scp
} from './utils.js'

let isConnected = false

/**
 * encode form data
 */
function encodeFormData() {
	let data = [
		scp.lineToString({ type: LineType.SET, key: 'devEUI', value: credentialsDeveui.value }),
		scp.lineToString({ type: LineType.SET, key: 'joinEUI', value: credentialsJoineui.value }),
		scp.lineToString({ type: LineType.SET, key: 'appKey', value: credentialsAppkey.value })
	]

	return data.join('\n')
}

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// Connect to serial device and save status to the indicator
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
buttonConfigurationConnect.addEventListener('click', async () => {
	if (!('serial' in navigator)) {
		UI.setStatusIndicator(
			'connection-indicator',
			'error',
			'Your browser does not support the Web Serial API.'
		)
		return;
	}

	if (isConnected) {
		try {
			isConnected = await RegenfassSerial.disconnect()
			UI.setStatusIndicator(
				'connection-indicator',
				'info',
				'Disconnected'
			)
			UI.setStatusIndicator(
				'port-indicator',
				null,
				'Port closed'
			)
			UI.setStatusIndicator(
				'readable-indicator',
				null,
				'Not readable'
			)
			UI.setStatusIndicator(
				'writeable-indicator',
				null,
				'Not writeable'
			)
			UI.setStatusIndicator('written-indicator', null, '…')
		} catch (error) {
			UI.setStatusIndicator(
				'connection-indicator',
				'error',
				error.message
			)
			UI.writeLog(error.message)
		}
	}
	else {
		try {
			isConnected = await RegenfassSerial.connect()
			UI.setStatusIndicator(
				'connection-indicator',
				'success',
				'Connected'
			)
			UI.setStatusIndicator(
				'port-indicator',
				'success',
				'Port opened'
			)
			UI.setStatusIndicator(
				'readable-indicator',
				'success',
				'Readable'
			)
			UI.setStatusIndicator(
				'writeable-indicator',
				'success',
				'Writeable'
			)

			RegenfassSerial.read();
		} catch (error) {
			UI.setStatusIndicator(
				'connection-indicator',
				'error',
				error.message
			)
			UI.writeLog(error.message)
		}
	}
})

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// Send data to the serial device
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
buttonConfiguration.addEventListener('click', async function () {
	setCustomValidity('#credentials-deveui', 'DevEUI')
	setCustomValidity('#credentials-joineui', 'JoinEUI')
	setCustomValidity('#credentials-appkey', 'AppKey')
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
		inputField.setCustomValidity('') // Remove the custom message if valid
	}
}

// :::::: Check for serial port on load :::::
if ('serial' in navigator) {
	navigator.serial.getPorts().then((ports) => {
		if (ports.length > 0) {
			UI.writeEventLog('Connection',
				'Connected to ' +
				ports[0].getInfo().usbProductId)
		} else {
			UI.writeEventLog('Connection', 'No device connected')
		}
	})
}

configurationForm.addEventListener('submit', async () => {
	let data = encodeFormData()
	UI.setStatusIndicator('written-indicator', 'info', 'Sending data …')
	const response = await RegenfassSerial.write(data)
	console.log(response)
	UI.writeEventLog('Data received', response)
	UI.setStatusIndicator('written-indicator', 'success', 'Data sent')
})
