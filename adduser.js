let store;

const adduserForm = document.getElementById("adduser-form");

var adduserFormState = {
	values: {
		email: "",
		role: "",
		name: "",
		gender: "",
		country: "",
	},
	errors: {
		email: "",
		role: "",
		name: "",
		gender: "",
		country: "",
	},
	validation: {
		email: false,
		role: false,
		name: false,
		gender: false,
		country: false,
	},
	busy: false,
}

window.addEventListener('load', async (event) => {
	try {
		document.body.classList.remove("preload"); // to prevent all animations before loaded

		const local = localStorage.getItem('data');

		if (!local) {
			gotoLoginPage({ delay: false });
			return;
		}

		store = JSON.parse(local);
		const { authuser, tokens } = store;
		

		if (!tokens) {
			gotoLoginPage({ delay: false });
			return;
		}

		showEmailInHeader(authuser.email);

		const input_email = document.querySelector("#adduser-email");
		input_email.value = authuser.email;
		input_email.disabled = true;

		const input_role = document.querySelector("#adduser-role")
		input_role.value = "user";
		input_role.disabled = true;

		adduserFormState.values.email = authuser.email;
		adduserFormState.values.role = "user";

	} catch (error) {
		console.log (error);
	}
});


adduserForm.addEventListener('submit', async (event) => {
	const adduserButton = document.querySelector("#adduser-submit-button");

	try {
		event.preventDefault();
		clearErrors();

		adduserFormState.busy = true;
		removeBanner();
		showProgressBar();
		adduserButton.disabled = true;

		const data = await secureFetch({
			ops: "add user",
			link: `https://localhost:8443/users/${store.authuser.id}`,
			method: 'POST',
			tokens: store.tokens,
			headers: {
				'Content-Type': 'application/json',
			},
			body: adduserFormState.values,
		});

		if (data.code === 403) {
			showBanner(data);
			gotoLoginPage({ delay: true });
		} else if (data.code === 422) {
			handleValidationErrors(data);
		} else if (data.code) {
			handleError(data);
		} else {
			handleData(data);
		}
		
	} catch (error) {
		console.error('Error:', error);

	} finally {
		removeProgressBar();
		adduserButton.disabled = false;
		adduserFormState.busy = false;
	}
});

// **************** EVENT LISTENERS *********************

document.querySelectorAll('#adduser-form .field-text input').forEach( field => {
	field.addEventListener('input', event => {
		adduserFormState.values[event.target.name] = event.target.value;
	});
	field.addEventListener('focus', event => {
		const field_error = adduserForm.querySelector(`input[name=${event.target.name}] + small`);
		field_error.style.display = "none";
		const form_error = document.querySelector('.form-title small');
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
			const field_error = adduserForm.querySelector(`input[name=${name}] + small`);
			field_error.innerText = data.errors[name];
			field_error.style.display = "block";
		}
	})
}

function handleError(data) {
	const form_error = document.querySelector(".form-title > small")
	form_error.innerText = data.message;
	form_error.style.display = "block";
}

function handleData(data) {
	store.user = data;
	localStorage.setItem('data', JSON.stringify(store));
	window.location.assign("https://localhost:5500/index.html?from=adduser");
}

function clearErrors() {
	document.querySelectorAll("small").forEach((small) => small.innerText = "");
}