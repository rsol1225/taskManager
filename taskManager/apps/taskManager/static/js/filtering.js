async function fetchAndDisplayTasks(filter) {
	const taskAssignedManagers = (await axios.get("/taskManager/api/getManaging"))
		.data;
	const response = await axios.get(`/taskManager/api/task`);
	const tasks = response.data;

	const tasksContainer = document.getElementById("roleName");
	tasksContainer.innerHTML = "";

	const filteredTaskList = await filterTasks(tasks, filter);
	console.log("tasks: ", tasks, "filter: ", filter);

	if (filteredTaskList.length > 0) {
		// Create a card for each role
		const roleCard = document.createElement("div");
		roleCard.className = "column";

		// Create a card for each task within the role
		for (const task of filteredTaskList) {
			const roleCard = document.createElement("div");
			roleCard.className = "card";
			tasksContainer.appendChild(roleCard);

			let uidOfCreator = task.created_by;
			let taskCreatorUsername = "user not found";
			if (uidOfCreator != null) {
				try {
					const uidResponse = await axios.get(
						`/taskManager/api/user/${uidOfCreator}`
					);
					taskCreatorUsername = uidResponse.data.username;
				} catch (error) {
					console.error(
						`Error fetching creator username for UID ${uidOfCreator}`,
						error
					);
				}
			}

			let uidOfAssignedTo = task.assigned_to;
			let taskAssignedToUsername = "user not found";
			if (uidOfAssignedTo != null) {
				try {
					const uidResponse = await axios.get(
						`/taskManager/api/user/${uidOfAssignedTo}`
					);
					taskAssignedToUsername = uidResponse.data.username;
				} catch (error) {
					console.error(
						`Error fetching assigned-to username for UID ${uidOfAssignedTo}`,
						error
					);
				}
			}

			const roleCardHead = document.createElement("div");
			roleCardHead.className = "card-header";
			roleCardHead.innerHTML = `<p class="card-header-title">${task.title}</p>`;
			roleCard.appendChild(roleCardHead);

			const taskContent = document.createElement("div");
			taskContent.className = "card-content";
			taskContent.innerHTML = `
                <p><strong>Description:</strong> ${task.description}</p>
                <p><strong>Created On:</strong> ${task.created_on}</p>
                <p><strong>Created By:</strong> ${taskCreatorUsername}</p>
                <p><strong>Assigned To:</strong> ${taskAssignedToUsername}</p>
                <p><strong>Deadline:</strong> ${task.deadline}</p>
                <p><strong>Status:</strong> ${task.status}</p>`;

			if (taskAssignedManagers.includes(task.created_by)) {
				taskContent.innerHTML += `<button class="editButton" id="${task.id}">Edit</button>`;
			}

			taskContent.innerHTML += `<button class="commentButton" id="${task.id}">View Comments</button><hr>`;
			roleCard.appendChild(taskContent);
		}
		tasksContainer.appendChild(roleCard);
	}

	editButtonEventListener();
	commentButtonEventListener();
}

let currentUserID = null;

// Getting the current userID
async function getCurrentUserID() {
	currentUserID = null;
	const res = await axios.get(`/taskManager/api/userID`, {});
	const resData = res.data;
	currentUserID = resData.id;

	return currentUserID;
}

