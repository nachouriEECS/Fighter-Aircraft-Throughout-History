const n = (x) => x.toLocaleString("en-US");
const has = (v) => v !== null && v !== undefined;

export const metersToFeet = (m) => Math.round(m * 3.28084 * 10) / 10;
export const kmhToMph = (k) => Math.round(k * 0.621371);
export const kgToLb = (k) => Math.round(k * 2.20462);
export const kmToMi = (k) => Math.round(k * 0.621371);

export const fmtLength = (m) => has(m) ? `${m} m (${metersToFeet(m)} ft)` : "—";
export const fmtWeight = (kg) => has(kg) ? `${n(kg)} kg (${n(kgToLb(kg))} lb)` : "—";
export const fmtSpeed = (kmh) => has(kmh) ? `${n(kmh)} km/h (${n(kmhToMph(kmh))} mph)` : "—";
export const fmtRange = (km) => has(km) ? `${n(km)} km (${n(kmToMi(km))} mi)` : "—";
export const fmtAltitude = (m) => has(m) ? `${n(m)} m (${n(Math.round(metersToFeet(m)))} ft)` : "—";
export const dexLabel = (num) => `N.º ${String(num).padStart(4, "0")}`;
