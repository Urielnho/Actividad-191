import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Library, WorkFile, WorkFolder, WorkProject } from "../types/models";
import { loadLibrary, saveLibrary } from "../services/storageService";
import { deleteLocalFile, importFile } from "../services/fileService";
import { errorMessage, makeId } from "../utils/format";
import { useSecurity } from "./SecurityContext";

interface LibraryValue extends Library {
  loading: boolean;
  error: string;
  retry: () => Promise<void>;
  addFile: (file: Omit<WorkFile, "id" | "createdAt" | "size">) => Promise<void>;
  removeFile: (id: string) => void;
  protectFile: (id: string, value: boolean) => void;
  addProject: (name: string, description: string) => void;
  addFolder: (name: string, protectedValue: boolean) => void;
  protectFolder: (id: string, value: boolean) => void;
  isProtected: (file: WorkFile) => boolean;
}
const Context = createContext<LibraryValue | null>(null);
export function LibraryProvider({ children }: React.PropsWithChildren) {
  const { isAuthenticated } = useSecurity();
  const [library, setLibrary] = useState<Library>({
    version: 1,
    projects: [],
    folders: [],
    files: [],
  });
  const ref = useRef(library);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loaded = useRef(false);
  const retry = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await loadLibrary();
      ref.current = data;
      setLibrary(data);
      loaded.current = true;
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (isAuthenticated && !loaded.current) void retry();
  }, [isAuthenticated, retry]);
  function commit(next: Library) {
    if (!isAuthenticated || !loaded.current || error)
      throw new Error(
        "Desbloquea WorkSafe y carga la biblioteca antes de continuar.",
      );
    saveLibrary(next);
    ref.current = next;
    setLibrary(next);
  }
  async function addFile(input: Omit<WorkFile, "id" | "createdAt" | "size">) {
    const id = makeId();
    const copied = await importFile(input.uri, id, input.name, input.category);
    const now = new Date().toISOString();
    try {
      commit({
        ...ref.current,
        files: [
          { ...input, ...copied, id, createdAt: now },
          ...ref.current.files,
        ],
        projects: ref.current.projects.map((p) =>
          p.id === input.projectId ? { ...p, updatedAt: now } : p,
        ),
      });
    } catch (e) {
      deleteLocalFile(copied.uri);
      throw e;
    }
  }
  function removeFile(id: string) {
    const file = ref.current.files.find((f) => f.id === id);
    commit({
      ...ref.current,
      files: ref.current.files.filter((f) => f.id !== id),
      projects: ref.current.projects.map((p) =>
        p.id === file?.projectId
          ? { ...p, updatedAt: new Date().toISOString() }
          : p,
      ),
    });
    if (file && !file.demo) deleteLocalFile(file.uri);
  }
  function addProject(name: string, description: string) {
    const now = new Date().toISOString();
    const project: WorkProject = {
      id: makeId(),
      name: name.trim(),
      description: description.trim(),
      createdAt: now,
      updatedAt: now,
    };
    commit({ ...ref.current, projects: [...ref.current.projects, project] });
  }
  function addFolder(name: string, protectedValue: boolean) {
    const folder: WorkFolder = {
      id: makeId(),
      name: name.trim(),
      protected: protectedValue,
    };
    commit({ ...ref.current, folders: [...ref.current.folders, folder] });
  }
  return (
    <Context.Provider
      value={{
        ...library,
        loading,
        error,
        retry,
        addFile,
        removeFile,
        addProject,
        addFolder,
        protectFile: (id, value) =>
          commit({
            ...ref.current,
            files: ref.current.files.map((f) =>
              f.id === id ? { ...f, protected: value } : f,
            ),
          }),
        protectFolder: (id, value) =>
          commit({
            ...ref.current,
            folders: ref.current.folders.map((f) =>
              f.id === id ? { ...f, protected: value } : f,
            ),
          }),
        isProtected: (file) =>
          file.protected ||
          !!library.folders.find((f) => f.id === file.folderId)?.protected,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useFiles() {
  const value = useContext(Context);
  if (!value) throw new Error("LibraryProvider requerido");
  return value;
}
