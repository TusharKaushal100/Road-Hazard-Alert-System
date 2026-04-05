// backend/routes/posts.js
import express from "express";
import { createPost, getPosts, getPostsByCityState } from "../controllers/postController.js";

const router = express.Router();

router.post("/", createPost);
router.get("/", getPosts);
router.get("/city", getPostsByCityState);

export default router;