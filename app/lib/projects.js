import { connectDB } from "@/app/lib/db";
import Project from "@/app/models/Project";
import mongoose from "mongoose";
import { unstable_noStore as noStore } from "next/cache";

function serializeProject(project) {
  return {
    ...project,
    _id: String(project._id),
  };
}

export async function getPublicProjects() {
  noStore();

  try {
    await connectDB();
    const projects = await Project.find({})
      .sort({ featured: -1, order: 1, createdAt: -1 })
      .lean();

    return {
      dbHealthy: true,
      projects: projects.map(serializeProject),
    };
  } catch {
    return { dbHealthy: false, projects: [] };
  }
}

export async function getPublicProjectById(id) {
  noStore();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { dbHealthy: true, project: null };
  }

  try {
    await connectDB();
    const project = await Project.findById(id).lean();

    if (!project) {
      return { dbHealthy: true, project: null };
    }

    return {
      dbHealthy: true,
      project: serializeProject(project),
    };
  } catch {
    return { dbHealthy: false, project: null };
  }
}

export async function getProjectNeighbors(id) {
  noStore();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { dbHealthy: true, previous: null, next: null };
  }

  try {
    await connectDB();
    const projects = await Project.find({}, { _id: 1, title: 1 })
      .sort({ featured: -1, order: 1, createdAt: -1 })
      .lean();

    const currentIndex = projects.findIndex((project) => String(project._id) === id);

    if (currentIndex === -1) {
      return { dbHealthy: true, previous: null, next: null };
    }

    const previous = currentIndex > 0 ? serializeProject(projects[currentIndex - 1]) : null;
    const next = currentIndex < projects.length - 1 ? serializeProject(projects[currentIndex + 1]) : null;

    return { dbHealthy: true, previous, next };
  } catch {
    return { dbHealthy: false, previous: null, next: null };
  }
}
