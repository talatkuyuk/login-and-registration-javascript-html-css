let store, authuser, user;

const profile_list = [
	{name: "Mr.React", type: "Self"},
	{name: "My Kitten", type: "Kid"},
	{name: "Little Lamb", type: "Kid"},
	{name: "My Honey", type: "Spouse"},
	{name: "Gonzales", type: "Friend"},
]
const allergy_list = ["Gluten", "Crusta-cean", "Egg", "Fish", "Peanut", "Soybean", "Milk", "Nut", "Celery", "Mustard", "Sesame", "Sulphite", "Lupin", "Molluscs"];

const like_list = ["Hamburger", "Doner", "Pizza", "Toast", "Banana", "Grills", "Chicken", "Apple", "Vegetable food", "Spicy Turkish omlet", "Boiled egg"];

const dislike_list = ["Garlic", "Bacon", "Onion", "Domatos", "Lemon", "Crema", "Cheese", "Olive oil", "Vegetable food", "Meat", "Chicken"];

const preference_list = ["Kosher", "Vegeterian", "Vegan", "Halal", "Chinese food", "Italian food", "Indian Kitchen", "Greek food", "Turkish food"];


window.addEventListener('load', async (event) => {
	try {
		document.body.classList.remove("preload"); // to prevent all animations before loaded

		const local = localStorage.getItem('data');

		if (!local) {
			gotoLoginPage({ delay: false });
			return;
		}

		store = JSON.parse(local);
		console.log(store);

		if (!store.tokens) {
			gotoLoginPage({ delay: false });
			return;
		}

		const urlParams = new URLSearchParams(window.location.search);
		const from = urlParams.get('from');
		console.log(from)

		if (from === null) {
			//removeSpinner();return;
			const data = await secureFetch({
				ops: "get authuser",
				link: `https://localhost:8443/authusers/${store.authuser.id}`,
				method: 'GET',
				tokens: store.tokens,
				headers: {
					'Content-Type': 'application/json',
				},
			});

			// check the response is an error
			if (data.code) {
				showBanner(data);
				gotoLoginPage({ delay: true });
				return;
			}

			authuser = data;
			showEmailInHeader(authuser.email);

			if (! authuser.isEmailVerified) {
				showVerifyEmailContainer();
				return;
			}

			const data2 = await secureFetch({
				ops: "get user",
				link: `https://localhost:8443/users/${authuser.id}`,
				method: 'GET',
				tokens: store.tokens,
				headers: {
					'Content-Type': 'application/json',
				},
			});
			
			// if there is no user
			if (data2.code === 404) {
				gotoPage("adduser.html", true);
				return;

			// check the response is an error
			} else if (data2.code) {
				showBanner(data2);
				gotoLoginPage({ delay: true });
				return;
			}

			store.user = data2;
			localStorage.setItem('data', JSON.stringify(store));
			console.log(store);

			showBusinessCard(data2);
			return;
		}


		if (from === "adduser") {

			authuser = store.authuser;
			user = store.user;

			showEmailInHeader(authuser.email);

			if (! authuser.isEmailVerified) {
				showVerifyEmailContainer();
				return;
			}

			showBusinessCard(user);
			return;
		}


		if (from === "signup") {
			gotoPage("adduser.html", true);
			return;
		}

		if (from === "login") {
			authuser = store.authuser;
			showEmailInHeader(authuser.email);

			const data = await secureFetch({
				ops: "get user",
				link: `https://localhost:8443/users/${authuser.id}`,
				method: 'GET',
				tokens: store.tokens,
				headers: {
					'Content-Type': 'application/json',
				},
			});

			// if there is no user
			if (data.code === 404) {
				gotoPage("adduser.html", true);
				return;
	
			// check the response is an error
			} else if (data.code) {
				showBanner(data);
				gotoLoginPage({ delay: true });
				return;
			}

			if (! authuser.isEmailVerified) {
				showVerifyEmailContainer();
				return;
			}
	
			store.user = data;
			localStorage.setItem('data', JSON.stringify(store));
			console.log(store);

			showBusinessCard(data);
			return;
		}


	} catch (error) {
		console.log (error);

		if (error.message.includes("Failed to fetch")) {
			showBanner({ message: "The server is not responding, try later."});
		} 

	} finally {
		removeSpinner();
	}
});


const emailButton = document.getElementById("send-email-button");

