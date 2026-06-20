import { apiFetch } from "./api.js";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;
const UPLOAD_PREFIX = "/uploads/properties/";

function validateImageFile(file) {
  if (!file) throw new Error("Nebyl vybrán žádný soubor.");
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Povolené formáty: JPEG, PNG, WebP, GIF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Soubor je příliš velký (max. 5 MB).");
  }
}

export async function uploadPropertyImage(file) {
  validateImageFile(file);
  const formData = new FormData();
  formData.append("file", file);
  const data = await apiFetch("upload", { method: "POST", body: formData });
  const url = typeof data?.url === "string" ? data.url.trim() : "";
  if (!url) {
    throw new Error("Server nevrátil URL nahraného souboru.");
  }
  return url;
}

export async function uploadPropertyImages(files) {
  const urls = [];
  for (const file of files) {
    urls.push(await uploadPropertyImage(file));
  }
  return urls;
}

export function isUploadedPropertyImage(imageUrl) {
  return typeof imageUrl === "string" && imageUrl.startsWith(UPLOAD_PREFIX);
}

export async function deletePropertyImageFromStorage(imageUrl) {
  if (!isUploadedPropertyImage(imageUrl)) {
    return { skipped: true, reason: "not_upload_url" };
  }
  // Soubor se smaže při smazání / přepsání nemovitosti na serveru.
  return { skipped: true, reason: "server_managed" };
}
