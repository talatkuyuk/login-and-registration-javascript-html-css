
function handleGoogleCredentialResponse(response) {

	const idToken = response.credential;
	const payload = decodeJwtResponse(idToken);

	console.log('Logged in with: ' + payload.email);

	sendTokenToBackend(idToken, "google", "bearer");
}


window.onload = function () {

	google.accounts.id.initialize({
	  	client_id: "831846632-gsn4gqhumc1dmgv1tjupkivqo16g3330.apps.googleusercontent.com",
	  	callback: handleGoogleCredentialResponse
	});

	google.accounts.id.renderButton( document.getElementById("google-signin-button"), 
		{
			type: "standart",
			theme: "filled_blue",
			size: "large",
			width: 250,
			text: "continue_with",
			shape: "circular",
			locale: "en",
			logo_alignment: "left",
		}
	);
	// google.accounts.id.prompt(); // also display the One Tap dialog
}