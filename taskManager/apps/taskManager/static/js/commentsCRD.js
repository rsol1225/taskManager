"use strict";

const commentCloseBtn = document.querySelectorAll(".close")[1];
const commentContent = document.getElementById("commentContent");
const viewCommentModal = document.getElementById("viewCommentModal");
const submitComment = document.getElementById("submitComment");
const deleteComment = document.getElementById("deleteComment");

var taskIdCommenting = -1;

const showViewCommentModal = () => {
	viewCommentModal.style.display = "block";
	populateComments();
};

const hideViewCommentModal = () => {
	viewCommentModal.style.display = "none";
	taskIdCommenting = -1;
};

const postComment = async () => {
	console.log("submit comment pressed");
	let data = {};

	if (commentContent.value == "") {
		return;
	}

	data.content = commentContent.value;

	console.log("Task ID: ", taskIdCommenting, " Data to send:", data);

	axios
		.post(`/taskManager/api/comment/${taskIdCommenting}`, data)
		.then((response) => {
			console.log("Task updated successfully:", response.data);
			populateComments();
		})
		.catch((error) => {
			console.error("Error updating task:", error);
		});
};

const commentButtonEventListener = () => {
	const comments = document.querySelectorAll(".commentButton");
	comments.forEach(function (button) {
		button.addEventListener("click", function (event) {
			console.log("opening modal");
			taskIdCommenting = event.target.id;
			showViewCommentModal(); // Show modal if clicked
		});
	});

	console.log("adding event Listener", comments);
};

commentCloseBtn.addEventListener("click", hideViewCommentModal);
submitComment.addEventListener("click", postComment);

window.addEventListener("click", function (event) {
	if (event.target === viewCommentModal) {
		hideViewCommentModal();
	}
});

const populateComments = async () => {
	try {
		const response = await axios.get(
			`/taskManager/api/comment/${taskIdCommenting}`
		);

		const currentUID = (await axios.get("/taskManager/api/currentUser")).data
			.id;

		console.log(currentUID);
		console.log("response: ", response, taskIdCommenting);

		const commentsContainer = document.getElementById("commentsContainer"); // Make sure there's a container element in your HTML
		commentsContainer.innerHTML = ""; // Clear any existing comments

		for (const comment of response.data) {
			const commentDiv = document.createElement("div");
			const commenterResponse = await axios.get(
				`/taskManager/api/user/${comment.created_by}`
			);
			const commenterUsername = commenterResponse.data.username;
			commentDiv.classList.add("comment"); // Add a class for styling

			const createdBy = document.createElement("p");
			createdBy.textContent = `Created by: ${commenterUsername}`;

			const createdAt = document.createElement("p");
			createdAt.textContent = `Created at: ${comment.created_on}`;

			const commentContent = document.createElement("p");
			commentContent.textContent = comment.content; // Use `content` field for comment text

			commentDiv.appendChild(createdBy);
			commentDiv.appendChild(createdAt);
			commentDiv.appendChild(commentContent);

			if (currentUID === comment.created_by) {
				const deleteButton = document.createElement("button");
				deleteButton.textContent = "Delete";
				deleteButton.addEventListener("click", () => {
					handleDeleteComment(comment.id); // Use the renamed function
				});
				commentDiv.appendChild(deleteButton);
			}

			commentsContainer.appendChild(commentDiv);
		}

		// Scroll to the bottom after populating comments
		commentsContainer.scrollTop = commentsContainer.scrollHeight;
	} catch (error) {
		console.error("Error fetching comments:", error);
	}
};

// Renamed function to avoid naming conflict
const handleDeleteComment = async (commentId) => {
	try {
		await axios.delete(`/taskManager/api/comment/${commentId}`);
		// Re-populate comments to reflect the deletion
		await populateComments();
	} catch (error) {
		console.error("Error deleting comment:", error);
	}
};
