import express from "express";
import path from "path";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middlewares/auth.js";
import router from "./routes.js";
import { connectMongo } from "./db.js";
import Person from "./models/Person.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 8000;

app.use(express.json());
app.use(express.static(path.resolve("./public")));
app.use(authMiddleware);

app.use("/api", router);

app.post("/signup", async (req, res) => {
  try {
    const {
      username,
      email,
      name,
      deptId,
      directManagerId,
      personId: providedPersonId,
    } = req.body;

    if (!username || !name) {
      return res.status(400).json({ error: "Username and name are required" });
    }

    // Connect to MongoDB
    await connectMongo();

    // Create userId with "u-" prefix from username
    const userId = username.startsWith("u-") ? username : `u-${username}`;

    // Use provided personId or generate from username
    const personId = providedPersonId || username;

    // Check if person already exists by personId or userId
    const existingPerson =
      (await Person.findById(personId)) || (await Person.findOne({ userId }));
    if (existingPerson) {
      // User exists, sign in by generating JWT token
      const token = jwt.sign(
        { username: userId, email, personId: existingPerson._id },
        process.env.JWT_SECRET || "mysupersecret"
      );

      return res.json({
        username: userId,
        personId: existingPerson._id,
        token,
        person: existingPerson,
      });
    }

    // User does not exist, create new person

    // Create new person in database matching existing pattern
    const newPerson = await Person.create({
      _id: personId,
      userId: userId,
      name: name,
      deptId: deptId || null,
      directManagerId: directManagerId || null,
    });

    // Generate JWT token
    const token = jwt.sign(
      { username: userId, email, personId },
      process.env.JWT_SECRET || "mysupersecret"
    );

    return res.json({
      username: userId,
      personId: personId,
      token,
      person: newPerson,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res
      .status(500)
      .json({ error: "Failed to create user", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT :${PORT}`);
});
