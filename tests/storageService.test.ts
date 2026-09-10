import { loadLibrary, saveLibrary } from "../services/storageService";
import { importFile, resolveFile } from "../services/fileService";
const mockDisk = new Map<string, string>();
jest.mock("expo-file-system", () => {
  class Directory {
    uri: string;
    constructor(...parts: (string | Directory)[]) {
      this.uri = parts
        .map((p) => (typeof p === "string" ? p : p.uri))
        .join("/");
    }
    create() {}
  }
  class File extends Directory {
    get exists() {
      return mockDisk.has(this.uri);
    }
    get size() {
      return mockDisk.get(this.uri)?.length || 0;
    }
    write(data: string) {
      mockDisk.set(this.uri, data);
    }
    text() {
      return Promise.resolve(mockDisk.get(this.uri));
    }
    copySync(target: File) {
      if (!this.exists) throw new Error("Missing file");
      mockDisk.set(target.uri, mockDisk.get(this.uri)!);
    }
    async copy(target: File) {
      this.copySync(target);
    }
    delete() {
      mockDisk.delete(this.uri);
    }
  }
  return { Directory, File, Paths: { document: "private" } };
});
beforeEach(() => mockDisk.clear());
test("initial demo library is seeded once and real metadata survives reload", async () => {
  const initial = await loadLibrary();
  expect(initial.files.every((f) => f.demo)).toBe(true);
  initial.projects.push({
    id: "real",
    name: "Real project",
    description: "",
    createdAt: "",
    updatedAt: "",
  });
  saveLibrary(initial);
  expect((await loadLibrary()).projects.at(-1)?.id).toBe("real");
});
test("recovers previous metadata if the main JSON is corrupted", async () => {
  const initial = await loadLibrary();
  saveLibrary(initial);
  mockDisk.set("private/WorkSafe/metadata.json", "broken");
  expect((await loadLibrary()).version).toBe(1);
});
test("does not silently replace a corrupted library with demo data", async () => {
  mockDisk.set("private/WorkSafe/metadata.json", "broken");
  await expect(loadLibrary()).rejects.toThrow("Tus archivos se conservan");
});
test("copies file bytes into a category and stores a relative path", async () => {
  mockDisk.set("cache/photo.jpg", "image bytes");
  const result = await importFile(
    "cache/photo.jpg",
    "unique-id",
    "photo.jpg",
    "images",
  );
  expect(result.uri).toBe("images/unique-id.jpg");
  expect(resolveFile(result.uri).exists).toBe(true);
  expect(mockDisk.get("cache/photo.jpg")).toBe("image bytes");
});
test("rejects paths escaping the private file categories", () => {
  expect(() => resolveFile("../metadata.json")).toThrow();
  expect(() => resolveFile("images/../../secret")).toThrow();
  expect(() => resolveFile("file:///outside")).toThrow();
});
