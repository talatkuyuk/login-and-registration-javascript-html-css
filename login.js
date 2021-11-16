const titleLoginForm = document.getElementById("title-login-form");
const titleSignupForm = document.getElementById("title-signup-form");

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

// **************** SLIDE BETWEEN FORMS *********************

document.querySelectorAll("input[name='slide']").forEach((input) => {
	input.addEventListener('change', slider);
});

function slider(event) {
	if (event.target.id === "radio-login") {
		titleLoginForm.style.marginLeft = "0%";
		loginForm.style.marginLeft = "0%";
	} else {
		titleLoginForm.style.marginLeft = "-50%";
		loginForm.style.marginLeft = "-50%";
	}
}

const radioSignup = document.getElementById("radio-signup");
const radioLogin = document.getElementById("radio-login");

document.querySelector("#login-link a").addEventListener("click", () => {
	radioLogin.click();
});

document.querySelector("#signup-link a").addEventListener("click", () => {
	radioSignup.click();
});

// **************** DOCUMENT ON LOAD *********************

window.addEventListener('load', async (event) => {
	document.body.classList.remove("preload"); // to prevent all animations before loaded
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

loginForm.addEventListener('submit', async (event) => {
	const loginButton = document.querySelector("#login-submit-button");

	try {
		event.preventDefault();
		clearErrors("login");
	
		loginFormState.busy = true;
		removeBanner();
		loginButton.disabled = true;
		radioSignup.disabled = true;
		showProgressBar("progress-bar-2");

		const data = await pureFetch({
			ops: "login",
			link: 'https://localhost:8443/auth/login',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: loginFormState.values,
		});
	
		if (data.code === 403) {
			showBanner(data);
			removeProgressBar("progress-bar-2");
			handleError(titleLoginForm, data);
		} else if (data.code === 422) {
			handleValidationErrors(loginForm, data);
		} else if (data.code >= 400) {
			handleError(titleLoginForm, data);
		} else {
			handleData("login", data);
		}
		
	} catch (error) {
		console.error('Error:', error);

	} finally {
		removeProgressBar("progress-bar-2");
		loginButton.disabled = false;
		radioSignup.disabled = false;
		loginFormState.busy = false;
	}
});

// **************** SIGNUP FORM *********************

var signupFormState = {
	values: {
		email: "",
		password: "",
		passwordConfirmation: ""
	},
	errors: {
		email: "",
		password: "",
		passwordConfirmation: ""
	},
	validation: {
		email: false,
		password: false,
		passwordConfirmation: false
	},
	busy: false,
}

signupForm.addEventListener('submit', async (event) => {
	const signupButton = document.querySelector("#signup-submit-button");

	try {
		event.preventDefault();
		clearErrors("signup");
	
		signupFormState.busy = true;
		removeBanner();
		signupButton.disabled = true;
		radioLogin.disabled = true;
		showProgressBar("progress-bar-2");

		const data = await pureFetch({
			ops: "signup",
			link: 'https://localhost:8443/auth/signup',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: signupFormState.values,
		});
	
		if (data.code === 422) {
			handleValidationErrors(signupForm, data);
		} else if (data.code >= 400) {
			handleError(titleSignupForm, data);
		} else {
			handleData("signup", data);
		}

	} catch (error) {
		console.error('Error:', error);

	} finally {
		removeProgressBar("progress-bar-2");
		signupButton.disabled = false;
		radioLogin.disabled = false;
		signupFormState.busy = false;
	}
});

// **************** EVENT LISTENERS *********************

document.querySelectorAll('form.login .field-text input').forEach( field => {
	field.addEventListener('input', event => {
		loginFormState.values[event.target.name] = event.target.value;
	});

	field.addEventListener('focus', event => {
		const field_error = loginForm.querySelector(`input[name=${event.target.name}] + small`);
		field_error.style.display = "none";
		const form_error = titleLoginForm.querySelector('small');
		form_error.style.display = "none";
	});
});

document.querySelectorAll('form.signup .field-text input').forEach( field => {
	field.addEventListener('input', event => {
		signupFormState.values[event.target.name] = event.target.value;
	});

	field.addEventListener('focus', event => {
		const field_error = signupForm.querySelector(`input[name=${event.target.name}] + small`);
		field_error.style.display = "none";
		const form_error = titleSignupForm.querySelector('small');
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

function handleError(title, data) {
	const form_error = title.querySelector('small');
	form_error.innerText = data.message;
	form_error.style.display = "block";
}

function handleData(from, data) {
	const store = {};
	store.authuser = data.user;
	store.tokens = data.tokens;
	localStorage.setItem('data', JSON.stringify(store));
	window.location.assign(`/index.html?from=${from}`);
}

function decodeJwtResponse(token) {
	var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function clearErrors(text) {
	document.querySelector(`#title-${text}-form small`).innerText = "";
	document.querySelectorAll(`form.${text} small`).forEach((small) => small.innerText = "");
}

// **************** AUTH PROVIDER *********************

const sendTokenToBackend = async (token, provider, method, from) => {

	var xhr = new XMLHttpRequest();

	xhr.open('POST', `https://localhost:8443/auth/${provider}`);

	showProgressBar("progress-bar-1");

	xhr.onload = async function() {
		const data = JSON.parse(xhr.responseText);
		console.log(data);

		removeProgressBar("progress-bar-1");

		if (data.code) {
			showBanner(data);
			return;
		}

		handleData("login", data);
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
