const forgotpasswordForm = document.getElementById("forgotpassword-form");

var forgotpasswordFormState = {
	values: {
		email: "",
	},
	errors: {
		email: "",
	},
	validation: {
		email: false,
	},
	busy: false,
}

window.addEventListener('load', async (event) => {
	document.body.classList.remove("preload"); // to prevent all animations before loaded
});

const okButton = document.querySelector("#forgotpassword-simple-button");
okButton.addEventListener("click", () => {
	gotoLoginPage({ delay: false });
})

forgotpasswordForm.addEventListener('submit', async (event) => {
	const forgotpasswordButton = document.querySelector("#forgotpassword-submit-button");
	const input_email = document.querySelector("#forgotpassword-email");
	const form_error = document.querySelector(`.form-title > small`);

	try {
		event.preventDefault();
		clearErrors();
		if (forgotpasswordButton.disabled) return false;

		forgotpasswordFormState.busy = true;
		removeBanner();
		showProgressBar();
		forgotpasswordButton.disabled = true;
		input_email.disabled = true;

		const data = await pureFetch({
			ops: "forgot password",
			link: `${api_base_url}/auth/forgot-password`,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: forgotpasswordFormState.values,
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
			forgotpasswordButton.style.display = "none";
			okButton.style.display = "initial";

			form_error.innerText = "The reset password link has been sent to your mailbox.";
			form_error.classList.add("success");
			form_error.style.display = "block";
		}
		
	} catch (error) {
		console.error('Error:', error);

	} finally {
		removeProgressBar();
		forgotpasswordButton.disabled = false;
		if (!form_error.classList.contains("success")) {
			input_email.disabled = false;
		}
		forgotpasswordFormState.busy = false;
	}
});

// **************** EVENT LISTENERS *********************

document.querySelectorAll('#forgotpassword-form .field-text input').forEach( field => {
	field.addEventListener('input', event => {
		forgotpasswordFormState.values[event.target.name] = event.target.value;
	});
	field.addEventListener('focus', event => {
		const field_error = forgotpasswordForm.querySelector(`input[name=${event.target.name}] + small`);
		field_error.style.display = "none";
		const form_error = document.querySelector('.form-title > small');
		form_error.style.display = "none";
	});
});

// **************** UTILS *********************

function handleValidationErrors(data) {
	Object.keys(data.errors).forEach(name => {
		console.log(name)
		if (name === "body" || name === "id") {
			const form_error = document.querySelector(`.form-title > small`);
			form_error.innerText += data.errors[name];
			form_error.style.display = "block";

		} else {
			const field_error = forgotpasswordForm.querySelector(`input[name=${name}] + small`);
			field_error.innerText = data.errors[name];
			field_error.style.display = "block";
		}
	})
}

function handleError(data) {
	const form_error = document.querySelector(".form-title > small")
	if (data.message.includes("Sandbox")) {
		form_error.innerText = "The mail server has encountered a problem.";
	} else if (data.message.includes("connect")) {
		form_error.innerText = "Check your internet connection.";
	} else {
		form_error.innerText = data.message;
	}
	form_error.style.display = "block";
}

function clearErrors() {
	document.querySelectorAll("small").forEach((small) => small.innerText = "");
}

