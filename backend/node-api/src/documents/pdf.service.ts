const PDFParser = require("pdf2json");

const extractTextFromPDF = async (filePath) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, true);

    pdfParser.on("pdfParser_dataError", (errData) => {
      console.error("PDF parser error:", errData.parserError);
      reject(errData.parserError);
    });

    pdfParser.on("pdfParser_dataReady", () => {
      try {
        const text = pdfParser.getRawTextContent();

        if (!text || !text.trim()) {
          reject(new Error("No text extracted from PDF"));
          return;
        }

        resolve(text);
      } catch (error) {
        reject(error);
      }
    });

    pdfParser.loadPDF(filePath);
  });
};

module.exports = {
  extractTextFromPDF,
};