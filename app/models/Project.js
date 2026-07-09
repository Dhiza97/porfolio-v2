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
    tags: {
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
