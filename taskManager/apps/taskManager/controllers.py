import datetime
import json
from py4web import *
from yatl.helpers import A
from py4web.utils.form import *
from .common import *
from datetime import datetime
from py4web import URL


@action("api/getAllManagers", method="GET")
@action.uses(db)
# NOTE: MAKES SURE IT IS DISTINCT
def getAllManagers():
    managers = db(db.userData).select(db.userData.manager, distinct=True).as_list()
    return managers


@action("api/getPotentialManagers", method="GET")
@action.uses(db, auth)
# NOTE: MAKES SURE IT IS DISTINCT
def getPotentialManagers():
    user = auth.get_user()
    users = db(db.userData).select().as_list()

    # print(user)

    managedDict = {
        x["created_by"]: [
            {"id": y["created_by"], "name": y["name"]}
            for y in users
            if y["manager"] == x["created_by"]
        ]
        for x in users
    }
    allUsers = db(db.auth_user).select().as_list()

    if user["id"] not in managedDict:

        # print(user["id"])

        return list(filter(lambda x: user["id"] != x["id"], allUsers))

    queue = [user["id"]]
    visited = set()
    managed = list()
    while queue:
        current = queue.pop(0)
        managed.append(current)
        visited.add(current)
        for user in managedDict[current]:
            if user["id"] in visited:
                continue
            queue.append(user["id"])

    potentialManagers = list(filter(lambda x: x["id"] not in managed, allUsers))

    # print("potentialManagers: ", potentialManagers)

    return potentialManagers


@action("api/tasksCreatedByManagedUsers", method="GET")
@action.uses(db, auth)
def getTasksCreatedByManagedUsers():
    user = auth.get_user()
    actUser = user
    users = db(db.userData).select().as_list()

    # print(user)

    managedDict = {
        x["created_by"]: [
            {"id": y["created_by"], "name": y["name"]}
            for y in users
            if y["manager"] == x["created_by"]
        ]
        for x in users
    }
    allUsers = db(db.auth_user).select().as_list()

    if user["id"] not in managedDict:

        # print(user["id"])

        return list(filter(lambda x: user["id"] != x["id"], allUsers))

    queue = [user["id"]]
    visited = set()
    managed = list()
    while queue:
        current = queue.pop(0)
        managed.append(current)
        visited.add(current)
        for user in managedDict[current]:
            if user["id"] in visited:
                continue
            queue.append(user["id"])

    potentialManagers = list(filter(lambda x: x["id"] not in managed, allUsers))
    tasksCreatedByManaged = []

    # print("managed ", managed, " current user id ", user["id"])
    for uid in managed:

        if uid == actUser["id"]:
            continue
        tasksCreatedByManaged.extend(
            ((db(db.task.created_by == uid).select()).as_list())
        )

    # print(tasksCreatedByManaged)
    return tasksCreatedByManaged


@action("api/tasksAssignedToManagedUsers", method="GET")
@action.uses(db, auth)
def getTasksAssignedToManagedUsers():
    user = auth.get_user()
    actUser = user
    users = db(db.userData).select().as_list()

    # print(user)

    managedDict = {
        x["created_by"]: [
            {"id": y["created_by"], "name": y["name"]}
            for y in users
            if y["manager"] == x["created_by"]
        ]
        for x in users
    }
    allUsers = db(db.auth_user).select().as_list()

    if user["id"] not in managedDict:

        # print(user["id"])

        return list(filter(lambda x: user["id"] != x["id"], allUsers))

    queue = [user["id"]]
    visited = set()
    managed = list()
    while queue:
        current = queue.pop(0)
        managed.append(current)
        visited.add(current)
        for user in managedDict[current]:
            if user["id"] in visited:
                continue
            queue.append(user["id"])

    potentialManagers = list(filter(lambda x: x["id"] not in managed, allUsers))
    tasksCreatedByManaged = []

    # print("managed ", managed, " current user id ", user["id"])
    for uid in managed:

        if uid == actUser["id"]:
            continue
        tasksCreatedByManaged.extend(
            ((db(db.task.assigned_to == uid).select()).as_list())
        )

    print(tasksCreatedByManaged)
    return tasksCreatedByManaged


@action("api/getManaging", method="GET")
@action.uses(auth.user, T, db)
def getManagingUsers():
    user = auth.get_user()
    users = db(db.userData).select().as_list()

    managedDict = {
        x["created_by"]: [
            {"id": y["created_by"], "name": y["name"]}
            for y in users
            if y["manager"] == x["created_by"]
        ]
        for x in users
    }

    queue = [user["id"]]
    visited = set()
    managed = list()
    while queue:
        current = queue.pop(0)
        managed.append(current)
        visited.add(current)
        for user in managedDict[current]:
            if user["id"] in visited:
                continue
            queue.append(user["id"])
    return managed


@action("index")
@action.uses("index.html", auth.user, T, db)
def index():

    user = auth.get_user()

    if user:
        managedUsers = db(db.userData.created_by == user["id"]).select().as_list()
        if len(managedUsers) == 0:
            return redirect("/taskManager/static/setManager.html")

    return redirect("/taskManager/static/index.html")


