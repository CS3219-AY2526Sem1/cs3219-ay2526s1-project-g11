import UserModel from "./user-model.js";
import { connect } from "mongoose";

export async function connectToDB() {
  let mongoDBUri =
    process.env.ENV === "PROD"
      ? process.env.DB_CLOUD_URI
      : process.env.DB_LOCAL_URI;

  await connect(mongoDBUri);
}

export async function createUser(name, username, email, password) {
  return new UserModel({ name, username, email, password }).save();
}

export async function findUserByEmail(email) {
  return UserModel.findOne({ email });
}

export async function findUserById(userId) {
  return UserModel.findById(userId);
}

export async function findUserByUsername(username) {
  return UserModel.findOne({ username });
}

export async function findUserByUsernameOrEmail(username, email) {
  return UserModel.findOne({
    $or: [{ username }, { email }],
  });
}

export async function findAllUsers() {
  return UserModel.find();
}

export async function updateUserById(userId, name, username, email, password) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        name,
        username,
        email,
        password,
      },
    },
    { new: true } // return the updated user
  );
}

export async function updateUserPrivilegeById(userId, isAdmin) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        isAdmin,
      },
    },
    { new: true } // return the updated user
  );
}

export async function deleteUserById(userId) {
  return UserModel.findByIdAndDelete(userId);
}

export async function createUserSessionById(userId, session) {
  return UserModel.findByIdAndUpdate(userId, {
    $push: {
      sessions: session,
    },
  });
}

export async function getCompletedQuestionsByUserId(userId) {
  const user = await UserModel.findById(userId).select("completedQuestions");
  return user ? user.completedQuestions : [];
}

export async function markQuestionCompleted(userId, questionId, sessionId) {
  // Update session status to completed and add questionId to completedQuestions if not already present
  return UserModel.findOneAndUpdate(
    { _id: userId, "sessions._id": sessionId },
    {
      $set: {
        "sessions.$.status": "completed",
      },
      $addToSet: {
        completedQuestions: questionId,
      },
    },
    { new: true }
  );
}
