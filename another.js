const fs = require("fs");
const PDFDocument = require("pdfkit");
const sharp = require("sharp");
const bwipjs = require("bwip-js");

async function createPNG(text, barcodeData) {
  const barcodeBuffer = await new Promise((resolve, reject) => {
    bwipjs.toBuffer(
      {
        bcid: "code128",
        text: barcodeData,
        scale: 1, // Smaller scale for grid layout
        height: 20,
        includetext: false,
      },
      (err, buffer) => {
        if (err) reject(err);
        else resolve(buffer);
      },
    );
  });

  // Convert barcode buffer to base64
  const barcodeBase64 = barcodeBuffer.toString("base64");

  function wrapText(text, maxWidth, fontSize) {
    const words = text.split(" ");
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = (currentLine + " " + word).length * fontSize * 0.6; // Approximate width calculation
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

  // Create SVG elements
  let svgContent = `<svg width="160" height="100" >`;
  svgContent += `<rect width="100%" height="100%" fill="white"/>`;

  // Add text elements
  const wrappedText = wrapText(text, 160, 12);
  wrappedText.forEach((line, index) => {
    svgContent += `<text x="80" y="${
      15 + index * 15
    }" font-family="Inter" font-size="${index ? "12" : "14"}" fill="black" text-anchor="middle">${line}</text>`;
  });

  // Add barcode imagAe
  svgContent += `<image x="0" y="40" width="160" height="60" href="data:image/png;base64,${barcodeBase64}" />`;

  svgContent += `</svg>`;

  // Convert SVG to PNG using Sharp
  const svgBuffer = Buffer.from(svgContent);
  return await sharp(svgBuffer).png().toBuffer();
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
    const png = await createPNG(text, barcodeData);

    // Embed the canvas image in the PDF
    const x = marginX + col * itemWidth;
    const y = marginY + row * itemHeight;
    doc.image(png, x + padding, y + padding, {
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
    text: "Armani Stronger With You Intensely",
    barcodeData: "01234",
  },
  {
    text: "Ultra male",
    barcodeData: "01234",
  },
  {
    text: "Armani Stronger with you absolute",
    barcodeData: "01234",
  },
  {
    text: "Azaro : Most wanted some long additional text",
    barcodeData: "99929",
  },
  {
    text: "Armani Stronger With You Intensely",
    barcodeData: "01234",
  },
  {
    text: "Ultra male",
    barcodeData: "01234",
  },
  {
    text: "Armani Stronger with you absolute",
    barcodeData: "01234",
  },
  {
    text: "Azaro : Most wanted some long additional text",
    barcodeData: "99929",
  },
  {
    text: "Armani Stronger With You Intensely",
    barcodeData: "01234",
  },
  {
    text: "Ultra male",
    barcodeData: "01234",
  },
  {
    text: "Armani Stronger with you absolute",
    barcodeData: "01234",
  },
  {
    text: "Azaro : Most wanted some long additional text",
    barcodeData: "99929",
  },
  {
    text: "Armani Stronger With You Intensely",
    barcodeData: "01234",
  },
  {
    text: "Ultra male",
    barcodeData: "01234",
  },
  {
    text: "Armani Stronger with you absolute",
    barcodeData: "01234",
  },
  {
    text: "Azaro : Most wanted some long additional text",
    barcodeData: "99929",
  },
  {
    text: "Armani Stronger With You Intensely",
    barcodeData: "01234",
  },
  {
    text: "Ultra male",
    barcodeData: "01234",
  },
  {
    text: "Armani Stronger with you absolute",
    barcodeData: "01234",
  },
  {
    text: "Azaro : Most wanted some long additional text",
    barcodeData: "99929",
  },
  {
    text: "Armani Stronger With You Intensely",
    barcodeData: "01234",
  },
  {
    text: "Ultra male",
    barcodeData: "01234",
  },
  {
    text: "Armani Stronger with you absolute",
    barcodeData: "01234",
  },
  {
    text: "Azaro : Most wanted some long additional text",
    barcodeData: "99929",
  },
  {
    text: "Armani Stronger With You Intensely",
    barcodeData: "01234",
  },
  {
    text: "Ultra male",
    barcodeData: "01234",
  },
  {
    text: "Armani Stronger with you absolute",
    barcodeData: "01234",
  },
  {
    text: "Azaro : Most wanted some long additional text",
    barcodeData: "99929",
  },
  {
    text: "Armani Stronger With You Intensely",
    barcodeData: "01234",
  },
  {
    text: "Ultra male",
    barcodeData: "01234",
  },
  {
    text: "Armani Stronger with you absolute",
    barcodeData: "01234",
  },
  {
    text: "Azaro : Most wanted some long additional text",
    barcodeData: "99929",
  },
  {
    text: "Armani Stronger With You Intensely",
    barcodeData: "01234",
  },
  {
    text: "Ultra male",
    barcodeData: "01234",
  },
  {
    text: "Armani Stronger with you absolute",
    barcodeData: "01234",
  },
  {
    text: "Azaro : Most wanted some long additional text",
    barcodeData: "99929",
  },
  {
    text: "Armani Stronger With You Intensely",
    barcodeData: "01234",
  },
  {
    text: "Ultra male",
    barcodeData: "01234",
  },
  {
    text: "Armani Stronger with you absolute",
    barcodeData: "01234",
  },
  {
    text: "Azaro : Most wanted some long additional text",
    barcodeData: "99929",
  },
  {
    text: "Armani Stronger With You Intensely",
    barcodeData: "01234",
  },
  {
    text: "Ultra male",
    barcodeData: "01234",
  },
  {
    text: "Armani Stronger with you absolute",
    barcodeData: "01234",
  },
  {
    text: "Azaro : Most wanted some long additional text",
    barcodeData: "99929",
  },
  {
    text: "Armani Stronger With You Intensely",
    barcodeData: "01234",
  },
  {
    text: "Ultra male",
    barcodeData: "01234",
  },
  {
    text: "Armani Stronger with you absolute",
    barcodeData: "01234",
  },
  {
    text: "Azaro : Most wanted some long additional text",
    barcodeData: "99929",
  },
];

createBarcodePDF(dataArray, "./barcodes.pdf");