async function filterTasks(taskList, filter) {
	let fetchedMangerData;
	const userSelected = document.getElementById("userSelect").value;
	switch (filter) {
		case "dateCreated":
			console.log("dateCreated");
			return taskList.sort(
				(a, b) => new Date(b.created_on) - new Date(a.created_on)
			);
		case "deadline":
			return taskList.sort(
				(a, b) => new Date(a.deadline) - new Date(b.deadline)
			);
		case "status":
			const statusOrder = {
				pending: 1,
				acknowledged: 2,
				rejected: 3,
				completed: 4,
				failed: 5,
			};
			return taskList.sort(
				(a, b) => (statusOrder[a.status] || 6) - (statusOrder[b.status] || 6)
			);
		case "createdBySelf":
			currentUserID = await getCurrentUserID();
			return taskList.filter((task) => task.created_by == currentUserID);
		case "assignedToSelf":
			currentUserID = await getCurrentUserID();
			return taskList.filter((task) => task.assigned_to == currentUserID);
		case "createdByUser":
			console.log("createdByUser currentUser: ", userSelected);
			return taskList.filter((task) => task.created_by == userSelected);
		case "assignedToUser":
			console.log("assignedToUser currentUser: ", userSelected);
			return taskList.filter((task) => task.assigned_to == userSelected);
		case "createdByManager":
			console.log("createdByManager filter");
			let response1 = await axios.get(
				`/taskManager/api/tasksCreatedByManagedUsers`
			);
			let tasks1 = response1.data;
			console.log("tasks, ", tasks1);

			return tasks1;
		case "assignedToManager":
			console.log("AssignedToManager filter");
			let response2 = await axios.get(
				`/taskManager/api/tasksAssignedToManagedUsers`
			);
			let tasks2 = response2.data;
			console.log("tasks, ", tasks2);
			return tasks2;
		// add code for filtering this here
		default:
			return taskList;
	}
}

// function to add to html but not needed because I did it together^
function createTaskCard(task) {
	const taskCard = document.createElement("div");
	taskCard.className = "card";

	const roleCardHead = document.createElement("div");
	roleCardHead.className = "card-header";
	roleCardHead.innerHTML = `<p class="card-header-title">${task.title}</p>`;
	taskCard.appendChild(roleCardHead);

	const taskContent = document.createElement("div");
	taskContent.className = "card-content";
	taskContent.innerHTML = `
        <p><strong>Description:</strong> ${task.description}</p>
        <p><strong>Created On:</strong> ${task.created_on}</p>
        <p><strong>Created By:</strong> ${task.created_by}</p>
        <p><strong>Assigned To:</strong> ${task.assigned_to}</p>
        <p><strong>Deadline:</strong> ${task.deadline}</p>
        <p><strong>Status:</strong> ${task.status}</p>`;
	taskCard.appendChild(taskContent);
	return taskCard;
}

async function handleFilterChange(event) {
	let userSelectContainer = document.getElementById("userSelectContainer");
	let userSelect = document.getElementById("userSelect");
	userSelectContainer.style.display = "none";
	const filter = document.getElementById("filter").value;
	console.log("filter selected: ", filter);

	if (filter == "assignedToUser" || filter == "createdByUser") {
		console.log("userSelected: ", userSelect.value);
		userSelectContainer.style.display = "block";
		userSelect.innerHTML = "";
		await axios
			.get("/taskManager/api/user")
			.then((response) => {
				response.data.forEach((user) => {
					const option = document.createElement("option");
					option.value = user.created_by;
					option.textContent = user.name;
					userSelect.appendChild(option);
				});
			})
			.catch((error) => {
				console.error("Error fetching current user:", error);
			});
	}

	console.log;
	await fetchAndDisplayTasks(filter);
}

async function handleUserChange(event) {
	let userSelectContainer = document.getElementById("userSelectContainer");
	let userSelect = document.getElementById("userSelect");
	const filter = document.getElementById("filter").value;

	await fetchAndDisplayTasks(filter);
}

document
	.getElementById("filter")
	.addEventListener("change", handleFilterChange);

document
	.getElementById("userSelect")
	.addEventListener("change", handleUserChange);

/**
 * Fetches all managers from the "/taskManager/api/getAllManagers" endpoint and formats the response into a Map.
 * The Map's keys are the manager IDs and the values are all set to true.
 * @async
 * @returns {Promise<Map>} A Promise that resolves to a Map with manager IDs as keys and true as values.
 */
async function fetchAllMangers() {
	let requestObject = await axios
		.get("/taskManager/api/getAllManagers", {})
		.then((data) => {
			return data.data;
		});

	var MapFormattedMangerIds = new Map();
	for (let i = 0; i < requestObject.length; i++) {
		MapFormattedMangerIds.set(requestObject[i].manager, true);
	}

	return MapFormattedMangerIds;
}

window.onload = async () => {
	await getCurrentUserID();
	const filter = document.getElementById("filter").value;
	fetchAndDisplayTasks(filter);
};
