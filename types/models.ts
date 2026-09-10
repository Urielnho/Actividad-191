export type Category =
  "contracts" | "documents" | "images" | "videos" | "evidence";
export interface WorkFile {
  id: string;
  name: string;
  uri: string;
  type: "image" | "video" | "document" | "contract" | "evidence";
  mimeType?: string;
  size: number;
  category: Category;
  projectId?: string;
  folderId?: string;
  description: string;
  company?: string;
  createdAt: string;
  protected: boolean;
  demo?: boolean;
}
export interface WorkProject {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  demo?: boolean;
}
export interface WorkFolder {
  id: string;
  name: string;
  protected: boolean;
}
export interface Library {
  version: 1;
  files: WorkFile[];
  projects: WorkProject[];
  folders: WorkFolder[];
}
export const categories: Record<Category, string> = {
  contracts: "Contratos",
  documents: "Documentos",
  images: "Imágenes",
  videos: "Videos",
  evidence: "Evidencias",
};
