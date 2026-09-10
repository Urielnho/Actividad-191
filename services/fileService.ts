import { Directory, File, Paths } from "expo-file-system";
import { Category } from "../types/models";
export const workDirectory = () => new Directory(Paths.document, "WorkSafe");
export function initializeDirectories() {
  const root = workDirectory();
  root.create({ idempotent: true, intermediates: true });
  for (const name of [
    "contracts",
    "documents",
    "projects",
    "evidence",
    "images",
    "videos",
  ])
    new Directory(root, name).create({ idempotent: true });
}
export async function importFile(
  uri: string,
  id: string,
  name: string,
  category: Category,
) {
  initializeDirectories();
  const extension = name.match(/\.[a-zA-Z0-9]{1,10}$/)?.[0] || "";
  const target = new File(workDirectory(), category, id + extension);
  try {
    await new File(uri).copy(target);
  } catch (error) {
    if (target.exists) target.delete();
    throw error;
  }
  return { uri: `${category}/${id}${extension}`, size: target.size };
}
export function resolveFile(relative: string) {
  if (
    !/^(contracts|documents|images|videos|evidence)\/[a-zA-Z0-9.-]+$/.test(
      relative,
    ) ||
    relative.includes("..")
  )
    throw new Error("Ruta de archivo inválida.");
  return new File(workDirectory(), relative);
}
export function deleteLocalFile(relative: string) {
  const file = resolveFile(relative);
  if (file.exists) file.delete();
}
