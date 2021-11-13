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
})

resetpasswordForm.addEventListener('submit', async (event) => {
	const resetpasswordButton = document.querySelector("#resetpassword-submit-button");
	const form_error = document.querySelector(`.form-title > small`);

	try {
		event.preventDefault();
		clearErrors();
		if (resetpasswordButton.disabled) return false;

		resetpasswordFormState.busy = true;
		removeBanner();
		showProgressBar();
		resetpasswordButton.disabled = true;

		const data = await pureFetch({
			ops: "forgot password",
			link: 'https://localhost:8443/auth/reset-password',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: resetpasswordFormState.values,
		});

		if (data.code === 403 || data.code === 404) {
			showBanner(data);
			handleError(data);
			gotoLoginPage({ delay: true });
		} else if (data.code === 422) {
			handleValidationErrors(data);
		} else if (data.code) {
			handleError(data);
		} else {
			resetpasswordButton.style.display = "none";
			okButton.style.display = "initial";

			form_error.innerText = "The new password is set. Go to login page.";
			form_error.classList.add("success");
			form_error.style.display = "block";
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

function handleValidationErrors(data) {
	Object.keys(data.errors).forEach(name => {
		console.log(name)
		if (name === "body" || name === "token") {
			const form_error = document.querySelector(`.form-title > small`);
			form_error.innerText += data.errors[name];
			form_error.style.display = "block";

		} else {
			const field_error = resetpasswordForm.querySelector(`input[name=${name}] + small`);
			field_error.innerText = data.errors[name];
			field_error.style.display = "block";
		}
	})
}

function handleError(data) {
	const form_error = document.querySelector(".form-title > small")
	if (data.message.includes("expired")) {
		form_error.innerText = "The token is expired";
	} else if (data.message.includes("jwt") || data.message.includes("signature")) {
		form_error.innerText = "The token is wrong";
	} else {
		form_error.innerText = data.message;
	}
	form_error.style.display = "block";

	if (data.message.includes("jwt") || data.message.includes("signature") || data.message.includes("not valid")) {
		showBanner({message: "You can claim a new reset password link through the forgot password feature."});
	}
}

function clearErrors() {
	document.querySelectorAll("small").forEach((small) => small.innerText = "");
}

