const EDIT_AUTH_KEY = "heshi-edit-auth";
const BOARD_STORAGE_KEY = "heshi-board-items";
const EXTRA_GALLERY_STORAGE_KEY = "heshi-extra-gallery-items";
const GALLERY_OVERRIDE_STORAGE_KEY = "heshi-gallery-overrides";
const PRODUCT_STORAGE_KEY = "heshi-products";
const FILLER_TEMPLATE_STORAGE_KEY = "heshi-filler-templates";
const WORKER_URL_STORAGE_KEY = "heshi-worker-url";
const EDIT_PASSWORD_HASH = "1b3297141741db458d0a736651a4912f5b225577e51431e0bff56086f78e261f";

const defaultBoardItems = Array.isArray(window.siteContent?.boardItems) ? window.siteContent.boardItems : [];
const defaultGalleryItems = Array.isArray(window.galleryItems) ? window.galleryItems : [];
const defaultProducts = Array.isArray(window.siteContent?.products) ? window.siteContent.products : [];
const defaultFillerTemplates = Array.isArray(window.fillerTemplates) ? window.fillerTemplates : [];
const knownGalleryCategories = [
  ...new Set(
    [...defaultGalleryItems, ...loadGalleryItems()]
      .map((item) => item.category)
      .filter(Boolean),
  ),
];

const editorGate = document.querySelector("#editorGate");
const editorPanel = document.querySelector("#editorPanel");
const editorPasswordInput = document.querySelector("#editorPasswordInput");
const editorLoginButton = document.querySelector("#editorLoginButton");
const editorLoginStatus = document.querySelector("#editorLoginStatus");
const editorBoardGrid = document.querySelector("#editorBoardGrid");
const editorGalleryGrid = document.querySelector("#editorGalleryGrid");
const editorTemplateGrid = document.querySelector("#editorTemplateGrid");
const editorProductGrid = document.querySelector("#editorProductGrid");
const editorSaveButton = document.querySelector("#editorSaveButton");
const editorResetButton = document.querySelector("#editorResetButton");
const editorLogoutButton = document.querySelector("#editorLogoutButton");
const editorAddBoardButton = document.querySelector("#editorAddBoardButton");
const editorAddGalleryButton = document.querySelector("#editorAddGalleryButton");
const editorAddTemplateButton = document.querySelector("#editorAddTemplateButton");
const editorAddProductButton = document.querySelector("#editorAddProductButton");
const editorWorkerUrlInput = document.querySelector("#editorWorkerUrlInput");
const editorPublishPasswordInput = document.querySelector("#editorPublishPasswordInput");
const editorPublishButton = document.querySelector("#editorPublishButton");
const editorGallerySearchInput = document.querySelector("#editorGallerySearchInput");
const editorGalleryCategoryFilter = document.querySelector("#editorGalleryCategoryFilter");
const editorSaveStatus = document.querySelector("#editorSaveStatus");
const yearLabel = document.querySelector("#yearLabel");
const galleryEditorState = {
  search: "",
  category: "全部",
};
let galleryDraftItems = [];
let boardDraftItems = [];
let templateDraftItems = [];
let productDraftItems = [];
let editorStatusTimer = null;
const editorToast = document.createElement("div");
editorToast.className = "editor-toast";
document.body.append(editorToast);

function setEditorStatus(message, tone = "info") {
  if (!editorSaveStatus) {
    return;
  }

  editorSaveStatus.textContent = message;
  editorSaveStatus.dataset.tone = tone;
  editorToast.textContent = message;
  editorToast.dataset.tone = tone;
  editorSaveStatus.classList.toggle("is-visible", Boolean(message));
  editorToast.classList.toggle("is-visible", Boolean(message));

  if (editorStatusTimer) {
    window.clearTimeout(editorStatusTimer);
    editorStatusTimer = null;
  }

  if (message) {
    editorStatusTimer = window.setTimeout(() => {
      editorSaveStatus.classList.remove("is-visible");
      editorToast.classList.remove("is-visible");
    }, 2600);
  }
}

function normalizeBoardItems(items) {
  if (!Array.isArray(items)) {
    return defaultBoardItems;
  }

  const normalized = items
    .map((item) => ({
      type: String(item?.type || "").trim(),
      title: String(item?.title || "").trim(),
      date: String(item?.date || "").trim(),
      description: String(item?.description || "").trim(),
    }))
    .filter((item) => item.title || item.description || item.type || item.date);

  return normalized;
}

