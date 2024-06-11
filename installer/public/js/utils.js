import initSCP from './scp.js'

export const
	buttonConfigurationConnect = document.getElementById('button-configuration-connect'),
	buttonConfiguration = document.getElementById('button-configuration'),
	buttonInstallation = document.getElementById('button-installation'),
	buttonNewsletter = document.getElementById('button-newsletter'),
	configurationForm = document.getElementById('form-configuration'),
	credentialsDeveui = document.getElementById('credentials-deveui'),
	credentialsJoineui = document.getElementById('credentials-joineui'),
	credentialsAppkey = document.getElementById('credentials-appkey'),
	logSend = document.getElementById('log-send'),
	logEvent = document.getElementById('log-event');

export const scp = await initSCP()
