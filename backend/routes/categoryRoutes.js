import express from "express";
const router = express.Router();
import {
  createCategory,
  updateCategory,
  removeCategory,
  listCategory,
  readCategory,
} from "../controllers/categoryController.js";

import {
  authenticate,
  authorizedAdmin,
} from "../middlewares/authMiddleware.js";

router.route("/").post(authenticate, authorizedAdmin, createCategory); // create a category
router.route("/:categoryId").put(authenticate, authorizedAdmin, updateCategory); // update a category
router
  .route("/:categoryId")
  .delete(authenticate, authorizedAdmin, removeCategory); // remove category
router.route("/categories").get(listCategory); // retrieve category
router.route("/:id").get(readCategory); // retrieve specific category

export default router;
