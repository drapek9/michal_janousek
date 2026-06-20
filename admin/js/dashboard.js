import { apiFetch } from "./api.js";
import {
  requireAuth,
  ensureAuthenticated,
  signOut,
  onAuthStateChange,
  LOGIN_PATH,
} from "./auth.js";
import { uploadPropertyImage, uploadPropertyImages, isUploadedPropertyImage } from "./storage.js";
import { createMapPicker } from "./map-picker.js";

const session = await requireAuth();
if (!session) throw new Error("Unauthenticated");

const userEmailEl = document.getElementById("user-email");
const logoutBtn = document.getElementById("logout-btn");
const propertyForm = document.getElementById("property-form");
const propertyFormSection = document.getElementById("property-form-section");
const formHeading = document.getElementById("form-heading");
const formEditingHint = document.getElementById("form-editing-hint");
const imageHint = document.getElementById("image-hint");
const formSubmitBtn = document.getElementById("form-submit");
const formCancelBtn = document.getElementById("form-cancel");
const formSuccessEl = document.getElementById("form-success");
const formErrorEl = document.getElementById("form-error");
const listErrorEl = document.getElementById("list-error");
const listLoadingEl = document.getElementById("list-loading");
const listEmptyEl = document.getElementById("list-empty");
const tableWrapEl = document.getElementById("table-wrap");
const tbodyEl = document.getElementById("properties-tbody");
const refreshBtn = document.getElementById("refresh-btn");
const filterButtons = document.querySelectorAll(".admin-filter button");
const dashboardMain = document.querySelector(".admin-wrap");
const imageModeButtons = document.querySelectorAll("[data-image-mode]");
const imagePanelUrl = document.getElementById("image-panel-url");
const imagePanelFile = document.getElementById("image-panel-file");
const imageUrlInput = document.getElementById("image-url");
const imageFileInput = document.getElementById("image-file");
const imagePreview = document.getElementById("image-preview");
const imagesExtraInput = document.getElementById("images_extra");
const imagesExtraFilesInput = document.getElementById("images_extra_files");
const imagesExtraPreview = document.getElementById("images_extra_preview");
const mapClearBtn = document.getElementById("map-clear-btn");
const mapApplyBtn = document.getElementById("map-apply-btn");
const mapPickerStatus = document.getElementById("map-picker-status");

const mapPicker = createMapPicker({
  container: document.getElementById("admin-map-picker"),
  latInput: document.getElementById("map_lat"),
  lngInput: document.getElementById("map_lng"),
  approximateInput: document.getElementById("map_approximate"),
  statusEl: mapPickerStatus,
  applyButton: mapApplyBtn,
});

mapClearBtn?.addEventListener("click", () => {
  mapPicker.clear();
});

const PROPERTY_STATUSES = ["available", "reserved", "sold"];
const STATUS_LABELS = {
  available: "V nabídce",
  reserved: "Rezervováno",
  sold: "Prodáno",
};
const OFFER_LABELS = { prodej: "Prodej", pronajem: "Pronájem" };

const DISPOSITION_OPTIONS = (() => {
  const options = [];
  for (let i = 1; i <= 11; i++) {
    options.push(`${i}+kk`);
    options.push(`${i}+1`);
  }
  options.push("12+kk a větší");
  return options;
})();

function populateDispositionSelect() {
  const select = propertyForm.rooms;
  if (!select) return;
  for (const value of DISPOSITION_OPTIONS) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  }
}

populateDispositionSelect();

let allProperties = [];
let currentFilter = "all";
let imageMode = "url";
let imagePreviewUrl = null;
let extraImagePreviewUrls = [];
let uploadedExtraImages = [];
let pendingExtraFiles = [];
let editingId = null;
let editingImageUrl = null;

function setDashboardEnabled(enabled) {
  if (!dashboardMain) return;
  dashboardMain.style.opacity = enabled ? "1" : "0.5";
  dashboardMain.style.pointerEvents = enabled ? "" : "none";
}

setDashboardEnabled(false);
userEmailEl.textContent = session.user.email ?? "";

onAuthStateChange((event) => {
  if (event === "SIGNED_OUT") window.location.replace(LOGIN_PATH);
});

logoutBtn.addEventListener("click", async () => {
  await signOut();
  window.location.replace(LOGIN_PATH);
});

function setImageMode(mode) {
  imageMode = mode;
  imageModeButtons.forEach((btn) => {
    const active = btn.dataset.imageMode === mode;
    btn.classList.toggle("is-active", active);
  });
  imagePanelUrl.hidden = mode !== "url";
  imagePanelFile.hidden = mode !== "file";
}

