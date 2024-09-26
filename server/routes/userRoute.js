import express from "express";
import {
  getOtherUsers,
  login,
  logout,
  register,
  getCurrentUser,
  deactivateUser,
  createUser,
  editUser,
  activateUser,
  checkToken,
  refreshToken,
} from "../controllers/userController.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isAdmin from "../middleware/isAdmin.js";

const router = express.Router();

router.route("/register").post(isAuthenticated, isAdmin, register);
router
  .route("/deactivate/:userId")
  .put(isAuthenticated, isAdmin, deactivateUser);
router.route("/activate/:userId").put(isAuthenticated, isAdmin, activateUser);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/me").get(isAuthenticated, getCurrentUser);
router.route("/").get(isAuthenticated, getOtherUsers);
router.post("/create", isAuthenticated, isAdmin, createUser);
router.put("/:userId", isAuthenticated, isAdmin, editUser);
// Route for checking token
router.get("/check-token", isAuthenticated, checkToken);

// Route for refreshing token
router.post("/refresh-token", refreshToken);

export default router;
