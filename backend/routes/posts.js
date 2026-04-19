import express from "express";
import { createPost, getPosts, getPostsByCityState } from "../controllers/postController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

console.log("Post routes loaded");


router.get("/",     getPosts);
router.get("/city", getPostsByCityState);


router.post("/", authMiddleware, createPost);

export default router;