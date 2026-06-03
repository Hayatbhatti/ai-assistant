const fs = require('fs');
const path = require('path');

const PROD_MEMORY_PATH = path.resolve(__dirname, 'memory.json');
const TMP_MEMORY_PATH = '/tmp/aria-memory.json';

function isVercel() {
  return !!process.env.VERCEL;
}

function isMemoryFileWritable(filePath) {
  try {
    fs.accessSync(path.dirname(filePath), fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function getStoragePath() {
  if (isVercel()) {
    return TMP_MEMORY_PATH;
  }
  if (!isMemoryFileWritable(path.dirname(PROD_MEMORY_PATH))) {
    return TMP_MEMORY_PATH;
  }
  return PROD_MEMORY_PATH;
}

function getMemory() {
  const storagePath = getStoragePath();

  if (storagePath === TMP_MEMORY_PATH && isVercel()) {
    try {
      const data = fs.readFileSync(TMP_MEMORY_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      return {
        userPreferences: parsed.userPreferences || {},
        pastTopics: parsed.pastTopics || [],
        importantFacts: parsed.importantFacts || []
      };
    } catch {
      try {
        const data = fs.readFileSync(PROD_MEMORY_PATH, 'utf-8');
        const parsed = JSON.parse(data);
        return {
          userPreferences: parsed.userPreferences || {},
          pastTopics: parsed.pastTopics || [],
          importantFacts: parsed.importantFacts || []
        };
      } catch {
        return { userPreferences: {}, pastTopics: [], importantFacts: [] };
      }
    }
  }

  try {
    const data = fs.readFileSync(storagePath, 'utf-8');
    const parsed = JSON.parse(data);
    return {
      userPreferences: parsed.userPreferences || {},
      pastTopics: parsed.pastTopics || [],
      importantFacts: parsed.importantFacts || []
    };
  } catch {
    return { userPreferences: {}, pastTopics: [], importantFacts: [] };
  }
}

function updateMemory(updates) {
  const current = getMemory();
  const updated = { ...current };

  if (updates.userPreferences && typeof updates.userPreferences === 'object') {
    updated.userPreferences = { ...current.userPreferences, ...updates.userPreferences };
  }
  if (Array.isArray(updates.pastTopics)) {
    const merged = [...current.pastTopics, ...updates.pastTopics];
    updated.pastTopics = [...new Set(merged)];
  }
  if (Array.isArray(updates.importantFacts)) {
    const merged = [...current.importantFacts, ...updates.importantFacts];
    updated.importantFacts = [...new Set(merged)];
  }

  try {
    fs.writeFileSync(getStoragePath(), JSON.stringify(updated, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write memory:', e.message);
  }

  return updated;
}

function clearMemory() {
  const empty = { userPreferences: {}, pastTopics: [], importantFacts: [] };
  try {
    fs.writeFileSync(getStoragePath(), JSON.stringify(empty, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to clear memory:', e.message);
  }
  return empty;
}

module.exports = { getMemory, updateMemory, clearMemory };
