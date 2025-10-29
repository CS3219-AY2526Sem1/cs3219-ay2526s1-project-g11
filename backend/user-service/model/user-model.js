import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserModelSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: false,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Setting default to the current date/time
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  sessions: [
    {
      peerUserId: {
        type: String,
        required: true,
      },
      startTimestamp: {
        type: Date,
        required: true,
      },
      endTimestamp: {
        type: Date,
        required: false,
      },
      duration: {
        type: Number,
        required: true,
      },
      questionId: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: ["in_progress", "completed", "abandoned"],
        default: "in_progress",
      },
    },
  ],
  completedQuestions: [
    {
      type: String,
    },
  ],
});

export default mongoose.model("UserModel", UserModelSchema);
