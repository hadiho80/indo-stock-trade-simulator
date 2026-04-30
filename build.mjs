import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("public", { recursive: true });

for (const file of ["index.html", "styles.css", "app.js"]) {
  copyFileSync(file, `public/${file}`);
}

console.log("Static app ready in public/");
