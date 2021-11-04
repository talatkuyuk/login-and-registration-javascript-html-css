window.fbAsyncInit = function() {
	FB.init({
		appId            : '283278613273723',
		autoLogAppEvents : true,
		xfbml            : true,
		version          : 'v12.0'
	});

	FB.Event.subscribe('xfbml.render', finished_rendering);

	// Option-1
	FB.Event.subscribe('auth.statusChange', statusChangeCallback);
	//FB.getLoginStatus();

	// Option-2 (does not work without event subscription above)
	// FB.getLoginStatus(function(response) {
	// 		statusChangeCallback(response);
	// });
};


const statusChangeCallback = async function(response) {
	try {
		console.log("auth_status_change_callback: " + response.status);
	
		if (response.status === 'connected') {
			const accessToken = response.authResponse.accessToken;
			const userID = response.authResponse.userID;
	
			const result = await fbGetProfile(userID);
	
			console.log(result);
	
			const payload = { 
				sub: result.id,
				email: result.email,
				name: result.name,
				picture: result.picture.data.url,
			};
	
			sendTokenToBackend(accessToken, "facebook", "bearer");
	
		} else {
			// removeTheCard("facebook");
		}
		
	} catch (error) {
		console.log(error);
	}
}


var finished_rendering = function() {
	console.log("finished rendering plugins");
	document.querySelectorAll('#spinner').forEach(e => e.remove());
}


const fbLogin = () => FB.login(function(response) {
	console.log("Logged in is successfull");
	console.log(response);
	if (response.authResponse) {
		accessToken = response.authResponse.accessToken;
	} else {
		console.log('User cancelled login or did not fully authorize.');
	}
}, {scope: 'email'});


const fbGetProfile = (userID) => {
	return new Promise((resolve, reject) => {
		console.log('Welcome!  Fetching your profile.... ');

		try {
			FB.api(`/${userID}?fields=name,email,picture`, function (response) {
				if (response.error)
					return reject(response.error);
				
				return resolve(response);
			});
			
		} catch (error) {
			console.log(error);
			return reject(error);
		}
	});
}