def getManagerHierarchy(userId):
    """
    Returns a list of managers starting from the direct manager up to the top of the hierarchy.
    """
    hierarchy = list()
    currentUserId = userId
    while True:
        userData = db(db.userData.created_by == currentUserId).select().first()
        if userData.manager == currentUserId:
            break
        hierarchy.append(userData.manager)
        currentUserId = userData.manager
    return hierarchy


# Get the name and the manager of the auth user
@action("api/currentUser1", method="GET")
@action.uses(db, auth.user)
def currentUserInformation():
    user = auth.get_user()

    # user_name = user.first_name + " " + user.last_name

    user_data = (
        db(db.userData.created_by == auth.get_user()["id"])
        .select(db.userData.name)
        .first()
    )

    # getting the user's manager's id
    user_manager_row = (
        db(db.userData.created_by == auth.get_user()["id"])
        .select(db.userData.manager)
        .as_list()
    )

    user_manager_id = user_manager_row[0]["manager"]

    manager_name_dict = (
        db(db.auth_user.id == user_manager_id)
        .select(db.auth_user.first_name, db.auth_user.last_name)
        .first()
    )

    manager_name = (
        manager_name_dict["first_name"] + " " + manager_name_dict["last_name"]
    )

    allUserData = {}
    allUserData["userName"] = user_data["name"]
    allUserData["managerName"] = manager_name
    allUserData["ID"] = auth.get_user()["id"]

    return allUserData


"""manager = db.auth_user(user_manager_id)
    
    manager_name = manager.first_name + ' ' + manager.last_name

    return {
    "user": {
        "name": user_data.name,
        "manager": {
            "id": user_manager_id,
            "name": manager_name,
        }
        }
    } """

# return dict(user_manager_id = user_manager_id)


@action("users", method="GET")
@action.uses(db, auth.user)
def getUsers():
    user = auth.get_user()
    users = db(db.userData.name != user["username"]).select(
        db.auth_user.id, db.auth_user.username, distinct=True
    )
    print(users.as_list())
    return users.as_list()


@action("setmanager", method="PUT")
@action.uses(db, auth.user)
def setManager():
    user = auth.get_user()
    newManager = request.json["manager"]
    isCEO = request.json["isCeo"]

    # userDataRow = db(db.userData.name == user["username"]).select().first()
    # if userDataRow != None:
    #     return redirect("taskManager/static/home.html")
    if not isCEO:
        db.userData.update_or_insert(
            db.userData.name == user["username"],
            name=user["username"],
            manager=newManager,
            is_ceo=False,
        )
    else:
        db.userData.update_or_insert(
            db.userData.name == user["username"],
            name=user["username"],
            manager=user["id"],
            is_ceo=True,
        )


@action("api/currentUser", method="GET")
@action.uses(db, auth)
def retrieveCurrentUser():
    user = auth.get_user()

    if not user:
        return {
            "status": "failed to retrieve user creds",
            "error": "You must be logged in",
        }

    print("user: ", user)

    return user


"""

                id 1: ceo

                id 2: manager

                id 3: worker

                id 4: servant

ceo: ceo, manager, worker, servant
"""


@action("api/task/", method=["POST"])
@action.uses(auth, db)
def createTask():
    print(request.json)
    user = auth.get_user()
    # if not user:
    #     return {
    #         "status": "failed to update",
    #         "error": "You must be logged in to edit tasks",
    #     }
    # if not assignedUser:
    #     return {"status": "failed to update", "error": "Assigned user not found"}
    #
    # data = request.json
    # if not data:
    #     return {
    #         "status": "failed to update",
    #         "error": "Invalid request, JSON data required",
    #     }
    #
    # id = db.task.insert(**data)

    # user = auth.get_user()
    #
    # # NOTE: commented out for testing the create task page
    # # if not user:
    # #     return {
    # #         "status": "failed to update",
    # #         "error": "You must be logged in to edit tasks",
    # #     }
    id = db.task.insert(
        title=request.json["title"],
        description=request.json["description"],
        assigned_to=request.json["assigned_to"],
        deadline=request.json["deadline"],
        status=request.json["status"],
    )
    return {"id": id}


@action("api/task/<taskId:int>", method=["PUT", "DELETE"])
@action.uses(auth, db)
def editTask(taskId):
    user = auth.get_user()

    print("editTask ", user)

    if not user:
        return {
            "status": "failed to update",
            "error": "You must be logged in to edit tasks",
        }

    task = db.task(db.task.id == taskId)
    if not task:
        return {"status": "failed to update", "error": "Task not found"}

    assignedUser = db.auth_user(db.auth_user.id == task.created_by)
    if not assignedUser:
        return {"status": "failed to update", "error": "Assigned user not found"}

    managerHierarchy = getManagerHierarchy(task.created_by)

    if user["id"] != task.created_by and user["id"] not in managerHierarchy:
        return {
            "status": "failed to update",
            "error": "You do not have permission to edit this task",
        }

    data = request.json

    if request.method == "DELETE":
        deleted = db(db.task.id == task.id).delete()
        if deleted:
            return {
                "status": "success",
                "message": "Comment deleted successfully",
            }
        else:
            return {
                "status": "failed",
                "error": "Comment not found or unable to delete",
            }

    if not data:
        return {
            "status": "failed to update",
            "error": "Invalid request, JSON data required",
        }
    if request.method == "PUT":
        db(db.task.id == task.id).update(**data)
    if request.method == "DELETE":
        db(db.task.id == task.id).delete()

    return {"status": "updated", "errors": {}}


