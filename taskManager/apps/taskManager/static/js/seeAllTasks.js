async function displayTask() {
	// tasks = [];
	// let taskAssignedManagers = (await axios.get("/taskManager/api/getManaging"))
	// 	.data;
	// let tasksAsyncRequest = await axios
	// 	.get(`/taskManager/api/task`, {})
	// 	.then((res) => {
	// 		tasks = res.data;
	// 		let testOuput = filterCreatedById(tasks, {
	// 			filter: "created_by",
	// 			id: 3,
	// 		});
	// 		// console.log(testOuput);

	// 		for (let i = 0; i < res.data.length; i++) {
	// 			const roleElement = document.getElementById("roleName");
	// 			const roleCard = document.createElement("div");
	// 			roleCard.className = "card";
	// 			roleElement.appendChild(roleCard);

	// 			const roleCardHead = document.createElement("div");
	// 			roleCardHead.className = "card-header";
	// 			roleCardHead.innerHTML = `<p class="card-header-title">${tasks[i].title}</p>`;
	// 			roleCard.appendChild(roleCardHead);

	// 			const taskContent = document.createElement("div");
	// 			taskContent.className = "card-content";
	// 			taskContent.innerHTML = `<p><strong>Description:</strong> ${tasks[i].description}</p>
	//         <p><strong>Created On:</strong> ${tasks[i].created_on}</p>
	//         <p><strong>Created By:</strong> ${tasks[i].created_by}</p>
	//         <p><strong>Assigned To:</strong> ${tasks[i].assigned_to}</p>
	//         <p><strong>Deadline:</strong> ${tasks[i].deadline}</p>
	//         <p><strong>Status:</strong> ${tasks[i].status}</p>`;
	// 			if (taskAssignedManagers.includes(tasks[i].created_by)) {
	// 				taskContent.innerHTML += `<button class="editButton" id = ${tasks[i].id}>Edit</button>`;
	// 			}

	// 			taskContent.innerHTML += `<button class="commentButton" id = "${tasks[i].id}">View Comments</button><hr>`;
	// 			roleCard.appendChild(taskContent);
	// 		}
	// 	});
	// editButtonEventListener();
	// commentButtonEventListener();
	await fetchAndDisplayTasks();
}



// document
// 	.getElementById("userSelect")
// 	.addEventListener("change", handleUserChange);


document
  .getElementById("refreshSeeAllTask")
  .addEventListener("click", async function () {

    let userSelectContainer = document.getElementById("userSelectContainer");
    let userSelect = document.getElementById("userSelect");
    const filter = document.getElementById("filter").value;

    await fetchAndDisplayTasks(filter);
  });

displayTask();

/**
 * This function is utility function to filter by a number used for id of users
 * @param {Object} array - The array object with jsons [{}, {}]
 * @param {Object} json -> filterJson string, number - The JSON object with string, number
 * @property {string} filterJson.a - what jsonValue we are filtering by
 * @property {number} filterJson.b - The id
 * @returns {Object} array with jsons
 * */
function filterCreatedById(globalTasksInput, filterJson) {
	let filterData = [];

	let filter = false;
	console.log(globalTasksInput[0]);
	if (filterJson.filter in globalTasksInput[0]) {
		console.log("in the globalTasksInput");
		filter = true;
	} else {
		console.log("not int he globalTasksInput or empty");
	}
	if (filter) {
		filterData = globalTasksInput.filter(
			(task) => task[filterJson.filter] == filterJson.id
		);
	}
	console.log(filterData);
	return filterData;
}
