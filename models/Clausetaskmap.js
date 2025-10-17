import mongoose from "mongoose";

const ClausetaskmapSchema = new mongoose.Schema(
  {
    clauseId: { type: String, ref: "Clause", required: true },
    taskId: { type: String, ref: "Task", required: true },
  },
  { timestamps: true, versionKey: false, collection: "Clausetaskmap" }
);

ClausetaskmapSchema.index({ clauseId: 1, taskId: 1 }, { unique: true });

export default mongoose.model("Clausetaskmap", ClausetaskmapSchema);