imageModeButtons.forEach((btn) => {
  btn.addEventListener("click", () => setImageMode(btn.dataset.imageMode));
});

function clearImagePreview() {
  if (imagePreviewUrl) {
    URL.revokeObjectURL(imagePreviewUrl);
    imagePreviewUrl = null;
  }
  imageFileInput.value = "";
  imagePreview.hidden = true;
  imagePreview.removeAttribute("src");
}

function showImagePreviewSrc(src) {
  clearImagePreview();
  if (!src) return;
  imagePreview.src = src;
  imagePreview.hidden = false;
}

imageFileInput.addEventListener("change", () => {
  if (imagePreviewUrl) {
    URL.revokeObjectURL(imagePreviewUrl);
    imagePreviewUrl = null;
  }
  const file = imageFileInput.files?.[0];
  if (!file) {
    if (editingImageUrl && imageMode === "file") showImagePreviewSrc(editingImageUrl);
    return;
  }
  imagePreviewUrl = URL.createObjectURL(file);
  imagePreview.src = imagePreviewUrl;
  imagePreview.hidden = false;
});

async function resolveImageUrl(mainFile = null) {
  if (imageMode === "file") {
    const file = mainFile ?? imageFileInput.files?.[0];
    if (!file) {
      if (editingImageUrl) return editingImageUrl;
      throw new Error("Vyberte obrázek ze souboru, nebo přepněte na URL.");
    }
    return uploadPropertyImage(file);
  }
  const url = imageUrlInput.value.trim();
  if (!url) {
    if (editingImageUrl) return editingImageUrl;
    throw new Error("Zadejte URL obrázku, nebo přepněte na nahrání souboru.");
  }
  return url;
}

function parseExtraImageUrls() {
  return normalizeImageList(
    imagesExtraInput.value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
  ).filter((url) => !isUploadedPropertyImage(url));
}

function splitExtraImages(images) {
  const external = [];
  const uploaded = [];
  for (const url of normalizeImageList(images)) {
    if (isUploadedPropertyImage(url)) uploaded.push(url);
    else external.push(url);
  }
  return { external, uploaded };
}

function normalizeImageList(images) {
  if (Array.isArray(images)) {
    return images.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof images === "string" && images.trim()) {
    return [images.trim()];
  }
  return [];
}

function resetExtraImagesState() {
  uploadedExtraImages = [];
  pendingExtraFiles = [];
  if (imagesExtraInput) imagesExtraInput.value = "";
  if (imagesExtraFilesInput) imagesExtraFilesInput.value = "";
  clearExtraImagesPreview();
}

function clearExtraImagesPreview() {
  extraImagePreviewUrls.forEach((url) => {
    if (url.startsWith("blob:")) URL.revokeObjectURL(url);
  });
  extraImagePreviewUrls = [];
  if (imagesExtraPreview) {
    imagesExtraPreview.innerHTML = "";
    imagesExtraPreview.hidden = true;
  }
}

function renderExtraImagesPreview() {
  if (!imagesExtraPreview) return;

  clearExtraImagesPreview();

  const items = [];
  uploadedExtraImages.forEach((url, index) => {
    items.push({ type: "uploaded", src: url, key: String(index) });
  });
  pendingExtraFiles.forEach((file, index) => {
    const blobUrl = URL.createObjectURL(file);
    extraImagePreviewUrls.push(blobUrl);
    items.push({ type: "pending", src: blobUrl, key: String(index) });
  });

  if (!items.length) return;

  imagesExtraPreview.innerHTML = items
    .map(
      (item) => `
        <figure
          class="admin-extra-images-preview__item"
          data-extra-item
          data-type="${item.type}"
          data-key="${escapeHtml(item.key)}"
        >
          <img src="${escapeHtml(item.src)}" alt="">
          <button type="button" class="admin-extra-images-preview__remove" data-remove-extra>
            Smazat
          </button>
        </figure>`
    )
    .join("");
  imagesExtraPreview.hidden = false;
}

function removeExtraImageItem(type, key) {
  const index = Number(key);
  if (type === "uploaded") {
    uploadedExtraImages = uploadedExtraImages.filter((_, i) => i !== index);
  } else if (type === "pending") {
    pendingExtraFiles = pendingExtraFiles.filter((_, i) => i !== index);
  }
  renderExtraImagesPreview();
}

