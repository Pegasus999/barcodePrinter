const fs = require("fs");
const PDFDocument = require("pdfkit");
const { createCanvas, loadImage } = require("canvas");
const bwipjs = require("bwip-js");

// Function to wrap text
function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;

    if (width < maxWidth || lines.length == 1) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  lines.push(currentLine);
  return lines;
}

async function generateBarcodeCanvas(text, barcodeData) {
  const canvas = createCanvas(200, 100); // Adjust to fit within A4 grid
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const maxWidth = canvas.width; // Max width for each line
  const lineHeight = 16; // Height of each line
  const startY = 10; // Starting Y position for text
  const centerX = canvas.width / 2; // Center of the canvas
  // Draw text above barcode
  ctx.font = "12px Inter";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";

  // Wrap the text
  const lines = wrapText(ctx, text, maxWidth);

  // Draw the text line by line
  lines.forEach((line, index) => {
    ctx.fillText(line, centerX, startY + index * lineHeight, canvas.width);
  });

  // Generate the barcode
  const barcodeBuffer = await new Promise((resolve, reject) => {
    bwipjs.toBuffer(
      {
        bcid: "code128",
        text: barcodeData,
        scale: 2, // Smaller scale for grid layout
        height: 20,
        includetext: false,
      },
      (err, buffer) => {
        if (err) reject(err);
        else resolve(buffer);
      },
    );
  });

  // Draw the barcode below the text
  const barcodeImage = await loadImage(barcodeBuffer);
  ctx.drawImage(barcodeImage, 20, 35); // Position barcode below text

  return canvas;
}

async function createBarcodePDF(dataArray, outputPath) {
  const doc = new PDFDocument({ size: "A4" });
  doc.pipe(fs.createWriteStream(outputPath));

  const itemsPerRow = 3;
  const rowsPerPage = 8;
  const marginX = 2;
  const marginY = 5;
  const itemWidth = 200;
  const itemHeight = 100;
  const padding = 10; // Padding between the item and the dotted line

  for (let i = 0; i < dataArray.length; i++) {
    const col = i % itemsPerRow;
    const row = Math.floor(i / itemsPerRow) % rowsPerPage;

    // Create new page if row is at maximum
    if (row === 0 && col === 0 && i !== 0) {
      doc.addPage();
    }

    // Generate barcode canvas
    const { text, barcodeData } = dataArray[i];
    const canvas = await generateBarcodeCanvas(text, barcodeData);

    // Embed the canvas image in the PDF
    const x = marginX + col * itemWidth;
    const y = marginY + row * itemHeight;
    doc.image(canvas.toBuffer(), x + padding, y + padding, {
      width: itemWidth - 2 * padding,
      height: itemHeight - 2 * padding,
    });

    // Draw dotted dividers between columns and rows
    doc.lineWidth(0.5); // Thin line for divider

    // Draw vertical dotted line to the right of each item, except for the last column
    if (col < itemsPerRow - 1) {
      doc
        .dash(2, { space: 2 }) // Dotted line
        .moveTo(x + itemWidth, y + padding) // Start below the padding
        .lineTo(x + itemWidth, y + itemHeight - padding) // End above the padding
        .stroke();
    }

    // Draw horizontal dotted line below each item, except for the last row
    if (row < rowsPerPage - 1) {
      doc
        .dash(2, { space: 2 }) // Dotted line
        .moveTo(x + padding, y + itemHeight) // Start after the padding
        .lineTo(x + itemWidth - padding, y + itemHeight) // End before the padding
        .stroke();
    }
  }

  // Finalize the PDF file
  doc.end();
  console.log(`PDF saved as ${outputPath}`);
}

// Example usage
const dataArray = [
  {
    text: "Armani Stronger With You Intensely very good smell am just testing shit ",
    barcodeData: "01234",
  },
];

createBarcodePDF(dataArray, "./barcodes.pdf");
