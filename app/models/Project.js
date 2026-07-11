import mongoose from "mongoose";

const { Schema } = mongoose;

const ProjectSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxLength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxLength: [1000, "Description cannot exceed 1000 characters"],
    },
    role: {
      type: String,
      trim: true,
      maxLength: [120, "Role cannot exceed 120 characters"],
    },
    duration: {
      type: String,
      trim: true,
      maxLength: [80, "Duration cannot exceed 80 characters"],
    },
    challenge: {
      type: String,
      trim: true,
      maxLength: [2000, "Challenge cannot exceed 2000 characters"],
    },
    solution: {
      type: String,
      trim: true,
      maxLength: [2000, "Solution cannot exceed 2000 characters"],
    },
    outcome: {
      type: String,
      trim: true,
      maxLength: [2000, "Outcome cannot exceed 2000 characters"],
    },
    tags: {
      type: [String],
      default: [],
    },
    galleryUrls: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    imagePublicId: {
      type: String,
      required: true,
    },
    liveUrl: String,
    repoUrl: String,
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

ProjectSchema.index({ featured: -1, order: 1 });

const Project =
  mongoose.models.Project || mongoose.model("Project", ProjectSchema);

export default Project;
