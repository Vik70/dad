import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirebaseStorage, isFirebaseConfigured } from "./firebase";

/**
 * Uploads an image to Firebase Storage and returns its download URL.
 * When Firebase is not configured, returns a local object URL so the rest of
 * the flow (preview, saving the memory) still works during development.
 */
export async function uploadImage(file: File, folder = "uploads"): Promise<string> {
  const storage = getFirebaseStorage();
  if (!isFirebaseConfigured || !storage) {
    if (typeof URL !== "undefined" && "createObjectURL" in URL) {
      return URL.createObjectURL(file);
    }
    return "";
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
