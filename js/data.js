/* ==========================================================================
   DARBAK — Data Layer
   Centralized fetching, caching, and error handling for JSON content.
   ========================================================================== */

const cache = new Map();
const BASE_PATH = 'data/';

async function fetchJSON(path) {
  const url = `${BASE_PATH}${path}`;
  if (cache.has(url)) {
    return cache.get(url);
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} — ${url}`);
    }
    const data = await response.json();
    cache.set(url, data);
    return data;
  } catch (error) {
    console.error(`[DARBAK Data] Failed to load: ${url}`, error);
    throw error;
  }
}

export async function getManifest() {
  return fetchJSON('manifest.json');
}

export async function getDisease(slug) {
  if (!slug) throw new Error('getDisease: slug is required');
  return fetchJSON(`diseases/${slug}.json`);
}

export async function getQuiz(slug) {
  if (!slug) throw new Error('getQuiz: slug is required');
  return fetchJSON(`quizzes/${slug}.json`);
}

export async function getAllDiseases() {
  const manifest = await getManifest();
  return Promise.all(manifest.diseases.map(getDisease));
}

export function clearCache() {
  cache.clear();
}