function loadBoardItems() {
  try {
    const stored = window.localStorage.getItem(BOARD_STORAGE_KEY);
    return stored ? normalizeBoardItems(JSON.parse(stored)) : normalizeBoardItems(defaultBoardItems);
  } catch (error) {
    return normalizeBoardItems(defaultBoardItems);
  }
}

function saveBoardItems(items) {
  window.localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(normalizeBoardItems(items)));
}

function normalizeEditableImageUrl(url) {
  if (!url) {
    return "";
  }

  const trimmed = url.trim();
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/);

  if (driveMatch) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  }

  return trimmed;
}

function normalizeGalleryItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => ({
      title: String(item?.title || "").trim(),
      category: String(item?.category || "未分類").trim() || "未分類",
      year: String(item?.year || "自訂新增").trim() || "自訂新增",
      description: String(item?.description || "").trim(),
      imageUrl: normalizeEditableImageUrl(String(item?.imageUrl || "").trim()),
      driveUrl: String(item?.driveUrl || item?.imageUrl || "").trim(),
    }))
    .filter((item) => item.imageUrl && item.driveUrl);
}

function loadGalleryItems() {
  try {
    const stored = window.localStorage.getItem(EXTRA_GALLERY_STORAGE_KEY);
    return stored ? normalizeGalleryItems(JSON.parse(stored)) : [];
  } catch (error) {
    return [];
  }
}

function saveGalleryItems(items) {
  window.localStorage.setItem(EXTRA_GALLERY_STORAGE_KEY, JSON.stringify(normalizeGalleryItems(items)));
}

function createGalleryMatchKey(item) {
  return String(item?.driveUrl || item?.imageUrl || item?.title || "")
    .trim()
    .toLowerCase();
}

function normalizeGalleryOverrides(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => ({
      matchKey: String(item?.matchKey || "").trim().toLowerCase(),
      title: String(item?.title || "").trim(),
      category: String(item?.category || "未分類").trim() || "未分類",
      year: String(item?.year || "Google Drive 同步").trim() || "Google Drive 同步",
      description: String(item?.description || "").trim(),
      imageUrl: normalizeEditableImageUrl(String(item?.imageUrl || "").trim()),
      driveUrl: String(item?.driveUrl || item?.imageUrl || "").trim(),
    }))
    .filter((item) => item.matchKey && item.imageUrl && item.driveUrl);
}

function loadGalleryOverrides() {
  try {
    const stored = window.localStorage.getItem(GALLERY_OVERRIDE_STORAGE_KEY);
    return stored ? normalizeGalleryOverrides(JSON.parse(stored)) : [];
  } catch (error) {
    return [];
  }
}

function saveGalleryOverrides(items) {
  window.localStorage.setItem(GALLERY_OVERRIDE_STORAGE_KEY, JSON.stringify(normalizeGalleryOverrides(items)));
}

function normalizeProducts(items) {
  if (!Array.isArray(items)) {
    return defaultProducts;
  }

  return items
    .map((item) => ({
      name: String(item?.name || "").trim(),
      status: String(item?.status || "").trim(),
      price: String(item?.price || "").trim(),
      description: String(item?.description || "").trim(),
      imageUrl: normalizeEditableImageUrl(String(item?.imageUrl || "").trim()),
      href: String(item?.href || "").trim(),
    }))
    .filter((item) => item.name && item.imageUrl && item.href);
}

function loadProducts() {
  try {
    const stored = window.localStorage.getItem(PRODUCT_STORAGE_KEY);
    return stored ? normalizeProducts(JSON.parse(stored)) : normalizeProducts(defaultProducts);
  } catch (error) {
    return normalizeProducts(defaultProducts);
  }
}

function saveProducts(items) {
  window.localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(normalizeProducts(items)));
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
    return defaultFillerTemplates;
  }

  return items
    .map((item, index) => {
      const fallbackDefaults = defaultFillerTemplates.find((template) => template.id === item?.id)?.defaults || getDefaultTemplateDefaults();
      return {
        id: String(item?.id || `custom-template-${index + 1}`).trim(),
        name: String(item?.name || "").trim(),
        imageUrl: normalizeEditableImageUrl(String(item?.imageUrl || "").trim()),
        downloadName: String(item?.downloadName || item?.id || `template-${index + 1}`).trim(),
        canvasWidth: Number(item?.canvasWidth) || 1080,
        canvasHeight: Number(item?.canvasHeight) || 1080,
        defaults: {
          ...fallbackDefaults,
          ...(item?.defaults || {}),
        },
      };
    })
    .filter((item) => item.id && item.name && item.imageUrl);
}

