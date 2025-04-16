// server.js
import express from "express";
import cors from "cors";
import homeRoute from "./routes/home.route.js";

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/home", homeRoute);

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
