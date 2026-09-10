const encoder = new TextEncoder();
const bytes = (value) => encoder.encode(value);

function concatBytes(parts) {
  const size = parts.reduce((sum, item) => sum + item.length, 0);
  const output = new Uint8Array(size);
  let offset = 0;
  for (const item of parts) {
    output.set(item, offset);
    offset += item.length;
  }
  return output;
}

export function buildImagePdf({ jpegs, width, height, imageWidth, imageHeight }) {
  if (!Array.isArray(jpegs) || !jpegs.length) throw new Error("PDF_PAGES_EMPTY");
  const objects = [];
  const pageRefs = jpegs.map((_, index) => `${3 + index * 3} 0 R`).join(" ");
  objects[1] = bytes("<< /Type /Catalog /Pages 2 0 R >>");
  objects[2] = bytes(`<< /Type /Pages /Count ${jpegs.length} /Kids [${pageRefs}] >>`);
  jpegs.forEach((jpeg, index) => {
    const pageId = 3 + index * 3;
    const imageId = pageId + 1;
    const contentId = pageId + 2;
    const command = `q ${width} 0 0 ${height} 0 0 cm /Im0 Do Q`;
    objects[pageId] = bytes(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    objects[imageId] = concatBytes([
      bytes(`<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`),
      jpeg,
      bytes("\nendstream")
    ]);
    objects[contentId] = bytes(`<< /Length ${command.length} >>\nstream\n${command}\nendstream`);
  });

  const parts = [bytes("%PDF-1.4\n%DreamTaily\n")];
  const offsets = [0];
  let position = parts[0].length;
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = position;
    const object = concatBytes([bytes(`${id} 0 obj\n`), objects[id], bytes("\nendobj\n")]);
    parts.push(object);
    position += object.length;
  }
  const xref = position;
  let table = `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id += 1) table += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  parts.push(bytes(`${table}trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`));
  return new Blob(parts, { type: "application/pdf" });
}
