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
} from './selectors.js'

let isConnected = false

const scp = await initScp()
console.log('SCP initialized')

/**
 * encode form data
 */
function encodeFormData() {
	let data = [
		scp.lineToString({ type: LineType.SET, key: 'deveui', value: credentialsDeveui.value }),
		scp.lineToString({ type: LineType.SET, key: 'joineui', value: credentialsJoineui.value }),
		scp.lineToString({ type: LineType.SET, key: 'appkey', value: credentialsAppkey.value })
	]

	return data.join('\n')
}

// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// Connect to serial device and save status to the indicator
// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
buttonConfigurationConnect.addEventListener('click', async () => {
	console.log('Button clicked');

	if ('serial' in navigator) {
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
			} catch (error) {
				UI.setStatusIndicator(
					'connection-indicator',
					'error',
					error.message
				)
				UI.writeLog(error.message)
			}
		}
	} else {
		UI.setStatusIndicator(
			'connection-indicator',
			'error',
			'Your browser does not support the Web Serial API.'
		)
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
navigator.serial.getPorts().then((ports) => {
	if (ports.length > 0) {
		UI.writeEventLog('Connection',
			'Connected to ' +
			ports[0].getInfo().usbProductId)
	} else {
		UI.writeEventLog('Connection', 'No device connected')
	}
})

configurationForm.addEventListener('submit', async () => {
	let data = encodeFormData()
	console.log(data)
	UI.setStatusIndicator('written-indicator', 'info', 'Sending data …')
	const response = await RegenfassSerial.write(data)
	console.log(response)
	UI.writeEventLog('Data received', response)
	UI.setStatusIndicator('written-indicator', 'success', 'Data sent')
})
