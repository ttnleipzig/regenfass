import {
	logSend,
	buttonConfiguration,
	logEvent,
} from './selectors.js'

export class UI {

	static classSuccessBg = 'bg-green-400'
	static classSuccessText = 'text-green-500'
	static classInfoBg = 'bg-sky-400'
	static classInfoText = 'text-sky-500'
	static classErrorBg = 'bg-red-400'
	static classErrorText = 'text-red-500,'
	static classDefaultBg = 'bg-slate-300'
	static classDefaultText = 'text-slate-500'

	// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
	// Function to set status indicator an write log for given id
	// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
	static setStatusIndicator = (id, status, log, reset = true) => {
		let indicator = document.getElementById(id)
		let ledElement = indicator.children[0]
		let logElement = indicator.children[2]

		if (reset) {
			ledElement.classList.remove(this.classSuccessBg)
			ledElement.classList.remove(this.classInfoBg)
			ledElement.classList.remove(this.classErrorBg)
			ledElement.classList.add(this.classDefaultBg)
		}

		switch (status) {
			case 'success':
				ledElement.classList.remove(this.classDefaultBg)
				ledElement.classList.add(this.classSuccessBg)
				logElement.textContent = log || 'Success'
				break
			case 'info':
				ledElement.classList.remove(this.classDefaultBg)
				ledElement.classList.add(this.classInfoBg)
				logElement.textContent = log || 'Warning'
				break
			case 'warning':
				ledElement.classList.remove(this.classDefaultBg)
				ledElement.classList.add(this.classDefaultBg)
				logElement.textContent = log || 'Warning'
				break
			case 'error':
				ledElement.classList.remove(this.classDefaultBg)
				ledElement.classList.add(this.classErrorBg)
				logElement.textContent = log || 'Error'
				break
			default:
				ledElement.classList.add(this.classDefaultBg)
				logElement.textContent = log || 'Unknown'
				break
		}
	}

	static writeLog(log) {
		logSend.textContent += log + '\n'
	}

	static clearLog() {
		logSend.textContent = ''
	}

	static writeEventLog(event, data) {
		logEvent.textContent += `${event}: ${JSON.stringify(data)} \n`
	}

	static clearEventLog() {
		logEvent.textContent = ''
	}

	static setConnectionButtonState(state) {
		switch (state) {
			case 'connected':
				buttonConfiguration.textContent = 'Disconnect'
				buttonConfiguration.classList.remove('bg-red-500')
				buttonConfiguration.classList.add('bg-green-500')
				break
			case 'disconnected':
				buttonConfiguration.textContent = 'Connect'
				buttonConfiguration.classList.remove('bg-green-500')
				buttonConfiguration.classList.add('bg-red-500')
				break
			default:
				buttonConfiguration.textContent = 'Connect'
				buttonConfiguration.classList.remove('bg-green-500')
				buttonConfiguration.classList.add('bg-red-500')
				break
		}
	}

}
