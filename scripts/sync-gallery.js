const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const projectRoot = path.resolve(__dirname, "..");
const configFile = path.join(projectRoot, "gallery-sync.config.json");
const supportedExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"]);

function loadConfig() {
  const fallbackConfig = {
    driveFolderUrl: "",
    localSyncFolder: "生圖",
    outputFolder: path.join("assets", "gallery", "synced"),
    dataFile: path.join("data", "gallery-data.js"),
  };

  if (!fs.existsSync(configFile)) {
    return fallbackConfig;
  }

  const rawConfig = JSON.parse(fs.readFileSync(configFile, "utf8"));

  return {
    ...fallbackConfig,
    ...rawConfig,
  };
}

const config = loadConfig();
const sourceRoot = path.join(projectRoot, config.localSyncFolder);
const outputRoot = path.join(projectRoot, config.outputFolder);
const dataFile = path.join(projectRoot, config.dataFile);

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

function hashFileContents(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

function uniqueImagesByContent(imageFiles) {
  const seenHashes = new Set();
  const uniqueFiles = [];

  for (const filePath of imageFiles) {
    const contentHash = hashFileContents(filePath);

    if (seenHashes.has(contentHash)) {
      continue;
    }

    seenHashes.add(contentHash);
    uniqueFiles.push(filePath);
  }

  return uniqueFiles;
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
  const uniqueImageFiles = uniqueImagesByContent(imageFiles);

  if (imageFiles.length === 0) {
    console.log(`${config.localSyncFolder} 資料夾還沒有圖片，這次先保留現有圖庫。`);
    if (config.driveFolderUrl) {
      console.log(`請先把這個 Google Drive 資料夾同步到本機：${config.driveFolderUrl}`);
    }
    return;
  }

  const galleryItems = buildGalleryItems(uniqueImageFiles);
  const skippedCount = imageFiles.length - uniqueImageFiles.length;
  writeGalleryData(galleryItems);

  console.log(`已同步 ${galleryItems.length} 張圖片到網站圖庫。`);
  if (skippedCount > 0) {
    console.log(`已自動略過 ${skippedCount} 張重複圖片。`);
  }
  if (config.driveFolderUrl) {
    console.log(`同步來源：${config.driveFolderUrl}`);
  }
  console.log("接下來重新整理網站確認，沒問題後再 git add / commit / push。");
}

main();
