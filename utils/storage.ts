export interface SavedDesign {
  id: string;
  name: string;
  json: object;
  width: number;
  height: number;
  background: string;
  thumbnail: string;
  savedAt: string;
}

const STORAGE_KEY = 'onimix_designs';
const MAX_SAVES = 20;

export function getSavedDesigns(): SavedDesign[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDesign(design: Omit<SavedDesign, 'id' | 'savedAt'>): SavedDesign {
  const saves = getSavedDesigns();
  const newDesign: SavedDesign = {
    ...design,
    id: Date.now().toString(),
    savedAt: new Date().toISOString(),
  };
  const idx = saves.findIndex(s => s.name === design.name);
  if (idx >= 0) {
    saves[idx] = newDesign;
  } else {
    saves.unshift(newDesign);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves.slice(0, MAX_SAVES)));
  return newDesign;
}

export function deleteSavedDesign(id: string): void {
  const saves = getSavedDesigns().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
}

export function clearAllDesigns(): void {
  localStorage.removeItem(STORAGE_KEY);
}
