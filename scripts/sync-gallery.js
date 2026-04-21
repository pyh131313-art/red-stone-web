const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const projectRoot = path.resolve(__dirname, "..");
const sourceRoot = path.join(projectRoot, "生圖");
const outputRoot = path.join(projectRoot, "assets", "gallery", "synced");
const dataFile = path.join(projectRoot, "data", "gallery-data.js");
const supportedExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"]);

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function walkImages(rootDir) {
  if (!fs.existsSync(rootDir)) {
    return [];
  }

  const files = [];

  function visit(currentDir) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) {
        continue;
      }

      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        visit(fullPath);
        continue;
      }

      if (supportedExtensions.has(path.extname(entry.name).toLowerCase())) {
        files.push(fullPath);
      }
    }
  }

  visit(rootDir);

  return files.sort((left, right) => left.localeCompare(right, "zh-Hant"));
}

function ensureCleanDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  fs.mkdirSync(dirPath, { recursive: true });
}

function categoryFromRelativePath(relativePath) {
  const segments = relativePath.split(path.sep);
  return segments.length > 1 ? segments[0] : "未分類";
}

function buildOutputName(relativePath) {
  const parsed = path.parse(relativePath);
  const folderSlug = slugify(parsed.dir.replaceAll(path.sep, "-")) || "gallery";
  const nameSlug = slugify(parsed.name) || "image";
  const shortHash = crypto.createHash("md5").update(relativePath).digest("hex").slice(0, 8);
  return `${folderSlug}-${nameSlug}-${shortHash}${parsed.ext.toLowerCase()}`;
}

function buildGalleryItems(imageFiles) {
  ensureCleanDir(outputRoot);

  return imageFiles.map((filePath) => {
    const relativePath = path.relative(sourceRoot, filePath);
    const category = categoryFromRelativePath(relativePath);
    const outputName = buildOutputName(relativePath);
    const targetPath = path.join(outputRoot, outputName);

    fs.copyFileSync(filePath, targetPath);

    const imageUrl = `./assets/gallery/synced/${outputName}`;

    return {
      title: path.parse(filePath).name,
      category,
      year: "Google Drive 同步",
      description: `來自「${category}」同步資料夾的作品圖。`,
      imageUrl,
      driveUrl: imageUrl,
    };
  });
}

function writeGalleryData(items) {
  const fileContent = `window.galleryItems = ${JSON.stringify(items, null, 2)};\n`;
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, fileContent, "utf8");
}

function main() {
  const imageFiles = walkImages(sourceRoot);

  if (imageFiles.length === 0) {
    console.log("生圖 資料夾還沒有圖片，這次先保留現有圖庫。");
    return;
  }

  const galleryItems = buildGalleryItems(imageFiles);
  writeGalleryData(galleryItems);

  console.log(`已同步 ${galleryItems.length} 張圖片到網站圖庫。`);
  console.log("接下來重新整理網站確認，沒問題後再 git add / commit / push。");
}

main();
