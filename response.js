window.addEventListener('load', (event) => {
	const data = localStorage.getItem('data');
	const parsedData = JSON.stringify(JSON.parse(data), null, 2);
	const response_container = document.getElementById("response");
	response_container.textContent = parsedData;
});

document.querySelector("#clear-backend-response").addEventListener("click", () => {
	localStorage.clear
	window.location.replace("https://localhost:5500/index.html");
})