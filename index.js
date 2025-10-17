import express from "express";
import path from "path";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middlewares/auth.js";
import router from "./routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 8000;

app.use(express.json());
app.use(express.static(path.resolve("./public")));
app.use(authMiddleware);

app.use("/api", router);

app.post("/signup", (req, res) => {
  const { username, email, personId } = req.body;
  const token = jwt.sign(
    { username, email, personId },
    process.env.JWT_SECRET || "mysupersecret"
  );
  return res.json({ username, token });
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT :${PORT}`);
});