async function resolveExtraImages(mainImageUrl = "") {
  const external = parseExtraImageUrls();
  const newUploads = pendingExtraFiles.length
    ? await uploadPropertyImages(pendingExtraFiles)
    : [];
  uploadedExtraImages = normalizeImageList([...uploadedExtraImages, ...newUploads]);
  pendingExtraFiles = [];
  if (imagesExtraFilesInput) imagesExtraFilesInput.value = "";

  return normalizeImageList([...external, ...uploadedExtraImages]).filter(
    (url) => url !== mainImageUrl
  );
}

imagesExtraInput?.addEventListener("input", () => {
  const lines = normalizeImageList(
    imagesExtraInput.value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
  );
  const external = [];
  const movedUploads = [];
  for (const url of lines) {
    if (isUploadedPropertyImage(url)) movedUploads.push(url);
    else external.push(url);
  }
  if (movedUploads.length) {
    uploadedExtraImages = normalizeImageList([...uploadedExtraImages, ...movedUploads]);
    imagesExtraInput.value = external.join("\n");
  }
  renderExtraImagesPreview();
});

imagesExtraFilesInput?.addEventListener("change", () => {
  const added = Array.from(imagesExtraFilesInput.files || []);
  if (added.length) pendingExtraFiles.push(...added);
  imagesExtraFilesInput.value = "";
  renderExtraImagesPreview();
});

imagesExtraPreview?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-remove-extra]");
  if (!btn) return;
  e.preventDefault();
  const item = btn.closest("[data-extra-item]");
  if (!item) return;
  removeExtraImageItem(item.dataset.type, item.dataset.key);
});

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

propertyForm.title?.addEventListener("blur", () => {
  if (!propertyForm.slug.value.trim() && propertyForm.title.value.trim()) {
    propertyForm.slug.value = slugify(propertyForm.title.value);
  }
});

function getCheckedParamFlags() {
  const flags = {};
  propertyForm.querySelectorAll('input[name="param_flag"]:checked').forEach((el) => {
    flags[el.value] = true;
  });
  return flags;
}

function setCheckedParamFlags(params = {}) {
  propertyForm.querySelectorAll('input[name="param_flag"]').forEach((el) => {
    el.checked = Boolean(params[el.value]);
  });
}

const areaLabelEl = document.getElementById("area-label");

function updateFormByPropertyType() {
  const type = propertyForm.property_type.value;

  propertyForm.querySelectorAll("[data-show-for]").forEach((el) => {
    const allowed = el.dataset.showFor.split(",");
    el.hidden = !allowed.includes(type);
  });

  if (areaLabelEl) {
    areaLabelEl.textContent = type === "pozemek" ? "Plocha (m²)" : "Užitná plocha (m²)";
  }

  propertyForm.penb.required = type !== "pozemek";
}

propertyForm.property_type.addEventListener("change", updateFormByPropertyType);
updateFormByPropertyType();

function buildPayloadFromForm(imageValue, extraImages = []) {
  const type = propertyForm.property_type.value;
  const params = {
    ownership: propertyForm.ownership.value.trim() || null,
  };

  if (type === "byt") {
    params.disposition = propertyForm.rooms.value.trim() || null;
    params.usableArea = propertyForm.area.value ? Number(propertyForm.area.value) : null;
    params.condition = propertyForm.condition.value.trim() || null;
    params.buildingType = propertyForm.building_type.value.trim() || null;
    params.penb = propertyForm.penb.value.trim() || null;
    Object.assign(params, getCheckedParamFlags());
  } else if (type === "dum") {
    params.disposition = propertyForm.rooms.value.trim() || null;
    params.usableArea = propertyForm.area.value ? Number(propertyForm.area.value) : null;
    params.condition = propertyForm.condition.value.trim() || null;
    params.buildingType = propertyForm.building_type.value.trim() || null;
    params.penb = propertyForm.penb.value.trim() || null;
    Object.assign(params, getCheckedParamFlags());
  } else if (type === "pozemek") {
    params.usableArea = propertyForm.area.value ? Number(propertyForm.area.value) : null;
  } else {
    params.disposition = propertyForm.rooms.value.trim() || null;
    params.usableArea = propertyForm.area.value ? Number(propertyForm.area.value) : null;
    params.condition = propertyForm.condition.value.trim() || null;
    params.buildingType = propertyForm.building_type.value.trim() || null;
    params.penb = propertyForm.penb.value.trim() || null;
    Object.assign(params, getCheckedParamFlags());
  }

  Object.keys(params).forEach((key) => {
    if (params[key] === null || params[key] === "" || params[key] === false) delete params[key];
  });

  const priceRaw = propertyForm.price.value.trim();
  const price = priceRaw === "" ? null : Number(priceRaw);

  const rooms = type === "byt" || type === "dum" || type === "komercni"
    ? propertyForm.rooms.value.trim() || null
    : null;

  const floor = type === "byt" ? propertyForm.floor.value.trim() || null : null;
  const landArea = type === "dum" && propertyForm.land_area.value
    ? Number(propertyForm.land_area.value)
    : null;

  return {
    title: propertyForm.title.value.trim(),
    slug: propertyForm.slug.value.trim(),
    status: propertyForm.status.value,
    offer_type: propertyForm.offer_type.value,
    property_type: type,
    price,
    location: propertyForm.location.value.trim(),
    map_lat: mapPicker.getCoords().lat,
    map_lng: mapPicker.getCoords().lng,
    map_approximate: mapPicker.getCoords().approximate,
    area: propertyForm.area.value ? Number(propertyForm.area.value) : null,
    floor,
    land_area: landArea,
    rooms,
    condition: type === "pozemek" ? null : propertyForm.condition.value.trim() || null,
    image: imageValue,
    images: extraImages,
    description: propertyForm.description.value.trim() || null,
    params,
  };
}

