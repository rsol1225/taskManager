// Get the modal
var createTaskModal = document.getElementById("createTaskBackground");

// Get the button that opens the modal
var btn = document.getElementById("createTaskButton");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("CreateTaskClose")[0];

// When the user clicks the button, open the modal
btn.onclick = function () {
	createTaskModal.style.display = "grid";
	console.log("AYYY")
	populateSelect('createTaskAssignToDropdown')
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
	createTaskModal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
	if (event.target == createTaskModal) {
		createTaskModal.style.display = "none";
	}
};

function clearCreateTaskForm() {
	document.getElementById("createTasktaskTitle").value = "";
	document.getElementById("createTasktaskDescription").value = "";
	document.getElementById("createTaskAssignToDropdown").value = "";
	document.getElementById("createTasknewTaskDeadline").value = "";
	document.getElementById("createTasktaskStatus").value = "";
}

function formatDeadline(deadline) {
	let deadlineFormat = deadline.replace("T", " ");
	deadlineFormat += ":00";
	return deadlineFormat;
}
function getAndFormatCreateTaskValues() {
	const title = document.getElementById("createTasktaskTitle").value;
	const description = document.getElementById(
		"createTasktaskDescription"
	).value;
	const assignedTo = document.getElementById("createTaskAssignToDropdown").value;
	const deadline = document.getElementById("createTasknewTaskDeadline").value;
	const status = document.getElementById("createTasktaskStatus").value;
	const deadlineFormat = formatDeadline(deadline);

	return {
		title: title,
		description: description,
		assigned_to: parseInt(assignedTo), // Convert to number
		deadline: deadlineFormat, // Format to "YYYY-MM-DD HH:MM:SS"
		status: status,
	};
}

function createTaskEventListener() {
	document
		.getElementById("createTasktaskForm")
		.addEventListener("submit", function (event) {
			event.preventDefault(); // Prevent the default form submission

			let createTaskContainer = document.getElementById("createTaskContainer");
			let createTaskSplashContainer = document.getElementById(
				"createTaskSplashContainer"
			);

			const data = getAndFormatCreateTaskValues();

			let fullUrl = window.location.href; // You can use window.location.href instead

			// Split the URL at each slash
			let urlParts = fullUrl.split("/");

			// Construct the base URL
			let baseUrl = urlParts[0] + "//" + urlParts[2] + "/";
			let currentUrl = baseUrl;

			if (!currentUrl.endsWith("/")) {
				currentUrl += "/";
			}
			let apiUrl = currentUrl + "taskManager/api/task";
			createTaskContainer.style.visibility = "none";
			createTaskSplashContainer.style.display = "flex";

			fetch(apiUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			})
				.then((response) => response.json())
				.then((data) => {
					console.log("Success:", data);
					clearCreateTaskForm();
					console.log("Task uploaded successfully!");
					let filterOption = document.getElementById("filter").value;
					fetchAndDisplayTasks(filterOption);
				})
				.catch((error) => {
					if (error.message.includes("404")) {
						alert(
							"The server can't find resources make sure the user id exists"
						);
					}
					console.log(error);

					console.error("Error:", error);
					alert("There was an error creating the task.");
				})
				.then(() => {
					createTaskContainer.style.visibility = "visible";
					createTaskSplashContainer.style.display = "none";
				});
		});
}

// Call the function to attach the event listener
createTaskEventListener();
