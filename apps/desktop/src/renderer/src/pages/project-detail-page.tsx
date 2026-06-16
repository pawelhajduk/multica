import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ProjectDetail } from "@multica/views/projects/components";
import { useWorkspaceId } from "@multica/core/hooks";
import { projectDetailOptions } from "@multica/core/projects/queries";
import { parseProjectMarker } from "@multica/core/projects";
import { useDocumentTitle } from "@/hooks/use-document-title";

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const wsId = useWorkspaceId();
  const { data: project } = useQuery(projectDetailOptions(wsId, id!));

  // The OS title bar is a text context — it cannot draw an SVG icon. Use the
  // emoji as-is; for an icon marker fall back to the 📁 glyph so the title
  // never shows the literal "lucide:FolderKanban:blue".
  const marker = parseProjectMarker(project?.icon);
  const titleGlyph = marker?.type === "emoji" ? marker.emoji : "📁";
  useDocumentTitle(project ? `${titleGlyph} ${project.title}` : "Project");

  if (!id) return null;
  return <ProjectDetail projectId={id} />;
}
