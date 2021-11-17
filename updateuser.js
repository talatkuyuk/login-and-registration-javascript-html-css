let store;

const updateuserForm = document.getElementById("updateuser-form");
const updateButton = document.querySelector("#updateuser-submit-button");
const okButton = document.querySelector("#resetpassword-simple-button");
const input_email = document.querySelector("#updateuser-email");
const input_role = document.querySelector("#updateuser-role");
const input_name = document.querySelector("#updateuser-name");
const input_gender = document.querySelector("#updateuser-gender");
const input_country = document.querySelector("#updateuser-country");

var updateuserFormState = {
	initial: {
		name: "",
		gender: "",
		country: "",
	},
	values: {
		name: "",
		gender: "",
		country: "",
	},
	errors: {
		name: "",
		gender: "",
		country: "",
	},
	validation: {
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
		const { authuser, tokens, user } = store;
		

		if (!tokens) {
			gotoLoginPage({ delay: false });
			return;
		}

		showEmailInHeader(authuser.email);

		if (!user) {
			gotoPage("adduser.html?from=updateuser");
			return;
		}

		input_email.disabled = true;
		input_email.value = user.email;

		input_role.disabled = true;
		input_role.value = user.role;

		input_name.value = user.name;

		user.gender || (input_gender.style.color = "#999");
		user.gender && (input_gender.value = user.gender);

		input_country.innerHTML = country_list_combobox_options;
		user.country || (input_country.style.color = "#999");
		user.country && (input_country.value = user.country);

		updateuserFormState.initial.name = user.name;
		updateuserFormState.initial.gender = user.gender;
		updateuserFormState.initial.country = user.country;

		updateuserFormState.values.name = user.name;
		updateuserFormState.values.gender = user.gender;
		updateuserFormState.values.country = user.country;

		updateButton.disabled = true;

	} catch (error) {
		console.log (error);
	}
});


updateuserForm.addEventListener('submit', async (event) => {
	try {
		event.preventDefault();
		clearErrors();

		updateuserFormState.busy = true;
		removeBanner();
		showProgressBar();
		updateButton.disabled = true;

		const data = await secureFetch({
			ops: "update user",
			link: `${api_base_url}/users/${store.user.id}`,
			method: 'PUT',
			tokens: store.tokens,
			headers: {
				'Content-Type': 'application/json',
			},
			body: updateuserFormState.values,
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
		updateButton.disabled = false;
		updateuserFormState.busy = false;
	}
});

// **************** EVENT LISTENERS *********************

document.querySelectorAll('#updateuser-form .field-text input').forEach( field => {
	field.addEventListener('input', event => {
		updateuserFormState.values[event.target.name] = event.target.value;

		const noUpdate = Object.keys(updateuserFormState.values)
								.every((key) => updateuserFormState.values[key] ===  updateuserFormState.initial[key]);
		updateButton.disabled = noUpdate;
	});

	field.addEventListener('focus', event => {
		const field_error = updateuserForm.querySelector(`input[name=${event.target.name}] + small`);
		field_error.style.display = "none";
		const form_error = document.querySelector('.form-title small');
		form_error.style.display = "none";
	});
});

document.querySelectorAll('#updateuser-form .field-select select').forEach( field => {
	field.addEventListener('change', event => {
		console.log(event.target.name, ": ", event.target.value);
		updateuserFormState.values[event.target.name] = event.target.value;
		if (event.target.value === "") {
			event.target.style.color = "#999";
		} else {
			event.target.style.color = "initial";
		}

		const noUpdate = Object.keys(updateuserFormState.values)
								.every((key) => updateuserFormState.values[key] ===  updateuserFormState.initial[key]);
		updateButton.disabled = noUpdate;
	});

	field.addEventListener('focus', event => {
		const field_error = updateuserForm.querySelector(`select[name=${event.target.name}] + small`);
		field_error.style.display = "none";
		const form_error = document.querySelector('.form-title small');
		form_error.style.display = "none";
	});
});

okButton.addEventListener("click", () => {
	gotoPage("index.html?from=updateuser");
});

// **************** UTILS *********************

function handleValidationErrors(data) {
	Object.keys(data.errors).forEach(name => {
		console.log(name)
		if (name === "body" || name === "id") {
			const form_error = document.querySelector(`.form-title > small`);
			form_error.innerText += data.errors[name];
			form_error.style.display = "block";

		} else if (name === "country" || name === "gender") {
			const field_error = updateuserForm.querySelector(`select[name=${name}] + small`);
			field_error.innerText = data.errors[name];
			field_error.style.display = "block";

		} else {
			const field_error = updateuserForm.querySelector(`input[name=${name}] + small`);
			field_error.innerText = data.errors[name];
			field_error.style.display = "block";
		}
	})
}

function handleError(data) {
	const form_error = document.querySelector(".form-title > small")
	form_error.innerText = data.message;
	form_error.style.display = "block";

	showBanner(data);
}

function handleData(data) {
	store.user = data;
	saveState();

	updateButton.style.display = "none";
	okButton.style.display = "initial";

	const form_error = document.querySelector(`.form-title > small`);
	form_error.innerText = "The profile is updated. Go to home page.";
	form_error.classList.add("success");
	form_error.style.display = "block";

	input_name.disabled = true;
	input_gender.disabled = true;
	input_country.disabled = true;
}