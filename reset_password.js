const resetpasswordForm = document.getElementById("resetpassword-form");

var resetpasswordFormState = {
	values: {
		token: "",
		password: "",
		passwordConfirmation: ""
	},
	errors: {
		token: "",
		password: "",
		passwordConfirmation: ""
	},
	validation: {
		token: false,
		password: false,
		passwordConfirmation: false
	},
	busy: false,
}

window.addEventListener('load', async (event) => {
	document.body.classList.remove("preload"); // to prevent all animations before loaded

	const urlParams = new URLSearchParams(window.location.search);
	resetpasswordFormState.values.token = urlParams.get('token');
});

const okButton = document.querySelector("#resetpassword-simple-button");
okButton.addEventListener("click", () => {
	gotoLoginPage({ delay: false });
});

resetpasswordForm.addEventListener('submit', async (event) => {
	const resetpasswordButton = document.querySelector("#resetpassword-submit-button");

	try {
		event.preventDefault();
		clearErrors();
		if (resetpasswordButton.disabled) return false;

		resetpasswordFormState.busy = true;
		removeBanner();
		showProgressBar();
		resetpasswordButton.disabled = true;

		const response = await pureFetch({
			ops: "forgot password",
			link: `${api_base_url}/auth/reset-password`,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: resetpasswordFormState.values,
		});

		if (response.success) {
			handleData();
		} else if (response.error.code === 403 || response.error.code === 404) {
			showBanner(response.error);
			handleError(response.error);
			gotoLoginPage({ delay: true });
		} else if (response.error.code === 422) {
			handleValidationErrors(response.error);
		} else {
			handleError(response.error);
		}
		
	} catch (error) {
		console.error('Error:', error);

	} finally {
		removeProgressBar();
		resetpasswordButton.disabled = false;
		resetpasswordFormState.busy = false;
	}
});

// **************** EVENT LISTENERS *********************

document.querySelectorAll('#resetpassword-form .field-text input').forEach( field => {
	field.addEventListener('input', event => {
		resetpasswordFormState.values[event.target.name] = event.target.value;
	});
	field.addEventListener('focus', event => {
		const field_error = resetpasswordForm.querySelector(`input[name=${event.target.name}] + small`);
		field_error.style.display = "none";
		const form_error = document.querySelector('.form-title > small');
		form_error.style.display = "none";
	});
});

// **************** UTILS *********************

function handleValidationErrors(error) {
	Object.keys(error.errors).forEach(key => {
		console.log(key)
		if (key === "body" || key === "token") {
			const form_error = document.querySelector(`.form-title > small`);
			form_error.innerText += error.errors[key];
			form_error.style.display = "block";

		} else {
			const field_error = resetpasswordForm.querySelector(`input[name=${key}] + small`);
			field_error.innerText = error.errors[key];
			field_error.style.display = "block";
		}
	})
}

function handleError(error) {
	const form_error = document.querySelector(".form-title > small")
	if (error.message.includes("expired")) {
		form_error.innerText = "The token is expired";
	} else if (error.message.includes("jwt") || error.message.includes("signature")) {
		form_error.innerText = "The token is wrong";
	} else {
		form_error.innerText = error.message;
	}
	form_error.style.display = "block";

	if (error.message.includes("jwt") || error.message.includes("signature") || error.message.includes("not valid")) {
		showBanner({message: "You can claim a new reset password link through the forgot password feature."});
	}
}

function handleData() {
	const form_error = document.querySelector(`.form-title > small`);
	const resetpasswordButton = document.querySelector("#resetpassword-submit-button");

	resetpasswordButton.style.display = "none";
	okButton.style.display = "initial";

	form_error.innerText = "The new password is set. Go to login page.";
	form_error.classList.add("success");
	form_error.style.display = "block";
}

function clearErrors() {
	document.querySelectorAll("small").forEach((small) => small.innerText = "");
}

