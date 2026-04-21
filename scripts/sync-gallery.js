const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const https = require("https");
const vm = require("vm");

const projectRoot = path.resolve(__dirname, "..");
const configFile = path.join(projectRoot, "gallery-sync.config.json");
const supportedExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"]);

function loadConfig() {
  const fallbackConfig = {
    syncMode: "drive",
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

function ensureCleanDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  fs.mkdirSync(dirPath, { recursive: true });
}

function categoryFromRelativePath(relativePath) {
  const segments = relativePath.split(path.sep);
  return segments.length > 1 ? segments[0] : "未分類";
}

function buildOutputName(inputName, category, uniqueKey) {
  const parsed = path.parse(inputName);
  const categorySlug = slugify(category) || "gallery";
  const nameSlug = slugify(parsed.name) || "image";
  const shortHash = crypto.createHash("md5").update(uniqueKey).digest("hex").slice(0, 8);
  const extension = parsed.ext.toLowerCase() || ".png";
  return `${categorySlug}-${nameSlug}-${shortHash}${extension}`;
}

function hashBufferContents(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function writeGalleryData(items) {
  const fileContent = `window.galleryItems = ${JSON.stringify(items, null, 2)};\n`;
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, fileContent, "utf8");
}

function buildGalleryItemsFromLocal() {
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

  const imageFiles = walkImages(sourceRoot);

  if (imageFiles.length === 0) {
    console.log(`${config.localSyncFolder} 資料夾還沒有圖片，這次先保留現有圖庫。`);
    return null;
  }

  const seenHashes = new Set();
  const items = [];
  ensureCleanDir(outputRoot);

  for (const filePath of imageFiles) {
    const buffer = fs.readFileSync(filePath);
    const hash = hashBufferContents(buffer);

    if (seenHashes.has(hash)) {
      continue;
    }

    seenHashes.add(hash);

    const relativePath = path.relative(sourceRoot, filePath);
    const category = categoryFromRelativePath(relativePath);
    const outputName = buildOutputName(path.basename(filePath), category, relativePath);
    const targetPath = path.join(outputRoot, outputName);

    fs.copyFileSync(filePath, targetPath);

    const imageUrl = `./assets/gallery/synced/${outputName}`;

    items.push({
      title: path.parse(filePath).name,
      category,
      year: "本機同步",
      description: `來自「${category}」同步資料夾的作品圖。`,
      imageUrl,
      driveUrl: imageUrl,
    });
  }

  return {
    items,
    skippedCount: imageFiles.length - items.length,
  };
}

function fetchBuffer(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          "user-agent": "Mozilla/5.0",
        },
      },
      (response) => {
        const { statusCode, headers } = response;

        if (statusCode && statusCode >= 300 && statusCode < 400 && headers.location) {
          if (redirectCount >= 5) {
            reject(new Error(`Too many redirects for ${url}`));
            return;
          }

          const nextUrl = new URL(headers.location, url).toString();
          response.resume();
          fetchBuffer(nextUrl, redirectCount + 1).then(resolve).catch(reject);
          return;
        }

        if (statusCode !== 200) {
          reject(new Error(`Request failed for ${url}: ${statusCode}`));
          return;
        }

        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks)));
      },
    );

    request.setTimeout(20000, () => {
      request.destroy(new Error(`Request timed out for ${url}`));
    });

    request.on("error", reject);
  });
}

async function fetchText(url) {
  const buffer = await fetchBuffer(url);
  return buffer.toString("utf8");
}

function parseDriveItems(html) {
  const match = html.match(/window\['_DRIVE_ivd'\] = '([\s\S]*?)';if \(window\['_DRIVE_ivdc'\]\)/);

  if (!match) {
    throw new Error("Google Drive page format changed: _DRIVE_ivd not found.");
  }

  const decoded = vm.runInNewContext(`'${match[1]}'`);
  const parsed = JSON.parse(decoded);

  return Array.isArray(parsed[0]) ? parsed[0] : [];
}

function buildFolderUrl(folderId) {
  return `https://drive.google.com/drive/folders/${folderId}?usp=share_link`;
}

