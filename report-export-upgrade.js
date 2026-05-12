import fs from "fs";

export function saveReport(filename, content) {

  const safeName = filename
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");

  const finalName = `${safeName}.md`;

  fs.writeFileSync(finalName, content);

  return finalName;
}
