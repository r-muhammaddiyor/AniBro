const hasGenresField = (index) => {
  const keyEntries = Object.entries(index.key || {});
  return keyEntries.some(([field]) => field === "genres") || String(index.name || "").includes("genres");
};

const isTextIndex = (index) => {
  const keyEntries = Object.entries(index.key || {});

  return (
    Boolean(index.weights) ||
    Boolean(index.textIndexVersion) ||
    keyEntries.some(([, value]) => value === "text") ||
    String(index.name || "").includes("text")
  );
};

const isLegacyGenresTextIndex = (index) => hasGenresField(index) && isTextIndex(index);

const cleanupLegacyAnimeIndexes = async (AnimeModel) => {
  const indexes = await AnimeModel.collection.indexes();
  const legacyIndexes = indexes.filter(
    (index) => index.name !== "_id_" && isLegacyGenresTextIndex(index)
  );

  for (const index of legacyIndexes) {
    await AnimeModel.collection.dropIndex(index.name);
    console.log(`Dropped legacy anime index: ${index.name}`);
  }

  return legacyIndexes.length;
};

export default cleanupLegacyAnimeIndexes;