function fillFormFromProperty(prop) {
  const params = prop.params || {};
  const disposition = prop.rooms ?? params.disposition ?? "";

  propertyForm.title.value = prop.title ?? "";
  propertyForm.slug.value = prop.slug ?? "";
  propertyForm.status.value = prop.status ?? "available";
  propertyForm.offer_type.value = prop.offer_type ?? "prodej";
  propertyForm.property_type.value = prop.property_type ?? "byt";
  propertyForm.price.value = prop.price ?? "";
  propertyForm.location.value = prop.location ?? "";
  const loc = prop.location_detail || {};
  mapPicker.setCoords(
    prop.map_lat ?? loc.lat ?? null,
    prop.map_lng ?? loc.lng ?? null,
    prop.map_approximate != null ? Boolean(Number(prop.map_approximate)) : loc.approximate ?? true
  );
  propertyForm.area.value = prop.area ?? params.usableArea ?? "";
  propertyForm.rooms.value = disposition;
  if (disposition && !DISPOSITION_OPTIONS.includes(disposition)) {
    const option = document.createElement("option");
    option.value = disposition;
    option.textContent = disposition;
    propertyForm.rooms.appendChild(option);
    propertyForm.rooms.value = disposition;
  }
  propertyForm.land_area.value = prop.land_area ?? params.landArea ?? "";
  propertyForm.floor.value = prop.floor ?? params.floor ?? "";
  const condition = prop.condition ?? params.condition ?? "";
  if (condition && !Array.from(propertyForm.condition.options).some((o) => o.value === condition)) {
    const option = document.createElement("option");
    option.value = condition;
    option.textContent = condition;
    propertyForm.condition.appendChild(option);
  }
  propertyForm.condition.value = condition;
  const ownership = params.ownership ?? "";
  if (ownership && !Array.from(propertyForm.ownership.options).some((o) => o.value === ownership)) {
    const option = document.createElement("option");
    option.value = ownership;
    option.textContent = ownership;
    propertyForm.ownership.appendChild(option);
  }
  propertyForm.ownership.value = ownership;
  const buildingType = params.buildingType ?? "";
  if (buildingType && !Array.from(propertyForm.building_type.options).some((o) => o.value === buildingType)) {
    const option = document.createElement("option");
    option.value = buildingType;
    option.textContent = buildingType;
    propertyForm.building_type.appendChild(option);
  }
  propertyForm.building_type.value = buildingType;
  propertyForm.penb.value = params.penb ?? "";
  propertyForm.description.value = prop.description ?? "";
  const { external, uploaded } = splitExtraImages(prop.images || []);
  propertyForm.images_extra.value = external.join("\n");
  uploadedExtraImages = uploaded;
  pendingExtraFiles = [];
  renderExtraImagesPreview();
  setCheckedParamFlags(params);

  setImageMode("url");
  imageUrlInput.value = prop.image ?? "";
  clearImagePreview();
  if (prop.image) showImagePreviewSrc(prop.image);
  updateFormByPropertyType();
}

