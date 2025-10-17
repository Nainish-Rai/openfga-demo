import mongoose from "mongoose";

const ReportingMapSchema = new mongoose.Schema(
  {
    managerId: { type: String, ref: "Person", required: true },
    subordinateId: { type: String, ref: "Person", required: true },
  },
  { timestamps: true, versionKey: false, collection: "ReportingMap" }
);

ReportingMapSchema.index({ managerId: 1, subordinateId: 1 }, { unique: true });

export default mongoose.model("ReportingMap", ReportingMapSchema);