function loadFillerTemplates() {
  try {
    const stored = window.localStorage.getItem(FILLER_TEMPLATE_STORAGE_KEY);
    return stored ? normalizeFillerTemplates(JSON.parse(stored)) : normalizeFillerTemplates(defaultFillerTemplates);
  } catch (error) {
    return normalizeFillerTemplates(defaultFillerTemplates);
  }
}

function saveFillerTemplates(items) {
  window.localStorage.setItem(FILLER_TEMPLATE_STORAGE_KEY, JSON.stringify(normalizeFillerTemplates(items)));
}

function loadWorkerUrl() {
  return window.localStorage.getItem(WORKER_URL_STORAGE_KEY) || "";
}

function saveWorkerUrl(url) {
  window.localStorage.setItem(WORKER_URL_STORAGE_KEY, url.trim());
}

function buildPublishableGalleryItems() {
  const { overrides, customItems } = collectGalleryState();
  const overrideMap = new Map(overrides.map((item) => [item.matchKey, item]));
  const mergedDefaults = defaultGalleryItems.map((item) => {
    const matchKey = createGalleryMatchKey(item);
    const override = overrideMap.get(matchKey);

    if (!override) {
      return item;
    }

    return {
      title: override.title,
      category: override.category,
      year: override.year,
      description: override.description,
      imageUrl: override.imageUrl,
      driveUrl: override.driveUrl,
    };
  });

  return [...mergedDefaults, ...customItems];
}

function loadEditableGalleryItems() {
  const overrides = new Map(loadGalleryOverrides().map((item) => [item.matchKey, item]));
  const baseItems = defaultGalleryItems.map((item) => {
    const matchKey = createGalleryMatchKey(item);
    const nextItem = overrides.get(matchKey) || item;

    return {
      ...nextItem,
      matchKey,
      source: "default",
    };
  });

  const customItems = loadGalleryItems().map((item, index) => ({
    ...item,
    matchKey: `custom-${index}`,
    source: "custom",
  }));

  return [...baseItems, ...customItems];
}

function getAllKnownGalleryCategories() {
  return [
    ...new Set(
      loadEditableGalleryItems()
        .map((item) => item.category)
        .filter(Boolean),
    ),
  ];
}

function renderGalleryCategoryFilter() {
  if (!editorGalleryCategoryFilter) {
    return;
  }

  const categories = getAllKnownGalleryCategories();
  editorGalleryCategoryFilter.innerHTML = ['<option value="全部">全部分類</option>', ...categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)].join("");
  editorGalleryCategoryFilter.value = categories.includes(galleryEditorState.category) ? galleryEditorState.category : "全部";
}

function filterGalleryItems(items) {
  const search = galleryEditorState.search.trim().toLowerCase();

  return items.filter((item) => {
    const categoryMatch = galleryEditorState.category === "全部" || item.category === galleryEditorState.category;
    const searchMatch =
      !search ||
      [item.title, item.category, item.description, item.driveUrl]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search));

    return categoryMatch && searchMatch;
  });
}

function renderBoardEditor() {
  const currentItems = boardDraftItems.length > 0 ? boardDraftItems : loadBoardItems();
  editorBoardGrid.innerHTML = currentItems.length > 0
    ? currentItems
    .map(
      (item, index) => `
        <article class="editor-board-card" data-editor-index="${index}">
          <div class="editor-board-head">
            <strong>公告 ${index + 1}</strong>
            <button class="button button-ghost editor-remove-button" type="button" data-remove-board="${index}">移除</button>
          </div>
          <label class="filler-field">
            <span>分類</span>
            <input type="text" data-field="type" value="${escapeHtml(item.type)}" />
          </label>
          <label class="filler-field">
            <span>標題</span>
            <input type="text" data-field="title" value="${escapeHtml(item.title)}" />
          </label>
          <label class="filler-field">
            <span>日期</span>
            <input type="text" data-field="date" value="${escapeHtml(item.date)}" />
          </label>
          <label class="filler-field">
            <span>內容</span>
            <textarea rows="4" data-field="description">${escapeHtml(item.description)}</textarea>
          </label>
        </article>
      `,
    )
    .join("")
    : '<div class="editor-empty-state">目前沒有公告，按上方按鈕可以新增。</div>';

  editorBoardGrid.querySelectorAll("[data-remove-board]").forEach((button) => {
    button.addEventListener("click", () => {
      boardDraftItems = collectBoardDraftItems();
      boardDraftItems.splice(Number(button.dataset.removeBoard), 1);
      renderBoardEditor();
      setEditorStatus("已移除公告，記得按一次儲存確認。", "info");
    });
  });
}

