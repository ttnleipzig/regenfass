import {
	buttonInstallation,
} from './selectors.js'

export class RegenfassInstallation {

	button = document.querySelector('esp-web-install-button')
	state = ''

	constructor() {
		this.state = 'constructed'
		this.initilize()
	}

	initilize() {
		this.state = 'initilized'
		document
			.getElementById('type')
			.addEventListener('change', (event) => {
				buttonInstallation.setAttribute(
					'manifest',
					`./manifest_${event.target.value}.json`
				)
			}
		)
	}
}


/*
document
	.getElementById('type')
	.addEventListener('change', (event) => {
		button.setAttribute(
			'manifest',
			`./manifest_${event.target.value}.json`
		)
	});

button.addEventListener('initializing', (event) => {
	console.log('initializing state', event);
});
button.addEventListener('preparing', (event) => {
	console.log('preparing state', event);
});
button.addEventListener('erasing', (event) => {
	console.log('erasing state', event);
});
button.addEventListener('writing', (event) => {
	console.log('writing state', event);
});
button.addEventListener('finished', (event) => {
	console.log('finished state', event);
});
button.addEventListener('error', (event) => {
	console.log('error state', event);
});
button.addEventListener('install', (event) => {
	console.log('Installation started', event);
});
button.addEventListener('error', (event) => {
	console.error('Installation failed', event);
});
button.addEventListener('success', (event) => {
	console.log('Installation succeeded', event);
});
button.addEventListener('update', (event) => {
	console.log('Update available', event);
});
lashStateType {
INITIALIZING = 'initializing',
PREPARING = 'preparing',
ERASING = 'erasing',
WRITING = 'writing',
FINISHED = 'finished',
ERROR = 'error',
}
*/