@action("api/task", method="GET")
@action.uses(auth, db)
def seeAllTasks():
    user = auth.get_user()

    if not user:
        return {
            "status": "failed to update",
            "error": "You must be logged in to edit tasks",
        }

    tasks = db(db.task).select().as_list()

    return tasks


@action("api/filter", method="GET")
@action.uses(auth, db)
def filterTasks():
    """
    this endpoint was written because we initally decided
    to do filtering on the backend

    but now we have changed to filtering on the
    frontend

    may just use the other task endpoint
    """
    user = auth.get_user()

    if not user:
        return {
            "status": "failed to update",
            "error": "You must be logged in to edit tasks",
        }

    users = db(db.userData).select(db.userData.name, db.userData.created_by)

    taskDict = {}
    for user in users:
        id = user.created_by
        name = user.name

        tasks = (
            db(db.task.assigned_to == id)
            .select(
                db.task.id,
                db.task.title,
                db.task.description,
                db.task.created_on,
                db.task.created_by,
                db.task.assigned_to,
                db.task.deadline,
                db.task.status,
            )
            .as_list()
        )
        taskDict[name] = tasks

    tasks_json = json.dumps(taskDict, default=str)
    return tasks_json


@action("api/user", method=["GET"])
@action.uses(auth, db)
def retrieveAllUsers():
    allUsers = db(db.userData).select().as_list()
    return allUsers


@action("api/user/<uid:int>", method=["GET"])
@action.uses(auth, db)
def UIDtoUsername(uid):
    q = db(db.auth_user.id == uid).select().as_list()

    if not q:
        return {"status": "failed", "error": "user not found"}

    user = q[0]

    return {"status": "success", "username": user["username"]}


@action("api/comment/<taskId:int>", method=["GET", "POST", "DELETE"])
@action.uses(auth, db)
def commentAPI(taskId):
    user = auth.get_user()

    # if not user:
    #     return {
    #         "status": "failed",
    #         "error": "You must be logged in",
    #     }

    if request.method == "GET":
        if not db(db.task.id == taskId).select():
            return {
                "status": "failed to get comment",
                "error": "need a valid taskId",
            }

        comments = db(db.comment.task == taskId).select()
        return comments.as_list()

    if request.method == "POST":
        data = request.json
        if not data:
            return {
                "status": "failed",
                "error": "Invalid request, JSON data required",
            }

        if not db(db.task.id == taskId).select():
            return {
                "status": "failed to add comment",
                "error": "need a valid taskId to comment",
            }

        data["task"] = taskId

        db.comment.insert(**data)

        return {
            "status": "success",
            "message": "Comment added successfully",
        }

    if request.method == "DELETE":
        deleted = db(
            db.comment.id == taskId
        ).delete()  # here, the taskID is treated as the commentID

        if deleted:
            return {
                "status": "success",
                "message": "Comment deleted successfully",
            }
        else:
            return {
                "status": "failed",
                "error": "Comment not found or unable to delete",
            }


# created by user's tasks
@action("api/createdByUserTasks", method="GET")
@action.uses(db, auth.user)
def createdByUserTasks():
    user = auth.get_user()
    user_tasks = db.task(db.task.created_by == auth.get_user()["id"])

    return user_tasks


# assigned to user's tasks
@action("api/assignedToUserTasks", method="GET")
@action.uses(db, auth.user)
def assignedToUserTasks():
    user = auth.get_user()
    user_tasks = db.task(db.task.assigned_to == auth.get_user()["id"])
    return user_tasks


# get userID
@action("api/userID", method="GET")
@action.uses(db, auth.user)
def userID():
    user = auth.get_user()

    userID = {}
    userID["id"] = auth.get_user()["id"]

    return userID


"""

These are forms I used to test the editPost API

@action("testCreateUserData", method=["GET", "POST"])
@action.uses("tests/testCreateUserData.html", auth.user, T, db)
def testEditPost(id=None):
    user = auth.get_user()
    form = Form(db.userData, id, deletable=False, formstyle=FormStyleDefault)
    rows = db(db.userData).select()
    return dict(form=form, rows=rows)



@action("testCreateTask", method=["GET", "POST"])
@action.uses("tests/testCreateTask.html", auth.user, T, db)
def testEditPost(id=None):
    user = auth.get_user()
    form = Form(db.task, id, deletable=False, formstyle=FormStyleDefault)
    rows = db(db.task).select()
    return dict(form=form, rows=rows)
"""