function renderGalleryEditor(items = loadEditableGalleryItems()) {
  const currentItems = items.length > 0 ? items : loadEditableGalleryItems();
  const visibleItems = filterGalleryItems(currentItems);
  const categoryOptions = getAllKnownGalleryCategories()
    .map((category) => `<option value="${escapeHtml(category)}"></option>`)
    .join("");
  renderGalleryCategoryFilter();

  editorGalleryGrid.innerHTML = visibleItems.length > 0
    ? visibleItems
    .map(
      (item, index) => `
        <article class="editor-board-card" data-gallery-index="${index}" data-gallery-source="${escapeHtml(item.source || "custom")}" data-gallery-match-key="${escapeHtml(item.matchKey || "")}">
          <div class="editor-gallery-preview-wrap">
            <img class="editor-gallery-preview" src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.title || item.category || `圖片 ${index + 1}`)}" loading="lazy" />
          </div>
          <div class="editor-board-head">
            <strong>圖片 ${index + 1}</strong>
            <div class="editor-inline-actions">
              <span class="editor-source-badge">${item.source === "default" ? "現有圖片" : "自訂圖片"}</span>
              ${item.source === "custom" ? `<button class="button button-ghost editor-remove-button" type="button" data-remove-gallery="${index}">移除</button>` : ""}
            </div>
          </div>
          <label class="filler-field">
            <span>標題</span>
            <input type="text" data-field="title" value="${escapeHtml(item.title)}" />
          </label>
          <label class="filler-field">
            <span>分類</span>
            <input type="text" data-field="category" list="editorGalleryCategories" value="${escapeHtml(item.category)}" />
          </label>
          <label class="filler-field">
            <span>圖片網址</span>
            <input type="text" data-field="imageUrl" value="${escapeHtml(item.imageUrl)}" />
          </label>
          <label class="filler-field editor-upload-field">
            <span>上傳圖片</span>
            <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" data-upload-gallery="${escapeHtml(item.matchKey || "")}" />
          </label>
          <label class="filler-field">
            <span>點擊連結</span>
            <input type="text" data-field="driveUrl" value="${escapeHtml(item.driveUrl)}" />
          </label>
          <label class="filler-field">
            <span>說明</span>
            <textarea rows="3" data-field="description">${escapeHtml(item.description)}</textarea>
          </label>
        </article>
      `,
    )
    .join("")
    : '<div class="editor-empty-state">目前沒有符合搜尋條件的圖片。</div>';

  const existingList = document.querySelector("#editorGalleryCategories");
  if (existingList) {
    existingList.remove();
  }
  editorGalleryGrid.insertAdjacentHTML("beforebegin", `<datalist id="editorGalleryCategories">${categoryOptions}</datalist>`);

  editorGalleryGrid.querySelectorAll("[data-remove-gallery]").forEach((button) => {
    button.addEventListener("click", () => {
      collectGalleryDraftItems();
      const card = button.closest("[data-gallery-match-key]");
      const matchKey = card?.dataset.galleryMatchKey || "";
      galleryDraftItems = galleryDraftItems.filter((item) => item.matchKey !== matchKey);
      renderGalleryEditor(galleryDraftItems);
      setEditorStatus("已移除圖片項目，記得按一次儲存確認。", "info");
    });
  });

  editorGalleryGrid.querySelectorAll("[data-upload-gallery]").forEach((input) => {
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      const matchKey = input.dataset.uploadGallery || "";

      if (!file) {
        return;
      }

      if (!file.type.startsWith("image/")) {
        setEditorStatus("請上傳圖片檔。", "error");
        input.value = "";
        return;
      }

      if (file.size > 8 * 1024 * 1024) {
        setEditorStatus("圖片超過 8MB，請先壓縮後再上傳。", "error");
        input.value = "";
        return;
      }

      try {
        const uploadedImageUrl = await readImageFileAsDataUrl(file);
        collectGalleryDraftItems();
        const targetIndex = galleryDraftItems.findIndex((item) => item.matchKey === matchKey);

        if (targetIndex >= 0) {
          const nextItem = {
            ...galleryDraftItems[targetIndex],
            imageUrl: uploadedImageUrl,
            driveUrl: uploadedImageUrl,
          };

          if (!nextItem.title) {
            nextItem.title = file.name.replace(/\.[^.]+$/i, "");
          }

          galleryDraftItems[targetIndex] = nextItem;
        }

        renderGalleryEditor(galleryDraftItems);
        setEditorStatus(`已載入圖片：${file.name}，記得按一次儲存確認。`, "success");
      } catch (error) {
        setEditorStatus("圖片讀取失敗，請再試一次。", "error");
      }
    });
  });
}

