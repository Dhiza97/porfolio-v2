import { connectDB } from "@/app/lib/db";
import Project from "@/app/models/Project";

export async function getPublicProjects() {
  try {
    await connectDB();
    const projects = await Project.find({})
      .sort({ featured: -1, order: 1, createdAt: -1 })
      .lean();

    return {
      dbHealthy: true,
      projects: projects.map((project) => ({
        ...project,
        _id: String(project._id),
      })),
    };
  } catch {
    return { dbHealthy: false, projects: [] };
  }
}
