const DEFAULT_CENTER = [49.3961, 15.5912];
const DEFAULT_ZOOM = 8;
const LOCATION_ZOOM = 16;

function parseCoord(value) {
  const normalized = String(value ?? "").trim().replace(",", ".");
  if (normalized === "") return null;
  const num = Number(normalized);
  return Number.isNaN(num) ? NaN : num;
}

export function createMapPicker(options) {
  const {
    container,
    latInput,
    lngInput,
    statusEl,
    applyButton,
  } = options;

  if (!container || typeof L === "undefined") {
    return {
      setCoords() {},
      clear() {},
      applyFromInputs() {
        return false;
      },
      getCoords() {
        return { lat: null, lng: null };
      },
      invalidateSize() {},
    };
  }

  let map = null;
  let marker = null;

  function setStatus(message, isError = false) {
    if (!statusEl) return;
    statusEl.textContent = message || "";
    statusEl.hidden = !message;
    statusEl.classList.toggle("is-error", Boolean(isError && message));
  }

  function syncInputs(lat, lng) {
    if (latInput) latInput.value = lat == null ? "" : String(lat);
    if (lngInput) lngInput.value = lng == null ? "" : String(lng);
  }

  function removeOverlay() {
    if (marker) {
      map.removeLayer(marker);
      marker = null;
    }
  }

  function renderOverlay(lat, lng) {
    removeOverlay();
    if (lat == null || lng == null) return;
    marker = L.marker([lat, lng]).addTo(map);
  }

  function setCoords(lat, lng) {
    if (lat == null || lng == null || lat === "" || lng === "") {
      syncInputs(null, null);
      removeOverlay();
      setStatus("Klikněte na mapu, nebo zadejte souřadnice a stiskněte OK.");
      return false;
    }

    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      setStatus("Souřadnice musí být čísla.", true);
      return false;
    }

    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      setStatus("Neplatné souřadnice (lat −90 až 90, lng −180 až 180).", true);
      return false;
    }

    syncInputs(latNum, lngNum);
    renderOverlay(latNum, lngNum);
    map.setView([latNum, lngNum], LOCATION_ZOOM);
    setStatus("Poloha na mapě je nastavena.");
    return true;
  }

  function applyFromInputs() {
    const latRaw = latInput?.value ?? "";
    const lngRaw = lngInput?.value ?? "";

    if (!String(latRaw).trim() || !String(lngRaw).trim()) {
      setStatus("Vyplňte lat i lng.", true);
      return false;
    }

    const latNum = parseCoord(latRaw);
    const lngNum = parseCoord(lngRaw);

    if (latNum == null || lngNum == null || Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      setStatus("Souřadnice musí být platná čísla.", true);
      return false;
    }

    return setCoords(latNum, lngNum);
  }

  function clear() {
    syncInputs(null, null);
    removeOverlay();
    setStatus("Klikněte na mapu, nebo zadejte souřadnice a stiskněte OK.");
  }

  function getCoords() {
    const latNum = parseCoord(latInput?.value);
    const lngNum = parseCoord(lngInput?.value);
    return {
      lat: latNum == null || Number.isNaN(latNum) ? null : latNum,
      lng: lngNum == null || Number.isNaN(lngNum) ? null : lngNum,
    };
  }

  map = L.map(container, { scrollWheelZoom: true }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  map.on("click", (event) => {
    setCoords(event.latlng.lat, event.latlng.lng);
  });

  applyButton?.addEventListener("click", () => {
    applyFromInputs();
  });

  [latInput, lngInput].forEach((input) => {
    input?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        applyFromInputs();
      }
    });
  });

  setCoords(null, null);

  return {
    setCoords,
    clear,
    applyFromInputs,
    getCoords,
    invalidateSize() {
      setTimeout(() => map?.invalidateSize(), 100);
    },
  };
}
