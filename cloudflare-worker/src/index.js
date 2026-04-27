const JSON_HEADERS = {
  "content-type": "application/json; charset=UTF-8",
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const corsHeaders = buildCorsHeaders(env, origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return jsonResponse(
        {
          ok: true,
          repo: env.GITHUB_REPO,
          branch: env.GITHUB_BRANCH || "main",
        },
        200,
        corsHeaders,
      );
    }

    if (request.method === "POST" && url.pathname === "/publish") {
      try {
        return await handlePublish(request, env, corsHeaders);
      } catch (error) {
        return jsonResponse(
          {
            ok: false,
            error: error instanceof Error ? error.message : "Unknown publish error",
          },
          500,
          corsHeaders,
        );
      }
    }

    return jsonResponse({ ok: false, error: "Not found" }, 404, corsHeaders);
  },
};

async function handlePublish(request, env, corsHeaders) {
  if (!env.GITHUB_TOKEN || !env.EDITOR_PASSWORD || !env.GITHUB_REPO) {
    return jsonResponse(
      {
        ok: false,
        error: "Worker secrets or variables are missing.",
      },
      500,
      corsHeaders,
    );
  }

  let payload;

  try {
    payload = await request.json();
  } catch (error) {
    return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400, corsHeaders);
  }

  if (String(payload?.editorPassword || "") !== String(env.EDITOR_PASSWORD)) {
    return jsonResponse({ ok: false, error: "Invalid editor password." }, 401, corsHeaders);
  }

  const boardItems = normalizeBoardItems(payload?.boardItems);
  const products = normalizeProducts(payload?.products);
  const fillerTemplates = normalizeFillerTemplates(payload?.fillerTemplates);
  const galleryUploadResult = prepareGalleryUploads(normalizeGalleryItems(payload?.galleryItems));
  const galleryItems = galleryUploadResult.items;

  const files = [
    ...galleryUploadResult.files,
    {
      path: "data/site-content.js",
      content: renderSiteContentFile({ boardItems, products }),
      message: payload?.commitMessage || "Update site content from editor",
    },
    {
      path: "data/filler-templates.js",
      content: renderFillerTemplatesFile(fillerTemplates),
      message: payload?.commitMessage || "Update filler templates from editor",
    },
    {
      path: "data/gallery-data.js",
      content: renderGalleryDataFile(galleryItems),
      message: payload?.commitMessage || "Update gallery data from editor",
    },
  ];

  const results = [];

  for (const file of files) {
    results.push(await updateGitHubFile(env, file));
  }

  return jsonResponse(
    {
      ok: true,
      updatedFiles: results.map((item) => item.path),
      commitShas: results.map((item) => item.commitSha),
    },
    200,
    corsHeaders,
  );
}

function buildCorsHeaders(env, origin) {
  const allowedOrigin = env.ALLOWED_ORIGIN || "*";
  const resolvedOrigin = allowedOrigin === "*" ? "*" : origin === allowedOrigin ? origin : allowedOrigin;

  return {
    "Access-Control-Allow-Origin": resolvedOrigin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(body, status, corsHeaders = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      ...JSON_HEADERS,
      ...corsHeaders,
    },
  });
}

async function updateGitHubFile(env, file) {
  const branch = env.GITHUB_BRANCH || "main";
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    "User-Agent": "heshi-site-publisher",
  };

  const encodedPath = encodeGitHubPath(file.path);
  const fileUrl = `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`;
  const currentResponse = await fetch(fileUrl, { headers });
  let currentFile = null;

  if (currentResponse.status === 404) {
    currentFile = null;
  } else if (!currentResponse.ok) {
    throw new Error(`Failed to fetch ${file.path}: ${currentResponse.status}`);
  } else {
    currentFile = await currentResponse.json();
  }

  const updateResponse = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/contents/${encodedPath}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: file.message,
      content: file.contentBase64 || toBase64(file.content),
      branch,
      ...(currentFile?.sha ? { sha: currentFile.sha } : {}),
    }),
  });

  if (!updateResponse.ok) {
    const errorText = await updateResponse.text();
    throw new Error(`Failed to update ${file.path}: ${updateResponse.status} ${errorText}`);
  }

  const result = await updateResponse.json();

  return {
    path: file.path,
    commitSha: result.commit?.sha || "",
  };
}

