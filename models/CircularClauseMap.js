import mongoose from "mongoose";

const CircularClauseMapSchema = new mongoose.Schema(
  {
    circularId: { type: String, ref: "Circular", required: true },
    clauseId: { type: String, ref: "Clause", required: true },
  },
  { timestamps: true, versionKey: false, collection: "CircularClauseMap" }
);

CircularClauseMapSchema.index({ circularId: 1, clauseId: 1 }, { unique: true });

export default mongoose.model("CircularClauseMap", CircularClauseMapSchema);
