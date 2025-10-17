import mongoose from "mongoose";

const PrsntaskmapSchema = new mongoose.Schema(
  {
    taskId: { type: String, ref: "Task", required: true },
    personId: { type: String, ref: "Person", required: true },
    role: { type: String, enum: ["creator", "assignee"], required: true },
  },
  { timestamps: true, versionKey: false, collection: "Prsntaskmap" }
);

PrsntaskmapSchema.index({ taskId: 1, personId: 1, role: 1 }, { unique: true });

export default mongoose.model("Prsntaskmap", PrsntaskmapSchema);
