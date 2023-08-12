import mongoose, { mongo } from "mongoose";

const objectId = mongoose.Schema.Types.ObjectId;

const threadSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    author: {
      type: objectId,
      required: true,
      ref: "User",
    },
    community: {
      type: objectId,
      ref: "Community",
    },
    parenId: {
      type: String,
    },
    children: [
      {
        type: objectId,
        ref: "Thread",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Thread = mongoose.models.Thread || mongoose.model("Thread", threadSchema);

export default Thread;
