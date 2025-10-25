import bcrypt from "bcrypt";
import { isValidObjectId } from "mongoose";
import {
  createUser as _createUser,
  deleteUserById as _deleteUserById,
  findAllUsers as _findAllUsers,
  findUserByEmail as _findUserByEmail,
  findUserById as _findUserById,
  findUserByUsername as _findUserByUsername,
  findUserByUsernameOrEmail as _findUserByUsernameOrEmail,
  updateUserById as _updateUserById,
  updateUserPrivilegeById as _updateUserPrivilegeById,
  createUserSessionById as _createUserSessionById,
  deleteUserSessionBySessionId as _deleteUserSessionBySessionId,
} from "../model/repository.js";
import UserModel from "../model/user-model.js";

export async function createUser(req, res) {
  try {
    const { name, username, email, password } = req.body;
    if (name && username && email && password) {
      const existingUser = await _findUserByUsernameOrEmail(username, email);
      if (existingUser) {
        return res
          .status(409)
          .json({ message: "username or email already exists" });
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      const createdUser = await _createUser(
        name,
        username,
        email,
        hashedPassword
      );
      return res.status(201).json({
        message: `Created new user ${username} successfully`,
        data: formatUserResponse(createdUser),
      });
    } else {
      return res
        .status(400)
        .json({ message: "username and/or email and/or password are missing" });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Unknown error when creating new user!" });
  }
}

export async function getUser(req, res) {
  try {
    const userId = req.params.id;
    if (!isValidObjectId(userId)) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }

    const user = await _findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: `User ${userId} not found` });
    } else {
      return res
        .status(200)
        .json({ message: `Found user`, data: formatUserResponse(user) });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Unknown error when getting user!" });
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await _findAllUsers();

    return res
      .status(200)
      .json({ message: `Found users`, data: users.map(formatUserResponse) });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Unknown error when getting all users!" });
  }
}

export async function updateUser(req, res) {
  try {
    const { name, username, email, password } = req.body;
    if (name || username || email || password) {
      const userId = req.params.id;
      if (!isValidObjectId(userId)) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }
      const user = await _findUserById(userId);
      if (!user) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }
      if (username || email) {
        let existingUser = await _findUserByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({ message: "username already exists" });
        }
        existingUser = await _findUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({ message: "email already exists" });
        }
      }

      let hashedPassword;
      if (password) {
        const salt = bcrypt.genSaltSync(10);
        hashedPassword = bcrypt.hashSync(password, salt);
      }
      const updatedUser = await _updateUserById(
        userId,
        name,
        username,
        email,
        hashedPassword
      );
      return res.status(200).json({
        message: `Updated data for user ${userId}`,
        data: formatUserResponse(updatedUser),
      });
    } else {
      return res.status(400).json({
        message:
          "No field to update: username and email and password are all missing!",
      });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Unknown error when updating user!" });
  }
}

export async function updateUserPrivilege(req, res) {
  try {
    const { isAdmin } = req.body;

    if (isAdmin !== undefined) {
      // isAdmin can have boolean value true or false
      const userId = req.params.id;
      if (!isValidObjectId(userId)) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }
      const user = await _findUserById(userId);
      if (!user) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }

      const updatedUser = await _updateUserPrivilegeById(
        userId,
        isAdmin === true
      );
      return res.status(200).json({
        message: `Updated privilege for user ${userId}`,
        data: formatUserResponse(updatedUser),
      });
    } else {
      return res.status(400).json({ message: "isAdmin is missing!" });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Unknown error when updating user privilege!" });
  }
}

export async function deleteUser(req, res) {
  try {
    const userId = req.params.id;
    if (!isValidObjectId(userId)) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }
    const user = await _findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }

    await _deleteUserById(userId);
    return res
      .status(200)
      .json({ message: `Deleted user ${userId} successfully` });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Unknown error when deleting user!" });
  }
}

export function formatUserResponse(user) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
  };
}

export async function addSession(req, res) {
  try {
    const { session } = req.body;
    if (session) {
      const userId = req.params.id;
      if (!isValidObjectId(userId)) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }
      if (
        !session.peerUserId ||
        !session.startTimestamp ||
        !session.endTimestamp ||
        !session.duration ||
        !session.questionId ||
        !session.question
      ) {
        return res.status(400).json({
          message: "Session data is malformed.",
        });
      }
      const user = await _findUserById(userId);
      if (!user) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }

      const updatedUser = await _createUserSessionById(userId, session);

      return res.status(200).json({
        message: `Updated sessions for user ${userId}`,
        data: formatUserResponse(updatedUser),
      });
    } else {
      return res.status(400).json({
        message: "Session is missing!",
      });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Unknown error when adding session!" });
  }
}

export async function getSessions(req, res) {
  try {
    const userId = req.params.id;
    if (!isValidObjectId(userId)) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }
    const user = await _findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }

    return res.status(200).json({
      message: `Got user sessions for ${userId}`,
      data: user.sessions,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not fetch sessions!" });
  }
}

export async function deleteSession(req, res) {
  try {
    const userId = req.params.id;
    const sessionId = req.params.sessionId;
    if (!isValidObjectId(userId) || !isValidObjectId(sessionId)) {
      return res
        .status(404)
        .json({ message: `User ${userId} or Session ${sessionId} not found` });
    }
    const user = await _findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }

    await _deleteUserSessionBySessionId(sessionId);
    return res.status(200).json({
      message: `Deleted session ${sessionId} from user ${userId}`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not delete session!" });
  }
}

export async function getStatistics(req, res) {
  try {
    const userId = req.params.id;
    if (!isValidObjectId(userId)) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }
    const user = await _findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }

    const sessions = user.sessions || [];

    const totalMinutes = sessions.reduce((total, session) => {
      return total + (session.duration || 0);
    }, 0);
    const hoursPracticed = totalMinutes / 60;

    const uniquePeerIds = [
      ...new Set(sessions.map((session) => session.peerUserId)),
    ];

    const peerUsers = await UserModel.find(
      { _id: { $in: uniquePeerIds } },
      { _id: 1, name: 1, username: 1 }
    );

    const peerMap = peerUsers.reduce((map, peer) => {
      map[peer._id.toString()] = {
        name: peer.name,
        username: peer.username,
      };
      return map;
    }, {});

    return res.status(200).json({
      message: `Got user session statistics for ${userId}`,
      data: {
        totalSessions: sessions.length,
        hoursPracticed: parseFloat(hoursPracticed.toFixed(2)),
        peersMet: uniquePeerIds.length,
        sessions: sessions.map((session) => ({
          ...session.toObject(),
          peerName: peerMap[session.peerUserId]?.name || "Unknown",
          peerUsername: peerMap[session.peerUserId]?.username || "Unknown",
        })),
      },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Could not fetch user session statistics!" });
  }
}
