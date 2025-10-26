import express from "express";

import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
  updateUserPrivilege,
  getSessions,
  addSession,
  getCompletedQuestions,
  addCompletedQuestion,
} from "../controller/user-controller.js";
import {
  verifyAccessToken,
  verifyIsAdmin,
  verifyIsOwnerOrAdmin,
} from "../middleware/basic-access-control.js";

const router = express.Router();

router.get("/", verifyAccessToken, verifyIsAdmin, getAllUsers);

router.patch(
  "/:id/privilege",
  verifyAccessToken,
  verifyIsAdmin,
  updateUserPrivilege
);

router.post("/", createUser);

router.get("/:id", verifyAccessToken, verifyIsOwnerOrAdmin, getUser);

router.patch("/:id", verifyAccessToken, verifyIsOwnerOrAdmin, updateUser);

router.delete("/:id", verifyAccessToken, verifyIsOwnerOrAdmin, deleteUser);

// User session routes

router.get("/:id/sessions", verifyAccessToken, getSessions);

router.post("/:id/sessions", verifyAccessToken, addSession);

// Completed questions routes

router.get("/:id/completed-questions", verifyAccessToken, getCompletedQuestions);

router.post("/:id/completed-questions", verifyAccessToken, addCompletedQuestion);

export default router;
