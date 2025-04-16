// controllers/home.controller.js
import axios from "axios";
import fs from "fs";
import FormData from "form-data";

export const getPrediction = async (req, res) => {
  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(req.file.path));

    const response = await axios.post("http://127.0.0.1:5000/predict", form, {
      headers: form.getHeaders(),
    });

    fs.unlinkSync(req.file.path); // cleanup
    res.json(response.data);
  } catch (err) {
    console.error("Prediction error:", err.message);
    res.status(500).json({ error: "Prediction failed" });
  }
};

export const getSegmentation = async (req, res) => {
  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(req.file.path));

    const response = await axios.post("http://127.0.0.1:5000/segment", form, {
      headers: form.getHeaders(),
    });

    fs.unlinkSync(req.file.path); // cleanup
    res.json(response.data);
  } catch (err) {
    console.error("Segmentation error:", err.message);
    res.status(500).json({ error: "Segmentation failed" });
  }
};
