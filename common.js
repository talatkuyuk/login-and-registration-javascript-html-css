const api_base_url = "https://authouse.herokuapp.com";

async function pureFetch ({ ops, link, method, headers, body}) {
	try {
		let response = await fetch(link, {
			method,
			headers,
			...(body && {
				body: JSON.stringify(body),
			}),
		});
	
		const text = await response.text();
		const data = text ? JSON.parse(text) : {};
		// const data = await response.json();
	
		console.log(`pureFetch: ${ops}`);
		console.log(data);
	
		return data;
		
	} catch (error) {
		throw error;
	}
}


async function secureFetch ({ ops, link, method, tokens, headers, body}) {
	try {
		let response = await fetch(link, {
			method,
			...(headers && {
				headers: {
					...headers,
					'Authorization': `Bearer ${tokens.access.token}`
				} 
			}),
			...(body && {
				body: JSON.stringify(body),
			}),
		});
	
		const text = await response.text();
		let data = text ? JSON.parse(text) : {};
	
		console.log(`secureFetch: first try (${ops})`);
		console.log(data);
	
		if (data.name === "TokenExpiredError") {
			const result = await refreshTokens(tokens);
	
			if (result.code) return result;
	
			response = await fetch(link, {
				method,
				...(headers && {
					headers: {
						...headers,
						'Authorization': `Bearer ${result.access.token}`
					} 
				}),
				...(body && {
					body: JSON.stringify(body),
				}),
			});
	
			const text = await response.text();
			data = text ? JSON.parse(text) : {};
			// data = await response.json();
	
			console.log(`secureFetch: second try (${ops})`);
			console.log(data);
		}
	
		return data;
		
	} catch (error) {
		throw error;
	}
}


async function refreshTokens (tokens) {
	const data = await pureFetch({
		ops: "refresh tokens",
		link: `${api_base_url}/auth/refresh-tokens`,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: { refreshToken: tokens.refresh.token },
	});

	if (data.code) {
		return data;

	} else {
		store.tokens = data;
		localStorage.setItem('data', JSON.stringify(store));
		return data;
	}
}


// ***********  NAVIGATION  *******************

async function gotoLoginPage({ delay }) {
	localStorage.clear();

	const go = () => window.location.replace(`/login.html`);

	if (delay)
		await new Promise(resolve => setTimeout(resolve, 5000)).then(() => go());
	else
		go();
}

function gotoPage(path) {
	window.location.replace(`/${path}`);
}

function saveState() {
	localStorage.setItem('data', JSON.stringify(store));
}


// ***********  UTILS  *******************

function showBanner(data) {
	const banner = document.querySelector(".banner");
	const bannerMessage = document.querySelector(".banner-message");

	bannerMessage.innerText =  data.code === 422
		? data.errors.refreshToken
		: bannerMessage.innerText = data.message;
	
	banner.classList.add("show");
}

function removeBanner() {
	const banner = document.querySelector(".banner");
	banner && (banner.classList.remove("show"));
}

function showEmailInHeader(email) {
	const header_email = document.querySelector("span[id='header-email']");
	header_email && (header_email.innerText = email);
}

function showProgressBar(id) {
	if (id) {
		const progress_bar = document.getElementById(id);
		progress_bar.style.display = "block";
	} else {
		const progress_bar = document.getElementById("progress-bar");
		progress_bar.style.display = "block";
	}
}

function removeProgressBar(id) {
	if (id) {
		const progress_bar = document.getElementById(id);
		progress_bar.style.display = "none";
	} else {
		const progress_bar = document.getElementById("progress-bar");
		progress_bar.style.display = "none";
	}
}

function showSpinner() {
	const loading_spinner = document.querySelector(".loading-spinner");
	loading_spinner && (loading_spinner.style.display = "flex");
}

function removeSpinner() {
	const loading_spinner = document.querySelector(".loading-spinner");
	loading_spinner && (loading_spinner.style.display = "none");
}

function clearErrors() {
	document.querySelectorAll("small").forEach((small) => small.innerText = "");
}

function getRandomElements(arr, max) {
	let len = arr.length;
	let n = Math.floor(Math.random() * (max===undefined?len:max) + 1);
    const result = new Array(n);
    const taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

function stringToElement(string) {
    var parser = new DOMParser(),
    content = 'text/html',
    DOM = parser.parseFromString(string, content);
    return DOM.body.childNodes[0];
}

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}


// **************** EVENT LISTENERS *********************

const logoutButton = document.querySelector("#logout-button")
logoutButton && logoutButton.addEventListener("click", () => {
	gotoLoginPage({ delay: false });
});

const closeBanner = document.querySelector("#close-banner")
closeBanner && closeBanner.addEventListener("click", () => {
	removeBanner();
});


// ***********  STATUS BAR  *******************

let online = () => {
	const statusBar = document.querySelector("#status-bar");
	statusBar && (statusBar.style.backgroundColor = "#006600");
}

let offline = () => {
	const statusBar = document.querySelector("#status-bar");
	statusBar && (statusBar.style.backgroundColor = "#E02401");
}

if (window.navigator.onLine)
	online();
else 
	offline();

window.addEventListener("online", online);
window.addEventListener("offline", offline);
