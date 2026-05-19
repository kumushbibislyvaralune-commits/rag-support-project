const vectorDatabase = [];

const storeEmbeddings = (embeddings) => {
  vectorDatabase.push(...embeddings);

  return vectorDatabase;
};

const getAllEmbeddings = () => {
  return vectorDatabase;
};

const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];

    normA += vecA[i] * vecA[i];

    normB += vecB[i] * vecB[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const search = (queryEmbedding, topK = 3) => {
  const scoredResults = vectorDatabase.map((item) => ({
    ...item,
    score: cosineSimilarity(queryEmbedding, item.embedding),
  }));

  scoredResults.sort((a, b) => b.score - a.score);

  return scoredResults.slice(0, topK);
};

module.exports = {
  storeEmbeddings,
  getAllEmbeddings,
  search,
};