function setEditMode(prop) {
  editingId = prop.id;
  editingImageUrl = prop.image ?? null;
  formHeading.textContent = "Upravit nemovitost";
  formEditingHint.textContent = `Upravujete: ${prop.title}`;
  formEditingHint.hidden = false;
  formSubmitBtn.textContent = "Uložit změny";
  formCancelBtn.hidden = false;
  propertyFormSection.classList.add("is-editing");
  imageHint.textContent = "Ponechte URL beze změny, nebo nahrajte nový soubor.";
  fillFormFromProperty(prop);
  mapPicker.invalidateSize();
  propertyFormSection.scrollIntoView({ behavior: "smooth", block: "start" });
  renderTable();
}

function cancelEdit() {
  editingId = null;
  editingImageUrl = null;
  formHeading.textContent = "Přidat nemovitost";
  formEditingHint.hidden = true;
  formSubmitBtn.textContent = "Uložit nemovitost";
  formCancelBtn.hidden = true;
  propertyFormSection.classList.remove("is-editing");
  imageHint.textContent = "Vložte URL, nebo nahrajte soubor na server.";
  propertyForm.reset();
  setCheckedParamFlags({});
  mapPicker.clear();
  setImageMode("url");
  clearImagePreview();
  resetExtraImagesState();
  formSuccessEl.hidden = true;
  formErrorEl.hidden = true;
  updateFormByPropertyType();
  renderTable();
}

formCancelBtn.addEventListener("click", cancelEdit);