function renderTemplateEditor() {
  const items = templateDraftItems.length > 0 ? templateDraftItems : loadFillerTemplates();
  templateDraftItems = items;

  editorTemplateGrid.innerHTML = items.length > 0
    ? items
      .map(
        (item, index) => `
          <article class="editor-board-card" data-template-index="${index}">
            <div class="editor-gallery-preview-wrap">
              <img class="editor-gallery-preview" src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}" loading="lazy" />
            </div>
            <div class="editor-board-head">
              <strong>SVG ${index + 1}</strong>
              <button class="button button-ghost editor-remove-button" type="button" data-remove-template="${index}">移除</button>
            </div>
            <label class="filler-field">
              <span>名稱</span>
              <input type="text" data-field="name" value="${escapeHtml(item.name)}" />
            </label>
            <label class="filler-field">
              <span>SVG 網址</span>
              <input type="text" data-field="imageUrl" value="${escapeHtml(item.imageUrl)}" />
            </label>
            <label class="filler-field">
              <span>上傳 SVG</span>
              <input type="file" accept=".svg,image/svg+xml" data-upload-template="${index}" />
            </label>
            <label class="filler-field">
              <span>下載檔名</span>
              <input type="text" data-field="downloadName" value="${escapeHtml(item.downloadName)}" />
            </label>
          </article>
        `,
      )
      .join("")
    : '<div class="editor-empty-state">目前沒有 SVG 模板，按上方按鈕可以新增。</div>';

  editorTemplateGrid.querySelectorAll("[data-remove-template]").forEach((button) => {
    button.addEventListener("click", () => {
      templateDraftItems = collectTemplateDraftItems();
      templateDraftItems.splice(Number(button.dataset.removeTemplate), 1);
      renderTemplateEditor();
      setEditorStatus("已移除 SVG 模板，記得按一次儲存確認。", "info");
    });
  });

  editorTemplateGrid.querySelectorAll("[data-upload-template]").forEach((input) => {
    input.addEventListener("change", async () => {
      const targetIndex = Number(input.dataset.uploadTemplate);
      const file = input.files?.[0];

      if (!file) {
        return;
      }

      if (!file.name.toLowerCase().endsWith(".svg") && file.type !== "image/svg+xml") {
        setEditorStatus("請上傳 SVG 檔。", "error");
        input.value = "";
        return;
      }

      try {
        templateDraftItems = collectTemplateDraftItems();
        const uploadedImageUrl = await readSvgFileAsDataUrl(file);
        const nextTemplate = templateDraftItems[targetIndex];

        if (!nextTemplate) {
          return;
        }

        nextTemplate.imageUrl = uploadedImageUrl;
        if (!nextTemplate.name) {
          nextTemplate.name = file.name.replace(/\.svg$/i, "");
        }
        if (!nextTemplate.downloadName || nextTemplate.downloadName.startsWith("custom-template-")) {
          nextTemplate.downloadName = file.name.replace(/\.svg$/i, "").trim().toLowerCase().replace(/\s+/g, "-");
        }

        renderTemplateEditor();
        setEditorStatus(`已載入 SVG：${file.name}，記得按一次儲存確認。`, "success");
      } catch (error) {
        setEditorStatus("SVG 讀取失敗，請再試一次。", "error");
      } finally {
        input.value = "";
      }
    });
  });
}

