// **************** NAVIGATION BETWEEN *********************

const loginTitle = document.querySelector(".title-container .login");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

const loginSlideButton = document.querySelector(".slide-controls label.login");
const signupSlideButton = document.querySelector(".slide-controls label.signup");

loginSlideButton.addEventListener("click", () => {
	if (!signupFormState.busy) {
		loginTitle.style.marginLeft = "0%";
		loginForm.style.marginLeft = "0%";
	}
});

signupSlideButton.addEventListener("click", () => {
	if (!loginFormState.busy) {
		console.log("login busy: ", loginFormState.busy);
		loginTitle.style.marginLeft = "-50%";
		loginForm.style.marginLeft = "-50%";
	}
});

document.querySelector("#login-link a").addEventListener("click", () => {
	if (!signupFormState.busy) {
		loginSlideButton.click();
		return false;
	}
});

document.querySelector("#signup-link a").addEventListener("click", () => {
	if (!loginFormState.busy) {
		signupSlideButton.click();
		return false;
	}
});

// **************** LOGIN FORM *********************

var loginFormState = {
	values: {
		email: "",
		password: ""
	},
	errors: {
		email: "",
		password: ""
	},
	validation: {
		email: false,
		password: false
	},
	busy: false,
}

loginForm.addEventListener('submit', event => {
	event.preventDefault();

	loginFormState.busy = true;

	const login_button = document.querySelector("#login-submit-button");
	login_button.disabled = true;
	login_button.style.cursor = "auto";

	const layer = document.querySelector("#layer-for-login-button");
	layer.style.background = "#949999";

	const checkboxSignup = document.getElementById("radio-signup");
	checkboxSignup.disabled = true;
	
	const progress_bar2 = document.getElementById("progress-bar-2");
	progress_bar2.style.display = "block";

	const form_error = document.querySelector('.title.login small');
	
	
	fetch('https://localhost:8443/auth/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(loginFormState.values),
	})
	.then(response => response.json())
	.then(data => {
		if (data.code === 422) {
			handleValidationErrors(loginForm, data);
		} else if (data.code >= 400) {
			handleError(form_error, data);
		} else {
			handleData(data);
		}
	})
	.catch((error) => {
		console.error('Error:', error);
	})
	.finally(() => {
		progress_bar2.style.display = "none";
		login_button.disabled = false;
		login_button.style.cursor = "pointer";
		layer.style.background = "-webkit-linear-gradient(right, var(--color-purple), var(--color-red), var(--color-purple), var(--color-red))";
		checkboxSignup.disabled = false;
		loginFormState.busy = false;
	});
});

document.querySelectorAll('form.login .field-text input').forEach( field => {
	field.addEventListener('input', event => {
		loginFormState.values[event.target.name] = event.target.value;
	});
	field.addEventListener('focus', event => {
		const field_error = loginForm.querySelector(`input[name=${event.target.name}] + small`);
		field_error.style.display = "none";
		const form_error = document.querySelector('.title.login small');
		form_error.style.display = "none";
	});
});

// **************** SIGNUP FORM *********************

var signupFormState = {
	values: {
		email: "",
		password: ""
	},
	errors: {
		email: "",
		password: ""
	},
	validation: {
		email: false,
		password: false
	},
	busy: false,
}

signupForm.addEventListener('submit', event => {
	event.preventDefault()

	signupFormState.busy = true;

	const signup_button = document.querySelector("#signup-submit-button");
	signup_button.disabled = true;
	signup_button.style.cursor = "auto";

	const layer = document.querySelector("#layer-for-signup-button");
	layer.style.background = "#949999";

	const checkboxLogin = document.getElementById("radio-login");
	checkboxLogin.disabled = true;
	
	const progress_bar2 = document.getElementById("progress-bar-2");
	progress_bar2.style.display = "block";

	const form_error = document.querySelector('.title.signup small');
	
	
	fetch('https://localhost:8443/auth/signup', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(signupFormState.values),
	})
	.then(response => response.json())
	.then(data => {
		if (data.code === 422) {
			handleValidationErrors(signupForm, data);
		} else if (data.code >= 400) {
			handleError(form_error, data);
		} else {
			handleData(data);
		}
	})
	.catch((error) => {
		console.error('Error:', error);
	})
	.finally(() => {
		progress_bar2.style.display = "none";
		signup_button.disabled = false;
		signup_button.style.cursor = "pointer";
		layer.style.background = "-webkit-linear-gradient(right, var(--color-purple), var(--color-red), var(--color-purple), var(--color-red))";
		checkboxLogin.disabled = false;
		signupFormState.busy = false;
	});
});

document.querySelectorAll('form.signup .field-text input').forEach( field => {
	field.addEventListener('input', event => {
		signupFormState.values[event.target.name] = event.target.value;
	});
	field.addEventListener('focus', event => {
		const field_error = signupForm.querySelector(`input[name=${event.target.name}] + small`);
		field_error.style.display = "none";
		const form_error = document.querySelector('.title.signup small');
		form_error.style.display = "none";
	});
});

// **************** UTILS *********************

function handleValidationErrors(form, data) {
	Object.keys(data.errors).forEach(name => {
		const field_error = form.querySelector(`input[name=${name}] + small`);
		field_error.innerText = data.errors[name];
		field_error.style.display = "block";
	})
}

function handleError(form_error, data) {
	form_error.innerText = data.message;
	form_error.style.display = "block";
}

function handleData(data) {
	localStorage.setItem('data', JSON.stringify(data));
	window.location.assign("https://localhost:5500/response.html");
}

function decodeJwtResponse(token) {
	var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// **************** AUTH PROVIDER *********************

const sendTokenToBackend = (token, provider, method) => {

	var xhr = new XMLHttpRequest();

	xhr.open('POST', `https://localhost:8443/auth/${provider}`);

	const progress_bar1 = document.getElementById("progress-bar-1");
	progress_bar1.style.display = "block";

	xhr.onload = function() {
		console.log(xhr.responseText);

		progress_bar1.style.display = "none";
		handleData(JSON.parse(xhr.responseText));
	};

	if (method === "urlencoded") {
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send('token=' + token);

	} else if (method === "json") {
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify({ token }));

	// the server application has implemented this option for now
	} else if (method === "bearer") {
		xhr.setRequestHeader('Authorization', 'Bearer ' + token);
		xhr.send();
	}
}