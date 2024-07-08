"use strict";

const editTaskModal = document.getElementById("editTaskModal");
const closeBtnEdit = document.querySelectorAll(".close")[0]; // Select the close button for the edit task modal
const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskAssignedTo = document.getElementById("taskAssignedTo");
const taskDeadline = document.getElementById("taskDeadline");
const taskStatus = document.getElementById("taskStatus");

const submitChanges = document.getElementById("submitChanges");
const deleteTask = document.getElementById("deleteTask");

var taskIdEditing = -1;

const showModal = () => {
	editTaskModal.style.display = "block";
	taskAssignedTo.innerHTML = "";
	console.log("showing modal");
	populateSelect();
};

const hideModal = () => {
	editTaskModal.style.display = "none";
	console.log(document.querySelectorAll(".close"));
	console.log("closing modal");
};

const deleteTaskRequest = () => {
	console.log("submit pressed");
	let data = {};

	if (taskTitle.value !== "") {
		data.title = taskTitle.value;
	}

	if (taskDescription.value !== "") {
		data.description = taskDescription.value;
	}

	if (taskAssignedTo.value !== "") {
		data.assigned_to = taskAssignedTo.value;
	}

	if (taskDeadline.value !== "") {
		data.deadline = taskDeadline.value.replace("T", " ");
		data.deadline += ":00";
	}

	console.log("deadline: ", taskDeadline.value);

	if (taskStatus.value !== "") {
		data.status = taskStatus.value;
	}

	console.log("Task ID: ", taskIdEditing, " Data to send:", data);

	axios
		.delete(`/taskManager/api/task/${taskIdEditing}`, { data })
		.then((response) => {
			console.log("Task updated successfully:", response.data);

			displayTask();
		})
		.catch((error) => {
			console.error("Error updating task:", error);
		});

	taskIdEditing = -1;
	hideModal();
};

const submit = () => {
	console.log("submit pressed");
	let data = {};

	if (taskTitle.value !== "") {
		data.title = taskTitle.value;
	}

	if (taskDescription.value !== "") {
		data.description = taskDescription.value;
	}

	if (taskAssignedTo.value !== "") {
		data.assigned_to = taskAssignedTo.value;
	}

	if (taskDeadline.value !== "") {
		data.deadline = taskDeadline.value.replace("T", " ");
		data.deadline += ":00";
	}

	console.log("deadline: ", taskDeadline.value);

	if (taskStatus.value !== "") {
		data.status = taskStatus.value;
	}

	console.log("Task ID: ", taskIdEditing, " Data to send:", data);

	axios
		.put(`/taskManager/api/task/${taskIdEditing}`, data)
		.then((response) => {
			console.log("Task updated successfully:", response.data);

			let filterOption = document.getElementById("filter").value;
			fetchAndDisplayTasks(filterOption);
		})
		.catch((error) => {
			console.error("Error updating task:", error);
		});

	taskIdEditing = -1;
	hideModal();
};

const deleteTheTask = () => {
	console.log("delete pressed");

	console.log("Task ID: ", taskIdEditing);
	let data = {};
	axios
		.delete(`/taskManager/api/task/${taskIdEditing}`, { data })
		.then((response) => {
			console.log("Task deleted successfully:", response.data);
			let filterOption = document.getElementById("filter").value;
			fetchAndDisplayTasks(filterOption);
		})
		.catch((error) => {
			console.error("Error updating task:", error);
		});

	taskIdEditing = -1;
	hideModal();
};

const editButtonEventListener = () => {
	const editButtons = document.querySelectorAll(".editButton");
	editButtons.forEach(function (button) {
		button.addEventListener("click", function (event) {
			taskIdEditing = event.target.id;
			showModal(); //show modal if clicked
		});
	});

	console.log("adding event Listener", editButtons);
};

const populateSelect = async (elementId='taskAssignedTo') => {
	const taskAssignedTo = document.getElementById(elementId);

	taskAssignedTo.innerHTML = ''

	axios
		.get("/taskManager/api/user")
		.then((response) => {
			response.data.forEach((user) => {
				const option = document.createElement("option");
				option.value = user.created_by;
				option.textContent = user.name;
				taskAssignedTo.appendChild(option);
			});
		})
		.catch((error) => {
			console.error("Error fetching current user:", error);
		});
};

// Ensure the correct button is selected and the event listener is added
closeBtnEdit.addEventListener("click", hideModal);
submitChanges.addEventListener("click", submit);
deleteTask.addEventListener("click", deleteTheTask);

window.addEventListener("click", function (event) {
	if (event.target === editTaskModal) {
		hideModal();
	}
});
