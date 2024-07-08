let resData = {};

window.onload = async () => {
	console.log("here");
	try {
		const res = await axios.get(`/taskManager/api/currentUser1`, {});
		resData = res.data;
		document.getElementById("name").innerHTML = resData.userName;
		document.getElementById("manager").innerHTML = resData.managerName;
		document.getElementById("ID").innerHTML = resData.ID;
	} catch (error) {
		console.error("Error fetching user data:", error);
	}
};

function redirectToLogout() {
    window.location.href = '/taskManager/auth/logout';
}