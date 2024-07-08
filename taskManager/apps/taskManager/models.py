"""
This file defines the database models
"""

from .common import *

from pydal.validators import *

db.define_table(
    "userData",
    Field("name", "string"),
    auth.signature,
    Field("manager", "reference auth_user"),
    Field("is_ceo", "boolean"),
)

db.define_table(
    "task",
    auth.signature,
    Field("title", "string", requires=IS_NOT_EMPTY()),
    Field("description", "text", requires=IS_NOT_EMPTY()),
    Field("created_on", "datetime", requires=IS_NOT_EMPTY()),
    Field("created_by", "reference auth_user", requires=IS_NOT_EMPTY()),
    Field("assigned_to", "reference auth_user", requires=IS_NOT_EMPTY()),
    Field("deadline", "datetime", requires=IS_NOT_EMPTY()),
    Field("status", "string", requires=IS_NOT_EMPTY()),
)

db.define_table(
    "comment",
    auth.signature,  # this is referencing the user
    Field("task", "reference task"),
    Field("content", "text"),
    Field("created_on", "datetime"),
)

db.commit()