function renderProductEditor() {
  const items = productDraftItems.length > 0 ? productDraftItems : loadProducts();
  productDraftItems = items;

  editorProductGrid.innerHTML = items.length > 0
    ? items
      .map(
        (item, index) => `
          <article class="editor-board-card" data-product-index="${index}">
            <div class="editor-gallery-preview-wrap">
              <img class="editor-gallery-preview" src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}" loading="lazy" />
            </div>
            <div class="editor-board-head">
              <strong>商品 ${index + 1}</strong>
              <button class="button button-ghost editor-remove-button" type="button" data-remove-product="${index}">移除</button>
            </div>
            <label class="filler-field">
              <span>名稱</span>
              <input type="text" data-field="name" value="${escapeHtml(item.name)}" />
            </label>
            <label class="filler-field">
              <span>狀態</span>
              <input type="text" data-field="status" value="${escapeHtml(item.status)}" />
            </label>
            <label class="filler-field">
              <span>價格</span>
              <input type="text" data-field="price" value="${escapeHtml(item.price)}" />
            </label>
            <label class="filler-field">
              <span>圖片網址</span>
              <input type="text" data-field="imageUrl" value="${escapeHtml(item.imageUrl)}" />
            </label>
            <label class="filler-field">
              <span>商品連結</span>
              <input type="text" data-field="href" value="${escapeHtml(item.href)}" />
            </label>
            <label class="filler-field">
              <span>說明</span>
              <textarea rows="3" data-field="description">${escapeHtml(item.description)}</textarea>
            </label>
          </article>
        `,
      )
      .join("")
    : '<div class="editor-empty-state">目前沒有商品，按上方按鈕可以新增。</div>';

  editorProductGrid.querySelectorAll("[data-remove-product]").forEach((button) => {
    button.addEventListener("click", () => {
      productDraftItems = collectProductDraftItems();
      productDraftItems.splice(Number(button.dataset.removeProduct), 1);
      renderProductEditor();
      setEditorStatus("已移除商品，記得按一次儲存確認。", "info");
    });
  });
}

function collectBoardItems() {
  return collectBoardDraftItems()
    .filter((item) => item.title && item.description);
}

function collectBoardDraftItems() {
  const cards = [...editorBoardGrid.querySelectorAll("[data-editor-index]")];

  if (boardDraftItems.length === 0) {
    boardDraftItems = loadBoardItems();
  }

  if (cards.length === 0) {
    return boardDraftItems;
  }

  boardDraftItems = cards
    .map((card) => {
      const read = (field) => card.querySelector(`[data-field="${field}"]`)?.value?.trim() || "";
      return {
        type: read("type"),
        title: read("title"),
        date: read("date"),
        description: read("description"),
      };
    });

  return boardDraftItems;
}

function collectGalleryState() {
  const overrides = [];
  const customItems = [];

  collectGalleryDraftItems()
    .filter((item) => item.imageUrl && item.driveUrl)
    .forEach((item) => {
      if (item.source === "default") {
        overrides.push({
          matchKey: item.matchKey,
          title: item.title,
          category: item.category,
          year: "Google Drive 同步",
          description: item.description,
          imageUrl: item.imageUrl,
          driveUrl: item.driveUrl,
        });
        return;
      }

      customItems.push({
        title: item.title,
        category: item.category,
        year: "自訂新增",
        description: item.description,
        imageUrl: item.imageUrl,
        driveUrl: item.driveUrl,
      });
    });

  return { overrides, customItems };
}

function collectGalleryDraftItems() {
  const cards = [...editorGalleryGrid.querySelectorAll("[data-gallery-index]")];

  if (galleryDraftItems.length === 0) {
    galleryDraftItems = loadEditableGalleryItems();
  }

  if (cards.length === 0) {
    return galleryDraftItems;
  }

  const liveEdits = new Map(cards.map((card) => {
    const read = (field) => card.querySelector(`[data-field="${field}"]`)?.value?.trim() || "";
    const item = {
      source: card.dataset.gallerySource || "custom",
      matchKey: card.dataset.galleryMatchKey || "",
      title: read("title"),
      category: read("category") || "未分類",
      year: read("year") || (card.dataset.gallerySource === "default" ? "Google Drive 同步" : "自訂新增"),
      description: read("description"),
      imageUrl: read("imageUrl"),
      driveUrl: read("driveUrl") || read("imageUrl"),
    };

    return [item.matchKey, item];
  }));

  galleryDraftItems = galleryDraftItems.map((item) => liveEdits.get(item.matchKey) || item);
  return galleryDraftItems;
}

function collectTemplateDraftItems() {
  const cards = [...editorTemplateGrid.querySelectorAll("[data-template-index]")];

  if (templateDraftItems.length === 0) {
    templateDraftItems = loadFillerTemplates();
  }

  if (cards.length === 0) {
    return templateDraftItems;
  }

  templateDraftItems = cards.map((card, index) => {
    const read = (field) => card.querySelector(`[data-field="${field}"]`)?.value?.trim() || "";
    const existing = templateDraftItems[index] || defaultFillerTemplates[index] || {};
    return {
      ...existing,
      id: existing.id || `custom-template-${index + 1}`,
      name: read("name"),
      imageUrl: read("imageUrl"),
      downloadName: read("downloadName") || existing.downloadName || `template-${index + 1}`,
    };
  });

  return templateDraftItems;
}

