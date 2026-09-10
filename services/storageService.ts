import { File } from "expo-file-system";
import { Library } from "../types/models";
import { demoLibrary } from "../utils/demo";
import { initializeDirectories, workDirectory } from "./fileService";
export async function loadLibrary(): Promise<Library> {
  initializeDirectories();
  const file = new File(workDirectory(), "metadata.json");
  const backup = new File(workDirectory(), "metadata.backup.json");
  if (!file.exists && !backup.exists) {
    saveLibrary(demoLibrary);
    return {
      ...demoLibrary,
      files: demoLibrary.files.map((file) => ({ ...file })),
      projects: demoLibrary.projects.map((project) => ({ ...project })),
      folders: demoLibrary.folders.map((folder) => ({ ...folder })),
    };
  }
  for (const candidate of [file, backup]) {
    if (!candidate.exists) continue;
    try {
      const data: Library = JSON.parse(await candidate.text());
      if (
        data.version !== 1 ||
        !Array.isArray(data.files) ||
        !Array.isArray(data.projects) ||
        !Array.isArray(data.folders)
      )
        throw new Error("Formato inválido");
      if (candidate === backup) backup.copySync(file, { overwrite: true });
      return data;
    } catch {
      /* Try the last saved copy before reporting a recoverable error. */
    }
  }
  throw new Error(
    "No se pudo leer la biblioteca local. Tus archivos se conservan. Reinicia la aplicación o recupera metadata.backup.json.",
  );
}
export function saveLibrary(data: Library) {
  initializeDirectories();
  const current = new File(workDirectory(), "metadata.json");
  const backup = new File(workDirectory(), "metadata.backup.json");
  const temporary = new File(workDirectory(), "metadata.pending.json");
  temporary.write(JSON.stringify(data));
  if (current.exists) current.copySync(backup, { overwrite: true });
  temporary.copySync(current, { overwrite: true });
  temporary.delete();
}