function buildDriveFileUrl(fileId) {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

function buildDriveDownloadUrl(fileId) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

function inferExtension(fileName, mimeType) {
  const parsedExt = path.extname(fileName).toLowerCase();

  if (supportedExtensions.has(parsedExt)) {
    return parsedExt;
  }

  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "image/gif") return ".gif";
  if (mimeType === "image/avif") return ".avif";

  return ".png";
}

async function collectDriveImages(folderUrl) {
  const visitedFolders = new Set();
  const images = [];

  async function visit(currentFolderUrl, topLevelCategory = "未分類") {
    const folderId = new URL(currentFolderUrl).pathname.split("/").filter(Boolean).pop();

    if (!folderId || visitedFolders.has(folderId)) {
      return;
    }

    visitedFolders.add(folderId);

    const html = await fetchText(currentFolderUrl);
    const items = parseDriveItems(html);

    for (const item of items) {
      const [id, , name, mimeType] = item;

      if (!id || !name || !mimeType) {
        continue;
      }

      if (mimeType === "application/vnd.google-apps.folder") {
        const nextCategory = topLevelCategory === "未分類" ? name : topLevelCategory;
        await visit(buildFolderUrl(id), nextCategory);
        continue;
      }

      if (!mimeType.startsWith("image/")) {
        continue;
      }

      const extension = inferExtension(name, mimeType);
      images.push({
        id,
        name,
        mimeType,
        extension,
        category: topLevelCategory,
        driveUrl: buildDriveFileUrl(id),
        downloadUrl: buildDriveDownloadUrl(id),
      });
    }
  }

  await visit(folderUrl);

  return images;
}

async function buildGalleryItemsFromDrive() {
  if (!config.driveFolderUrl) {
    throw new Error("gallery-sync.config.json 沒有設定 driveFolderUrl。");
  }

  const driveImages = await collectDriveImages(config.driveFolderUrl);

  if (driveImages.length === 0) {
    console.log("Google Drive 資料夾沒有找到可同步的圖片，這次先保留現有圖庫。");
    return null;
  }

  ensureCleanDir(outputRoot);

  const seenHashes = new Set();
  const items = [];
  let skippedDownloads = 0;

  for (const [index, image] of driveImages.entries()) {
    if ((index + 1) % 10 === 0 || index === 0) {
      console.log(`正在下載第 ${index + 1} / ${driveImages.length} 張圖片...`);
    }

    let buffer;

    try {
      buffer = await fetchBuffer(image.downloadUrl);
    } catch (error) {
      skippedDownloads += 1;
      console.log(`略過下載失敗的圖片：${image.name}`);
      continue;
    }

    const hash = hashBufferContents(buffer);

    if (seenHashes.has(hash)) {
      continue;
    }

    seenHashes.add(hash);

    const normalizedName = `${path.parse(image.name).name}${image.extension}`;
    const outputName = buildOutputName(normalizedName, image.category, image.id);
    const targetPath = path.join(outputRoot, outputName);
    fs.writeFileSync(targetPath, buffer);

    const imageUrl = `./assets/gallery/synced/${outputName}`;

    items.push({
      title: path.parse(image.name).name,
      category: image.category,
      year: "Google Drive 同步",
      description: `來自「${image.category}」雲端資料夾的作品圖。`,
      imageUrl,
      driveUrl: image.driveUrl,
    });
  }

  return {
    items,
    skippedCount: driveImages.length - items.length,
    skippedDownloads,
  };
}

async function main() {
  const result =
    config.syncMode === "local" ? buildGalleryItemsFromLocal() : await buildGalleryItemsFromDrive();

  if (!result) {
    if (config.driveFolderUrl) {
      console.log(`同步來源：${config.driveFolderUrl}`);
    }
    return;
  }

  writeGalleryData(result.items);

  console.log(`已同步 ${result.items.length} 張圖片到網站圖庫。`);
  if (result.skippedCount > 0) {
    console.log(`已自動略過 ${result.skippedCount} 張重複圖片。`);
  }
  if (result.skippedDownloads > 0) {
    console.log(`另有 ${result.skippedDownloads} 張圖片下載失敗，已先跳過。`);
  }
  if (config.driveFolderUrl) {
    console.log(`同步來源：${config.driveFolderUrl}`);
  }
  console.log("接下來重新整理網站確認，沒問題後再 git add / commit / push。");
}

main().catch((error) => {
  console.error(`同步失敗：${error.message}`);
  process.exitCode = 1;
});