function collectProductDraftItems() {
  const cards = [...editorProductGrid.querySelectorAll("[data-product-index]")];

  if (productDraftItems.length === 0) {
    productDraftItems = loadProducts();
  }

  if (cards.length === 0) {
    return productDraftItems;
  }

  productDraftItems = cards.map((card) => {
    const read = (field) => card.querySelector(`[data-field="${field}"]`)?.value?.trim() || "";
    return {
      name: read("name"),
      status: read("status"),
      price: read("price"),
      description: read("description"),
      imageUrl: read("imageUrl"),
      href: read("href"),
    };
  });

  return productDraftItems;
}

function syncGallerySearchControls() {
  if (editorGallerySearchInput) {
    editorGallerySearchInput.value = galleryEditorState.search;
  }

  if (editorGalleryCategoryFilter) {
    editorGalleryCategoryFilter.value = galleryEditorState.category;
  }
}

async function publishToWorker() {
  const workerUrl = editorWorkerUrlInput?.value?.trim() || "";
  const publishPassword = editorPublishPasswordInput?.value?.trim() || "";

  if (!workerUrl) {
    setEditorStatus("請先填入 Worker 網址。", "error");
    return;
  }

  if (!publishPassword) {
    setEditorStatus("請先填入發布密碼。", "error");
    return;
  }

  saveWorkerUrl(workerUrl);

  const boardItems = collectBoardItems();
  const { overrides, customItems } = collectGalleryState();
  const products = collectProductDraftItems().filter((item) => item.name && item.imageUrl && item.href);
  const fillerTemplates = collectTemplateDraftItems().filter((item) => item.name && item.imageUrl);
  const galleryItems = buildPublishableGalleryItems();

  saveBoardItems(boardItems);
  saveGalleryOverrides(overrides);
  saveGalleryItems(customItems);
  saveFillerTemplates(collectTemplateDraftItems());
  saveProducts(collectProductDraftItems());

  editorPublishButton.disabled = true;
  setEditorStatus("發布中，正在送到 Cloudflare Worker...", "info");

  try {
    const response = await fetch(`${workerUrl.replace(/\/$/, "")}/publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        editorPassword: publishPassword,
        boardItems,
        products,
        fillerTemplates,
        galleryItems,
        commitMessage: `Update site content from editor (${new Date().toISOString()})`,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result?.ok) {
      throw new Error(result?.error || "publish failed");
    }

    editorPublishPasswordInput.value = "";
    setEditorStatus("發布成功，等 GitHub Pages 更新後，公開站就會看到。", "success");
  } catch (error) {
    setEditorStatus(`發布失敗：${error.message}`, "error");
  } finally {
    editorPublishButton.disabled = false;
  }
}

function readSvgFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const svgText = typeof reader.result === "string" ? reader.result : "";

      if (!svgText.trim()) {
        reject(new Error("empty svg"));
        return;
      }

      resolve(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`);
    };

    reader.onerror = () => reject(reader.error || new Error("read failed"));
    reader.readAsText(file);
  });
}

function readImageFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function hashText(value) {
  const encoded = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", encoded);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function showEditor() {
  editorGate.classList.add("is-hidden");
  editorPanel.classList.remove("is-hidden");
  boardDraftItems = loadBoardItems();
  templateDraftItems = loadFillerTemplates();
  productDraftItems = loadProducts();
  renderBoardEditor();
  galleryDraftItems = loadEditableGalleryItems();
  renderGalleryEditor(galleryDraftItems);
  renderTemplateEditor();
  renderProductEditor();
  if (editorWorkerUrlInput) {
    editorWorkerUrlInput.value = loadWorkerUrl();
  }
}

function showGate() {
  editorPanel.classList.add("is-hidden");
  editorGate.classList.remove("is-hidden");
}

async function handleLogin() {
  const password = editorPasswordInput.value.trim();

  if (!password) {
    editorLoginStatus.textContent = "請先輸入密碼。";
    return;
  }

  const hash = await hashText(password);

  if (hash !== EDIT_PASSWORD_HASH) {
    editorLoginStatus.textContent = "密碼不正確。";
    return;
  }

  window.sessionStorage.setItem(EDIT_AUTH_KEY, "ok");
  editorPasswordInput.value = "";
  editorLoginStatus.textContent = "";
  showEditor();
}

