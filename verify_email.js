window.addEventListener('load', async (event) => {
	document.body.classList.remove("preload"); // to prevent all animations before loaded

	const container = document.querySelector(".popup-container");
	const result = document.querySelector(".popup-container small");

	const popupTitle = document.querySelector(".popup-title");
	const popupBody = document.querySelector(".popup-body");
	const popupButton = document.querySelector(".popup-button");

	try {
		showProgressBar();
		container.style.display = "block";
		result.innerText = "";
		popupButton.style.display = "none";

		const urlParams = new URLSearchParams(window.location.search);
		const token = urlParams.get('token');

		const response = await pureFetch({
			ops: "verify email",
			link: `${api_base_url}/auth/verify-email`,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: { token },
		});

		if (response.success) {
			popupTitle.innerText = "Your email is verified.";
			popupBody.innerText = "Yo can navigate to login page.";
			popupButton.style.display = "block";

		} else {
			popupTitle.innerText = "Oooops !";
			popupBody.innerText = "Email verification is failed.";

			const error = response.error;
			
			if (error.code === 422)
				result.innerText = error.errors.token;
			else if (error.message.includes("expired")) {
				result.innerText = "The token is expired";
			} else if (error.message.includes("jwt") || error.message.includes("signature")) {
				result.innerText = "The token is wrong";
			} else {
				result.innerText = error.message;
			}
			
			result.classList.remove(...result.classList);
			result.classList.add("failure");
			result.style.display = "block";

			if (error.message.includes("jwt") || error.message.includes("signature") || error.message.includes("not valid")) {
				showBanner({message: "You can claim a new reset password link through the forgot password feature."});
			}
		}
		
	} catch (error) {
		console.error('Error:', error);

		result.innerText = error.message;
		result.classList.remove(...result.classList);
		result.classList.add("failure");
		result.style.display = "block";
		
	} finally {
		removeProgressBar();
	}
});