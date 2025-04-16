// routes/home.route.js
import express from "express";
import multer from "multer";
import { getPrediction, getSegmentation } from "../controllers/home.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), getPrediction);
router.post("/segment", upload.single("file"), getSegmentation);

export default router;