function init() {
  if (yearLabel) {
    yearLabel.textContent = new Date().getFullYear();
  }

  if (window.sessionStorage.getItem(EDIT_AUTH_KEY) === "ok") {
    showEditor();
  }

  editorLoginButton?.addEventListener("click", handleLogin);
  editorPasswordInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleLogin();
    }
  });

  editorSaveButton?.addEventListener("click", () => {
    saveBoardItems(collectBoardItems());
    const { overrides, customItems } = collectGalleryState();
    saveGalleryOverrides(overrides);
    saveGalleryItems(customItems);
    saveFillerTemplates(collectTemplateDraftItems());
    saveProducts(collectProductDraftItems());
    setEditorStatus("儲存成功，已寫入這台裝置的編輯內容。", "success");
  });

  editorResetButton?.addEventListener("click", () => {
    window.localStorage.removeItem(BOARD_STORAGE_KEY);
    window.localStorage.removeItem(EXTRA_GALLERY_STORAGE_KEY);
    window.localStorage.removeItem(GALLERY_OVERRIDE_STORAGE_KEY);
    window.localStorage.removeItem(PRODUCT_STORAGE_KEY);
    window.localStorage.removeItem(FILLER_TEMPLATE_STORAGE_KEY);
    boardDraftItems = loadBoardItems();
    renderBoardEditor();
    galleryDraftItems = loadEditableGalleryItems();
    renderGalleryEditor(galleryDraftItems);
    templateDraftItems = loadFillerTemplates();
    productDraftItems = loadProducts();
    renderTemplateEditor();
    renderProductEditor();
    setEditorStatus("已重設成預設公告、圖庫、SVG 模板與商品。", "info");
  });

  editorLogoutButton?.addEventListener("click", () => {
    window.sessionStorage.removeItem(EDIT_AUTH_KEY);
    setEditorStatus("", "info");
    editorLoginStatus.textContent = "";
    showGate();
  });

  editorAddGalleryButton?.addEventListener("click", () => {
    const nextItems = collectGalleryDraftItems();
    nextItems.push({
      title: "",
      category: "未分類",
      year: "自訂新增",
      description: "",
      imageUrl: "",
      driveUrl: "",
      matchKey: `custom-${Date.now()}`,
      source: "custom",
    });
    galleryDraftItems = nextItems;
    renderGalleryEditor(nextItems);
    setEditorStatus("已新增圖片欄位，填好後按儲存。", "info");
  });

  editorAddBoardButton?.addEventListener("click", () => {
    boardDraftItems = collectBoardDraftItems();
    boardDraftItems.push({
      type: "最新公告",
      title: "",
      date: "近期",
      description: "",
    });
    renderBoardEditor();
    setEditorStatus("已新增公告欄位，填好後按儲存。", "info");
  });

  editorAddTemplateButton?.addEventListener("click", () => {
    templateDraftItems = collectTemplateDraftItems();
    const nextIndex = templateDraftItems.length + 1;
    templateDraftItems.push({
      id: `custom-template-${Date.now()}`,
      name: "",
      imageUrl: "",
      downloadName: `custom-template-${nextIndex}`,
      canvasWidth: 1080,
      canvasHeight: 1080,
      defaults: getDefaultTemplateDefaults(),
    });
    renderTemplateEditor();
    setEditorStatus("已新增 SVG 欄位，填好後按儲存。", "info");
  });

  editorAddProductButton?.addEventListener("click", () => {
    productDraftItems = collectProductDraftItems();
    productDraftItems.push({
      name: "",
      status: "新上架",
      price: "",
      description: "",
      imageUrl: "",
      href: "",
    });
    renderProductEditor();
    setEditorStatus("已新增商品欄位，填好後按儲存。", "info");
  });

  editorGallerySearchInput?.addEventListener("input", () => {
    galleryEditorState.search = editorGallerySearchInput.value;
    renderGalleryEditor(collectGalleryDraftItems());
  });

  editorGalleryCategoryFilter?.addEventListener("change", () => {
    galleryEditorState.category = editorGalleryCategoryFilter.value;
    renderGalleryEditor(collectGalleryDraftItems());
  });

  editorPublishButton?.addEventListener("click", publishToWorker);

  syncGallerySearchControls();
}

init();
