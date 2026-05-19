const { generateEmbeddings } = require("./embedding.service");

const {
  getVectorsFromDatabase,
} = require("./vector.db.service");

const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB) return 0;
  if (vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
};

const parseVector = (vector) => {
  if (Array.isArray(vector)) {
    return vector;
  }

  if (typeof vector === "string") {
    try {
      return JSON.parse(vector);
    } catch {
      return [];
    }
  }

  return [];
};

const retrieveRelevantChunks = async (userId, query) => {
  const queryEmbeddingResult = await generateEmbeddings([query]);
  const queryEmbedding = queryEmbeddingResult[0];

  const vectors = await getVectorsFromDatabase(userId);

  const scoredResults = vectors
    .map((item) => {
      const storedVector = parseVector(item.vector);

      return {
        text: item.text,
        vector: storedVector,
        source: item.source,
        page: item.page,
        similarity: cosineSimilarity(
          queryEmbedding.vector,
          storedVector
        ),
      };
    })
    .filter((item) => item.text && item.vector.length > 0)
    .sort((a, b) => b.similarity - a.similarity);

  const topResults = scoredResults.slice(0, 5);

  console.log("Retrieval debug:", {
    query,
    totalStoredVectors: vectors.length,
    topSimilarities: topResults.map((item) => item.similarity),
    topSources: topResults.map((item) => item.source),
  });

  return {
    query,
    totalStoredVectors: vectors.length,
    results: topResults,
  };
};

module.exports = {
  retrieveRelevantChunks,
};