window.addEventListener('load', () => {

	if (window.location.hash === "#step-installation") {
		document.getElementById('step-installation').open = true;
		document.getElementById('step-configuration').open = false;
		document.getElementById('step-installation').scrollIntoView();
	} else if (window.location.hash === "#step-configuration") {
		document.getElementById('step-installation').open = false;
		document.getElementById('step-configuration').open = true;
		document.getElementById('step-configuration').scrollIntoView();
	}

	// Add hash with the current id of details when you click on step-instalation > summary or step-configuration > summary
	document.getElementById('step-installation').addEventListener('click', () => {
		window.location.hash = "#step-installation";
		history.pushState({}, 'regenfass - installation step', window.location.hash);
	});

	document.getElementById('step-configuration').addEventListener('click', () => {
		window.location.hash = "#step-configuration";
		history.pushState({}, 'regenfass - configuration', window.location.hash);
	});
});


class Step {
	step = ""
	steps = [
		"installation",
		"configuration",
	]

	constructor() {
		this.step = localStorage.getItem("step")
		if (!this.step) {
			 this.setStep("installation")
		} else {
			this.setStep(this.step)
		}
	}

	/**
	 * @param {string} step
	 */
	 setStep(newStep) {
		localStorage.setItem("step", newStep)
		this.steps.forEach(step => {
			console.log(newStep, step)
			if (step != newStep)
				document.getElementById(`steps-${step}`).open = false
			else
				document.getElementById(`steps-${step}`).open = true
		});
	}
}
