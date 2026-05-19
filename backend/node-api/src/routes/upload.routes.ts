const express = require("express");
const multer = require("multer");

const { authenticateUser } = require("../middleware/auth.middleware");
const { saveVectorToDatabase } = require("../documents/vector.db.service");
const { extractTextFromPDF } = require("../documents/pdf.service");
const { generateEmbeddings } = require("../documents/embedding.service");
const { storeEmbeddings } = require("../documents/vector.store");
const { chunkText } = require("../documents/chunk.service");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

const processKnowledge = async (
  userId,
  text,
  sourceName,
  pageNumber = 1
) => {
  const chunks = chunkText(text);
  const embeddings = await generateEmbeddings(chunks);
  const storedVectors = storeEmbeddings(embeddings);

  for (const item of embeddings) {
    await saveVectorToDatabase(
      userId,
      item.text,
      item.vector,
      sourceName,
      pageNumber
    );
  }

  return {
    chunks,
    embeddings,
    storedVectors,
  };
};

router.post(
  "/upload",
  authenticateUser,
  upload.single("file"),
  async (req, res) => {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: "File is required",
        });
      }

      const extractedText = await extractTextFromPDF(file.path);

      if (!extractedText || !extractedText.trim()) {
        return res.status(400).json({
          success: false,
          error: "No text could be extracted from this PDF",
        });
      }

      const { chunks, embeddings, storedVectors } = await processKnowledge(
        req.user.id,
        extractedText,
        file.originalname,
        1
      );

      return res.json({
        success: true,
        message: "PDF uploaded and processed successfully",
        originalName: file.originalname,
        extractedTextPreview: extractedText.slice(0, 500),
        chunkCount: chunks.length,
        chunksPreview: chunks.slice(0, 3),
        embeddingCount: embeddings.length,
        embeddingsPreview: embeddings.slice(0, 2),
        storedVectorCount: storedVectors.length,
      });
    } catch (error) {
      console.error("PDF upload error:", error);

      return res.status(500).json({
        success: false,
        error: "PDF upload failed",
      });
    }
  }
);

router.post(
  "/upload-pdf",
  authenticateUser,
  upload.single("file"),
  async (req, res) => {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: "File is required",
        });
      }

      const extractedText = await extractTextFromPDF(file.path);

      if (!extractedText || !extractedText.trim()) {
        return res.status(400).json({
          success: false,
          error: "No text could be extracted from this PDF",
        });
      }

      const { chunks, embeddings, storedVectors } = await processKnowledge(
        req.user.id,
        extractedText,
        file.originalname,
        1
      );

      return res.json({
        success: true,
        message: "PDF uploaded and processed successfully",
        originalName: file.originalname,
        extractedTextPreview: extractedText.slice(0, 500),
        chunkCount: chunks.length,
        chunksPreview: chunks.slice(0, 3),
        embeddingCount: embeddings.length,
        embeddingsPreview: embeddings.slice(0, 2),
        storedVectorCount: storedVectors.length,
      });
    } catch (error) {
      console.error("PDF upload error:", error);

      return res.status(500).json({
        success: false,
        error: "PDF upload failed",
      });
    }
  }
);

router.post("/upload-text", authenticateUser, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: "Text is required",
      });
    }

    const { chunks, embeddings, storedVectors } = await processKnowledge(
      req.user.id,
      text,
      "manual-input",
      1
    );

    return res.json({
      success: true,
      message: "Text uploaded and processed successfully",
      chunkCount: chunks.length,
      chunksPreview: chunks.slice(0, 3),
      embeddingCount: embeddings.length,
      embeddingsPreview: embeddings.slice(0, 2),
      storedVectorCount: storedVectors.length,
    });
  } catch (error) {
    console.error("Text upload error:", error);

    return res.status(500).json({
      success: false,
      error: "Text upload failed",
    });
  }
});

module.exports = router;