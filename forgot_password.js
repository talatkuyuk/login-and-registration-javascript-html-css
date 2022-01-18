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

		const response = await pureFetch({
			ops: "forgot password",
			link: `${api_base_url}/auth/forgot-password`,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: forgotpasswordFormState.values,
		});

		if (response.success) {
			forgotpasswordButton.style.display = "none";
			okButton.style.display = "initial";

			form_error.innerText = "The reset password link has been sent to your mailbox.";
			form_error.classList.add("success");
			form_error.style.display = "block";
			
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

function handleValidationErrors(error) {
	Object.keys(error.errors).forEach(key => {
		console.log(key)
		if (key === "body" || key === "id") {
			const form_error = document.querySelector(`.form-title > small`);
			form_error.innerText += error.errors[key];
			form_error.style.display = "block";

		} else {
			const field_error = forgotpasswordForm.querySelector(`input[name=${key}] + small`);
			field_error.innerText = error.errors[key];
			field_error.style.display = "block";
		}
	})
}

function handleError(error) {
	const form_error = document.querySelector(".form-title > small")
	if (error.message.includes("Sandbox")) {
		form_error.innerText = "The mail server has encountered a problem.";
	} else if (error.message.includes("connect")) {
		form_error.innerText = "Check your internet connection.";
	} else {
		form_error.innerText = error.message;
	}
	form_error.style.display = "block";
}

function clearErrors() {
	document.querySelectorAll("small").forEach((small) => small.innerText = "");
}

