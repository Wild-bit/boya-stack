import { useRouteLoaderData } from "react-router-dom";
import type { ProjectInfo } from "@/api/organization/types";

export function ProjectBreadcrumb() {
  const { project } = useRouteLoaderData('project-detail') as { project: ProjectInfo };
  return <span className="text-sm font-medium text-slate-800">{project.name}</span>;
}