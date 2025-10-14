import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    _id: { type: String },
    title: { type: String, required: true },
    creatorPersonId: { type: String, ref: "Person" },
    assigneePersonId: { type: String, ref: "Person" },
    relatedCircularId: { type: String, ref: "Circular" },
    relatedClauseId: { type: String, ref: "Clause" },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Task", TaskSchema);