emailButton.addEventListener('click', async (event) => {
	const result = document.querySelector(".popup-container small");

	try {
		if (emailButton.disabled) return;
		event.preventDefault();
		result.innerText = "";
	
		emailButton.classList.add("disabled");
		emailButton.disabled = true;
		showProgressBar();

		const data = await secureFetch({
			ops: "send verification email",
			link: 'https://localhost:8443/auth/send-verification-email',
			method: 'POST',
			tokens: store.tokens,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	
		if (data.code) {
			if (data.message.includes("sandbox")) {
				result.innerText = "The mail server has encountered a problem.";
			} else if (data.message.includes("connect")) {
				result.innerText = "Check your internet connection.";
			} else {
				result.innerText = data.message;
			}
			result.classList.remove(...result.classList);
			result.classList.add("failure");
			result.style.display = "block";

		} else {
			result.innerText = "The email has been send to your email box.";
			result.classList.remove(...result.classList);
			result.classList.add("success");
			result.style.display = "block";
		}

	} catch (error) {
		console.error('Error:', error);

		result.innerText = error.message;
		result.classList.remove(...result.classList);
		result.classList.add("failure");
		result.style.display = "block";

	} finally {
		removeProgressBar();
		if (result.classList.contains("failure")) {
			emailButton.classList.remove("disabled");
			emailButton.disabled = false;
		}
	}
});

// **************** UTILS *********************

async function showBusinessCard(user) {
	const businessCard = document.getElementsByClassName("business-card")[0];

	for (key of Object.keys(user)) {
		
		const element = businessCard.querySelector(`span[id="profile-${key}"]`);
		if (element) {
			if (key === "createdAt") {
				element.innerText = new Date(+user[key]).toLocaleDateString();
			} else if (key === "country") {
				element.innerText = countries[user[key]];
			} else {
				element.innerText = user[key]
			}
		}
	}

	const pp = document.querySelector(".business-card .back .image img");
	const random = Math.floor(Math.random() * 65 + 1); 
	pp.src = `https://i.pravatar.cc/200?img=${random}`;

	document.querySelector("span[id='header-email']").innerText = user.email;
	businessCard.style.display = "block";

	// Create new document fragment
	const fragment = new DocumentFragment();

	const random_profiles = getRandomElements(profile_list);
	for (const profile of random_profiles) {
		const profile_card_instance = stringToElement(profile_card_template);

		profile_card_instance.children[0].children[0].innerText = profile.name;
		profile_card_instance.children[0].children[1].innerText = profile.type;

		const container_for_allergies = profile_card_instance.querySelector(".safemeals-profile-value.allergies");
		const container_for_likes = profile_card_instance.querySelector(".safemeals-profile-value.likes");
		const container_for_dislikes = profile_card_instance.querySelector(".safemeals-profile-value.dislikes");
		const container_for_preferences = profile_card_instance.querySelector(".safemeals-profile-value.preferences");

		// allergies
		const random_allergies = getRandomElements(allergy_list, 4);
		for (const allergy of random_allergies) {
			const template = stringToElement(profile_allergy_template);
			template.querySelector(".allergy").innerText = allergy;
			container_for_allergies.appendChild(template);
		}

		// likes
		const random_likes = getRandomElements(like_list);
		for (const like of random_likes) {
			const template = stringToElement(profile_property_template);
			template.innerText = like;
			container_for_likes.appendChild(template);
		}

		// dislikes
		const random_dislikes = getRandomElements(dislike_list);
		for (const like of random_dislikes) {
			const template = stringToElement(profile_property_template);
			template.innerText = like;
			container_for_dislikes.appendChild(template);
		}

		// preferences
		const random_preference = getRandomElements(preference_list);
		for (const like of random_preference) {
			const template = stringToElement(profile_property_template);
			template.innerText = like;
			container_for_preferences.appendChild(template);
		}

		fragment.appendChild(profile_card_instance);
	}

	const random_active_card = Math.floor(Math.random() * random_profiles.length);

	fragment.children[random_active_card].classList.add("active");

	insertAfter(fragment, document.getElementsByClassName("business-card")[0]);

	const subProfiles = document.querySelectorAll(".safemeals-profile-card");
	subProfiles.forEach( async (profile, index) => {
		await new Promise(resolve => setTimeout(resolve, 500)).then(() => {
			profile.style.animationDelay = `${index*0.5}s`;
			profile.classList.add('animate');
		});
	});

	document.querySelectorAll('.safemeals-profile-property').forEach( property => {
		property.addEventListener('click', event => {
			event.target.parentNode.querySelectorAll('.safemeals-profile-property').forEach(p=> p.classList.remove("active"));
			event.target.classList.add("active");
			const values_container = event.target.parentNode.parentNode.querySelector(".safemeals-profile-values");
			values_container.querySelectorAll('.safemeals-profile-value').forEach(p=> p.classList.remove("active"));
			if (event.target.classList.contains("allergies")) {
				values_container.querySelector(".allergies").classList.add("active");
			} else if (event.target.classList.contains("likes")) {
				values_container.querySelector(".likes").classList.add("active");
			} else if (event.target.classList.contains("dislikes")) {
				values_container.querySelector(".dislikes").classList.add("active");
			} else if (event.target.classList.contains("preferences")) {
				values_container.querySelector(".preferences").classList.add("active");
			}
		});
	});

	// response-container
	await new Promise(resolve => setTimeout(resolve, 500 * random_profiles.length * 2)).then(() => {
		const json_pre_holder = document.getElementById("response");
		json_pre_holder.textContent = JSON.stringify(store, null, 2);
		document.querySelector(".response-container").style.display = "flex";
	});
	
	document.querySelectorAll('.safemeals-profile-legend').forEach( legend => {
		legend.addEventListener('click', event => {
			document.querySelectorAll('.safemeals-profile-card').forEach(p=> p.classList.remove("active"));
			event.target.parentNode.classList.add("active");
		});
	});
}

function showVerifyEmailContainer() {
	const popup_container = document.querySelector(".popup-container");
	showBanner({ message: "You have to verify your email. Please check your email box."});
	popup_container.style.display = "block";
}


// **************** EVENT LISTENERS *********************

document.querySelector("#clear-response").addEventListener("click", () => {
	document.querySelector(".response-container").style.display = "none";
});