function renderSiteContentFile(data) {
  return `window.siteContent = ${JSON.stringify(data, null, 2)};\n`;
}

function renderFillerTemplatesFile(items) {
  return `window.fillerTemplates = ${JSON.stringify(items, null, 2)};\n`;
}

function renderGalleryDataFile(items) {
  return `window.galleryItems = ${JSON.stringify(items, null, 2)};\n`;
}

function prepareGalleryUploads(items) {
  const files = [];
  const nextItems = items.map((item, index) => {
    const asset = parseImageDataUrl(item.imageUrl);

    if (!asset) {
      return item;
    }

    const hash = hashString(asset.base64).slice(0, 10);
    const extension = mimeToExtension(asset.mimeType);
    const path = `assets/gallery/uploads/gallery-${index + 1}-${hash}.${extension}`;
    const publicPath = `./${path}`;

    files.push({
      path,
      contentBase64: asset.base64,
      message: "Upload gallery image from editor",
    });

    return {
      ...item,
      imageUrl: publicPath,
      driveUrl: item.driveUrl && !item.driveUrl.startsWith("data:image/") ? item.driveUrl : publicPath,
    };
  });

  return {
    items: nextItems,
    files,
  };
}

function normalizeBoardItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => ({
      type: String(item?.type || "").trim(),
      title: String(item?.title || "").trim(),
      date: String(item?.date || "").trim(),
      description: String(item?.description || "").trim(),
    }))
    .filter((item) => item.title && item.description);
}

function normalizeProducts(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => ({
      name: String(item?.name || "").trim(),
      status: String(item?.status || "").trim(),
      price: String(item?.price || "").trim(),
      description: String(item?.description || "").trim(),
      imageUrl: String(item?.imageUrl || "").trim(),
      href: String(item?.href || "").trim(),
    }))
    .filter((item) => item.name && item.imageUrl && item.href);
}

function normalizeGalleryItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => ({
      title: String(item?.title || "").trim(),
      category: String(item?.category || "未分類").trim() || "未分類",
      year: String(item?.year || "Google Drive 同步").trim() || "Google Drive 同步",
      description: String(item?.description || "").trim(),
      imageUrl: String(item?.imageUrl || "").trim(),
      driveUrl: String(item?.driveUrl || "").trim(),
    }))
    .filter((item) => item.imageUrl && item.driveUrl);
}

function getDefaultTemplateDefaults() {
  return {
    text: "想填的字\n放這裡",
    imageX: 50,
    imageY: 50,
    imageScale: 100,
    imageOutlineEnabled: true,
    imageOutlineWidth: 12,
    x: 50,
    y: 28,
    width: 42,
    fontSize: 64,
    lineHeight: 1.18,
    fontWeight: 900,
    fill: "#7c2d1c",
    outlineEnabled: true,
    outlineWidth: 9,
    stroke: "rgba(255, 248, 241, 0.96)",
    outputSize: 1080,
  };
}

function normalizeFillerTemplates(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item, index) => ({
      id: String(item?.id || `custom-template-${index + 1}`).trim(),
      name: String(item?.name || "").trim(),
      imageUrl: String(item?.imageUrl || "").trim(),
      downloadName: String(item?.downloadName || item?.id || `template-${index + 1}`).trim(),
      canvasWidth: Number(item?.canvasWidth) || 1080,
      canvasHeight: Number(item?.canvasHeight) || 1080,
      defaults: {
        ...getDefaultTemplateDefaults(),
        ...(item?.defaults || {}),
      },
    }))
    .filter((item) => item.id && item.name && item.imageUrl);
}

function parseImageDataUrl(value) {
  const match = String(value || "").match(/^data:(image\/(?:png|jpeg|jpg|gif|webp));base64,([a-z0-9+/=]+)$/i);

  if (!match) {
    return null;
  }

  return {
    mimeType: match[1].toLowerCase().replace("image/jpg", "image/jpeg"),
    base64: match[2],
  };
}

function mimeToExtension(mimeType) {
  const extensions = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
  };

  return extensions[mimeType] || "png";
}

function hashString(value) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

function encodeGitHubPath(path) {
  return path.split("/").map((segment) => encodeURIComponent(segment)).join("/");
}

function toBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
}