function formatPrice(price) {
  if (price == null || price === "") return "—";
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(price);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function showFormMessage(el, message) {
  el.textContent = message;
  el.hidden = false;
  setTimeout(() => { el.hidden = true; }, 4000);
}

function getFilteredProperties() {
  if (currentFilter === "all") return allProperties;
  return allProperties.filter((p) => p.status === currentFilter);
}

function renderTable() {
  const items = getFilteredProperties();
  tbodyEl.innerHTML = "";

  if (!items.length) {
    listEmptyEl.hidden = false;
    tableWrapEl.hidden = true;
    return;
  }

  listEmptyEl.hidden = true;
  tableWrapEl.hidden = false;

  for (const prop of items) {
    const tr = document.createElement("tr");
    if (editingId === prop.id) tr.classList.add("is-editing");
    const typeClass = prop.offer_type === "pronajem" ? "admin-badge--rent" : "admin-badge--sale";

    tr.innerHTML = `
      <td data-label="Název">${escapeHtml(prop.title)}</td>
      <td data-label="Cena">${formatPrice(prop.price)}</td>
      <td data-label="Lokalita">${escapeHtml(prop.location)}</td>
      <td data-label="Typ"><span class="admin-badge ${typeClass}">${OFFER_LABELS[prop.offer_type] || prop.offer_type}</span></td>
      <td data-label="Stav">
        <select class="admin-status-select status-select" aria-label="Stav">
          ${PROPERTY_STATUSES.map((v) => `<option value="${v}"${v === prop.status ? " selected" : ""}>${STATUS_LABELS[v]}</option>`).join("")}
        </select>
      </td>
      <td class="admin-actions-cell" data-label="">
        <div class="admin-actions">
          <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm edit-btn">Upravit</button>
          <button type="button" class="admin-btn admin-btn--danger admin-btn--sm delete-btn">Smazat</button>
        </div>
      </td>
    `;

    tr.querySelector(".edit-btn").addEventListener("click", () => setEditMode(prop));
    const statusSelect = tr.querySelector(".status-select");
    statusSelect.addEventListener("change", () => updatePropertyStatus(prop.id, statusSelect.value, statusSelect));
    tr.querySelector(".delete-btn").addEventListener("click", () => deleteProperty(prop));
    tbodyEl.appendChild(tr);
  }
}

async function loadProperties() {
  const authSession = await ensureAuthenticated();
  if (!authSession) return;

  listErrorEl.hidden = true;
  listLoadingEl.hidden = false;
  listEmptyEl.hidden = true;
  tableWrapEl.hidden = true;

  try {
    allProperties = await apiFetch("properties");
    listLoadingEl.hidden = true;
    if (editingId && !allProperties.some((p) => p.id === editingId)) cancelEdit();
    renderTable();
  } catch (err) {
    listLoadingEl.hidden = true;
    listErrorEl.textContent = "Nepodařilo se načíst nemovitosti: " + err.message;
    listErrorEl.hidden = false;
  }
}

async function updatePropertyStatus(id, status, selectEl) {
  const authSession = await ensureAuthenticated();
  if (!authSession) return;

  const item = allProperties.find((p) => p.id === id);
  if (!item) return;

  const previous = item.status;
  selectEl.disabled = true;

  try {
    await apiFetch(`properties/${id}`, {
      method: "PUT",
      body: { ...item, status, params: item.params ?? {} },
    });
    item.status = status;
    if (editingId === id) propertyForm.status.value = status;
    renderTable();
  } catch (err) {
    selectEl.value = previous;
    alert("Chyba při změně stavu: " + err.message);
  } finally {
    selectEl.disabled = false;
  }
}

async function deleteProperty(prop) {
  const authSession = await ensureAuthenticated();
  if (!authSession) return;

  if (!confirm(`Opravdu smazat nemovitost „${prop.title}"?\n\nTuto akci nelze vrátit.`)) return;

  try {
    await apiFetch(`properties/${prop.id}`, { method: "DELETE" });
    if (editingId === prop.id) cancelEdit();
    allProperties = allProperties.filter((p) => p.id !== prop.id);
    renderTable();
  } catch (err) {
    alert("Chyba při mazání: " + err.message);
  }
}

propertyForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  formSuccessEl.hidden = true;
  formErrorEl.hidden = true;

  if (!propertyForm.checkValidity()) {
    propertyForm.reportValidity();
    return;
  }

  const authSession = await ensureAuthenticated();
  if (!authSession) return;

  const isEdit = Boolean(editingId);
  formSubmitBtn.disabled = true;
  formSubmitBtn.textContent = isEdit ? "Ukládám změny…" : "Ukládám…";

  let imageValue;
  let extraImages;
  try {
    const mainFile =
      imageMode === "file" && imageFileInput.files?.[0] ? imageFileInput.files[0] : null;
    const pendingCount = pendingExtraFiles.length;

    if (mainFile) {
      formSubmitBtn.textContent = "Nahrávám hlavní obrázek…";
    }
    imageValue = await resolveImageUrl(mainFile);
    if (pendingCount > 0) {
      formSubmitBtn.textContent = `Nahrávám další fotografie (${pendingCount})…`;
    }
    extraImages = await resolveExtraImages(imageValue);
    imagesExtraInput.value = parseExtraImageUrls().join("\n");
    renderExtraImagesPreview();
  } catch (err) {
    formSubmitBtn.disabled = false;
    formSubmitBtn.textContent = isEdit ? "Uložit změny" : "Uložit nemovitost";
    formErrorEl.textContent = err?.message || "Obrázek se nepodařilo zpracovat.";
    formErrorEl.hidden = false;
    return;
  }

  const coords = mapPicker.getCoords();
  if ((coords.lat != null) !== (coords.lng != null)) {
    formSubmitBtn.disabled = false;
    formSubmitBtn.textContent = isEdit ? "Uložit změny" : "Uložit nemovitost";
    formErrorEl.textContent = "Vyplňte lat i lng, nebo obě souřadnice nechte prázdné.";
    formErrorEl.hidden = false;
    return;
  }

  const payload = buildPayloadFromForm(imageValue, extraImages);
  formSubmitBtn.textContent = isEdit ? "Ukládám změny…" : "Ukládám…";

  try {
    if (isEdit) {
      const saved = await apiFetch(`properties/${editingId}`, { method: "PUT", body: payload });
      cancelEdit();
      showFormMessage(formSuccessEl, "Nemovitost byla upravena.");
      if (saved?.id) {
        allProperties = allProperties.map((item) => (item.id === saved.id ? saved : item));
      }
    } else {
      await apiFetch("properties", { method: "POST", body: payload });
      propertyForm.reset();
      setCheckedParamFlags({});
      mapPicker.clear();
      setImageMode("url");
      clearImagePreview();
      resetExtraImagesState();
      updateFormByPropertyType();
      showFormMessage(formSuccessEl, "Nemovitost byla uložena.");
    }
    await loadProperties();
  } catch (err) {
    formErrorEl.textContent = (isEdit ? "Úprava se nezdařila: " : "Uložení se nezdařilo: ") + err.message;
    formErrorEl.hidden = false;
  } finally {
    formSubmitBtn.disabled = false;
    formSubmitBtn.textContent = isEdit ? "Uložit změny" : "Uložit nemovitost";
  }
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    currentFilter = btn.dataset.filter;
    renderTable();
  });
});

refreshBtn.addEventListener("click", loadProperties);

setDashboardEnabled(true);
mapPicker.invalidateSize();
await loadProperties();
