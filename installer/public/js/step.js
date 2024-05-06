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
