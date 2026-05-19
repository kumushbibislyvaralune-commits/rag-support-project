let extractor = null;

const getExtractor = async () => {
  if (!extractor) {
    const { pipeline } = await import("@xenova/transformers");

    extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }

  return extractor;
};

const generateEmbedding = async (text) => {
  const model = await getExtractor();

  const output = await model(text, {
    pooling: "mean",
    normalize: true,
  });

  return {
    text,
    vector: Array.from(output.data),
  };
};

const generateEmbeddings = async (chunks) => {
  const embeddings = [];

  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk);
    embeddings.push(embedding);
  }

  return embeddings;
};

module.exports = {
  generateEmbeddings,
};