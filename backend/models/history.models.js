import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    entity_type: {
      type: String,
      required: true,
      enum: ["User", "Task"],
      index: true,
    },

    entity_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    old_value: {
      type: mongoose.Schema.Types.Mixed,
    },

    new_value: {
      type: mongoose.Schema.Types.Mixed,
    },

    action: {
      type: String,
      enum: [
        "CREATE",
        "UPDATE",
        "DELETE"
      ],
      required: true,
    },

    tag: {
      type: String,
      enum: [
        "Created",
        "Updated",
        "Deleted"
      ],
    },

    value: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const History = mongoose.model("History", historySchema);
export default History;