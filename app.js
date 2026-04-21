const socialLinks = [
  {
    name: "X",
    icon: "𝕏",
    handle: "@R9clyD7cgRsi31f",
    description: "即時更新、碎念、作品發布與轉發集中地。",
    href: "https://x.com/R9clyD7cgRsi31f",
    color: "#df5a2a",
  },
  {
    name: "Pixiv",
    icon: "P",
    handle: "users/58208260",
    description: "插畫作品整理、角色圖與完整圖庫入口。",
    href: "https://www.pixiv.net/users/58208260",
    color: "#8d2f1a",
  },
  {
    name: "Threads",
    icon: "@",
    handle: "@red_stone244",
    description: "短內容更新、近況公告與社群互動。",
    href: "https://www.threads.com/@red_stone244?igshid=NTc4MTIwNjQ2YQ==",
    color: "#0f7c78",
  },
  {
    name: "Bilibili",
    icon: "B",
    handle: "3546839066348040",
    description: "影片、剪輯、直播存檔與更多動態內容。",
    href: "https://space.bilibili.com/3546839066348040?spm_id_from=333.1007.0.0",
    color: "#bd8a2a",
  },
  {
    name: "Instagram",
    icon: "◎",
    handle: "@red_stone244",
    description: "日常更新、作品花絮、短影片與限時動態。",
    href: "https://www.instagram.com/red_stone244?igsh=cnAyb2YzZzZlbjh5&utm_source=qr",
    color: "#a3486a",
  },
  {
    name: "Facebook",
    icon: "f",
    handle: "赫石 Red stone",
    description: "粉專內容、活動貼文與較完整的公告整理。",
    href: "https://www.facebook.com/people/%E8%B5%AB%E7%9F%B3Red-stone/100069768168066/",
    color: "#3559a8",
  },
  {
    name: "Discord",
    icon: "◌",
    handle: "社群伺服器",
    description: "加入社群聊天、接收通知與參與互動。",
    href: "https://discord.gg/uhtzxCtQb",
    color: "#5865f2",
  },
  {
    name: "YouTube",
    icon: "▶",
    handle: "@blue-jade",
    description: "影片作品、企劃紀錄與長內容更新。",
    href: "https://youtube.com/@blue-jade?si=-XhUeF55hp2Ryqic",
    color: "#c4312f",
  },
  {
    name: "巴哈姆特",
    icon: "哈",
    handle: "pyh131313",
    description: "創作發表、文章紀錄與個人頁面整理。",
    href: "https://home.gamer.com.tw/profile/index.php?&owner=pyh131313",
    color: "#1f8f7a",
  },
  {
    name: "7-ELEVEN 賣場",
    icon: "✦",
    handle: "最新商品頁",
    description: "周邊、商品與目前可購買的上架入口。",
    href: "https://myship.7-11.com.tw/general/detail/GM2603165802747",
    color: "#d96b1d",
  },
];

const siteIconSources = [
  "./assets/fillers/rose-bubble.svg",
  "./assets/fillers/rose-sign.svg",
  "./assets/fillers/mold-pillow.svg",
];
const fillerVersion = "beta v2026.04.21.1";

const boardItems = [
  {
    type: "最新公告",
    title: "壓克力牌週邊絕讚販售中",
    date: "近期",
    description: "目前壓克力牌周邊持續販售中，想購買可以直接前往商品區查看。",
  },
  {
    type: "網站更新",
    title: "填詞器開放測試",
    date: "近期",
    description: "填詞器頁面已經開放測試，現在可以先試用模板、拖曳文字和輸出圖片。",
  },
  {
    type: "工作近況",
    title: "近期已恢復正常更新",
    date: "近期",
    description: "最近已經恢復正常更新，作品與近況都會陸續補上。",
  },
];

const products = [
  {
    name: "薔薇園立牌第一彈",
    status: "新上架",
    price: "NT$120",
    description: "黴醬和薔薇的 3cm 立牌，點進去可直接查看商品細節與下單。",
    imageUrl: "./assets/products/rose-stand-first-wave.jpg",
    href: "https://myship.7-11.com.tw/general/detail/GM2603165802747",
  },
];

const socialGrid = document.querySelector("#socialGrid");
const galleryGrid = document.querySelector("#galleryGrid");
const galleryFilters = document.querySelector("#galleryFilters");
const boardList = document.querySelector("#boardList");
const shopGrid = document.querySelector("#shopGrid");
const fillerTemplateList = document.querySelector("#fillerTemplateList");
const fillerStage = document.querySelector("#fillerStage");
const fillerPreviewArt = document.querySelector("#fillerPreviewArt");
const fillerPreviewText = document.querySelector("#fillerPreviewText");
const fillerTemplateName = document.querySelector("#fillerTemplateName");
const fillerTextInput = document.querySelector("#fillerTextInput");
const fillerImageScaleInput = document.querySelector("#fillerImageScaleInput");
const fillerImageScaleValue = document.querySelector("#fillerImageScaleValue");
const fillerImageOutlineWidthInput = document.querySelector("#fillerImageOutlineWidthInput");
const fillerImageOutlineWidthValue = document.querySelector("#fillerImageOutlineWidthValue");
const fillerFontSizeInput = document.querySelector("#fillerFontSizeInput");
const fillerFontSizeValue = document.querySelector("#fillerFontSizeValue");
const fillerWidthInput = document.querySelector("#fillerWidthInput");
const fillerWidthValue = document.querySelector("#fillerWidthValue");
const fillerLineHeightInput = document.querySelector("#fillerLineHeightInput");
const fillerLineHeightValue = document.querySelector("#fillerLineHeightValue");
const fillerOutlineWidthInput = document.querySelector("#fillerOutlineWidthInput");
const fillerOutlineWidthValue = document.querySelector("#fillerOutlineWidthValue");
const fillerOutputSizeInput = document.querySelector("#fillerOutputSizeInput");
const fillerDownloadButton = document.querySelector("#fillerDownloadButton");
const fillerImageOutlineToggleInput = document.querySelector("#fillerImageOutlineToggleInput");
const fillerOutlineToggleInput = document.querySelector("#fillerOutlineToggleInput");
const fillerResetButton = document.querySelector("#fillerResetButton");
const fillerVersionLabel = document.querySelector("#fillerVersionLabel");
const siteFavicon = document.querySelector("#siteFavicon");
const headlineTitle = document.querySelector("#headlineTitle");
const headlineText = document.querySelector("#headlineText");
const headlineType = document.querySelector("#headlineType");
const headlineDate = document.querySelector("#headlineDate");
const headlineBadge = document.querySelector("#headlineBadge");
const heroStats = document.querySelector("#heroStats");
const yearLabel = document.querySelector("#yearLabel");
const marqueeTrack = document.querySelector("#marqueeTrack");
const galleryItems = Array.isArray(window.galleryItems) ? window.galleryItems : [];
const fillerTemplates = Array.isArray(window.fillerTemplates) ? window.fillerTemplates : [];
const fillerTemplateAssets = window.fillerTemplateAssets || {};
const preferredCategoryOrder = ["薔薇", "妮娜", "鍾馗", "黴醬", "歐妮亞", "其他", "未分類"];
const fillerTemplateUrlCache = new Map();

let activeCategory = "全部";
let headlineIndex = 0;
const fillerState = {
  templateId: fillerTemplates[0]?.id || null,
  text: "",
  imageX: 50,
  imageY: 50,
  imageScale: 100,
  imageOutlineEnabled: true,
  imageOutlineWidth: 12,
  x: 74,
  y: 24,
  width: 28,
  fontSize: 64,
  lineHeight: 1.18,
  outlineEnabled: true,
  outlineWidth: 9,
  outputSize: 1080,
};
let fillerDragState = null;

function shuffled(items) {
  const clone = [...items];

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }

  return clone;
}

function applyRandomFavicon() {
  if (!siteFavicon || siteIconSources.length === 0) {
    return;
  }

  const nextIcon = siteIconSources[Math.floor(Math.random() * siteIconSources.length)];
  siteFavicon.href = nextIcon;
}

function applyVersionLabel() {
  if (!fillerVersionLabel) {
    return;
  }

  fillerVersionLabel.textContent = fillerVersion;
}

function artPattern(colors) {
  return `
    radial-gradient(circle at 22% 22%, rgba(255,255,255,0.34), transparent 18%),
    radial-gradient(circle at 80% 30%, rgba(255,255,255,0.18), transparent 22%),
    linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 56%, ${colors[2]} 100%)
  `;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getActiveFillerTemplate() {
  return fillerTemplates.find((template) => template.id === fillerState.templateId) || fillerTemplates[0] || null;
}

function syncFillerControlLabels() {
  if (fillerImageScaleValue) {
    fillerImageScaleValue.textContent = `${fillerState.imageScale}%`;
  }
  if (fillerImageOutlineWidthValue) {
    fillerImageOutlineWidthValue.textContent = fillerState.imageOutlineEnabled ? `${fillerState.imageOutlineWidth}px` : "off";
  }
  if (fillerImageOutlineToggleInput) {
    fillerImageOutlineToggleInput.checked = fillerState.imageOutlineEnabled;
  }
  fillerFontSizeValue.textContent = String(fillerState.fontSize);
  fillerWidthValue.textContent = `${fillerState.width}%`;
  fillerLineHeightValue.textContent = Number(fillerState.lineHeight).toFixed(2);
  if (fillerOutlineWidthValue) {
    fillerOutlineWidthValue.textContent = fillerState.outlineEnabled ? `${fillerState.outlineWidth}px` : "off";
  }
  if (fillerOutlineToggleInput) {
    fillerOutlineToggleInput.checked = fillerState.outlineEnabled;
  }
  if (fillerImageScaleInput) fillerImageScaleInput.value = String(fillerState.imageScale);
  if (fillerImageOutlineWidthInput) fillerImageOutlineWidthInput.value = String(fillerState.imageOutlineWidth);
  if (fillerFontSizeInput) fillerFontSizeInput.value = String(fillerState.fontSize);
  if (fillerWidthInput) fillerWidthInput.value = String(fillerState.width);
  if (fillerLineHeightInput) fillerLineHeightInput.value = String(fillerState.lineHeight);
  if (fillerOutlineWidthInput) fillerOutlineWidthInput.value = String(fillerState.outlineWidth);
  if (fillerOutputSizeInput) fillerOutputSizeInput.value = String(fillerState.outputSize);
}

function applyFillerTemplateDefaults(template) {
  const defaults = template.defaults;
  fillerState.templateId = template.id;
  fillerState.text = defaults.text;
  fillerState.imageX = defaults.imageX;
  fillerState.imageY = defaults.imageY;
  fillerState.imageScale = defaults.imageScale;
  fillerState.imageOutlineEnabled = defaults.imageOutlineEnabled;
  fillerState.imageOutlineWidth = defaults.imageOutlineWidth;
  fillerState.x = defaults.x;
  fillerState.y = defaults.y;
  fillerState.width = defaults.width;
  fillerState.fontSize = defaults.fontSize;
  fillerState.lineHeight = defaults.lineHeight;
  fillerState.outlineEnabled = defaults.outlineEnabled;
  fillerState.outlineWidth = defaults.outlineWidth;
  fillerState.outputSize = defaults.outputSize;

  fillerTextInput.value = fillerState.text;
  syncFillerControlLabels();
}

function splitTextToLines(context, text, maxWidth) {
  return text.split("\n").flatMap((paragraph) => {
    if (!paragraph) {
      return [""];
    }

    const chars = [...paragraph];
    const lines = [];
    let current = "";

    chars.forEach((char) => {
      const next = current + char;

      if (current && context.measureText(next).width > maxWidth) {
        lines.push(current);
        current = char;
        return;
      }

      current = next;
    });

    if (current) {
      lines.push(current);
    }

    return lines;
  });
}

function getTemplateImageSrc(template) {
  const asset = fillerTemplateAssets[template.id];

  if (!asset) {
    return template.imageUrl;
  }

  if (!fillerTemplateUrlCache.has(template.id)) {
    const blob = new Blob([asset], { type: "image/svg+xml" });
    fillerTemplateUrlCache.set(template.id, URL.createObjectURL(blob));
  }

  return fillerTemplateUrlCache.get(template.id);
}

function updateFillerPreview() {
  const activeTemplate = getActiveFillerTemplate();

  if (!activeTemplate) {
    return;
  }

  fillerTemplateName.textContent = activeTemplate.name;
  fillerPreviewArt.src = getTemplateImageSrc(activeTemplate);
  fillerPreviewArt.style.left = `${fillerState.imageX}%`;
  fillerPreviewArt.style.top = `${fillerState.imageY}%`;
  fillerPreviewArt.style.width = `${fillerState.imageScale}%`;
  fillerPreviewArt.style.setProperty("--image-outline-size", `${Math.max(2, fillerState.imageOutlineWidth / 4)}px`);
  fillerPreviewArt.classList.toggle("has-image-outline", fillerState.imageOutlineEnabled);
  fillerPreviewText.style.left = `${fillerState.x}%`;
  fillerPreviewText.style.top = `${fillerState.y}%`;
  fillerPreviewText.style.width = `${fillerState.width}%`;
  fillerPreviewText.style.fontSize = `${fillerState.fontSize / 16}rem`;
  fillerPreviewText.style.lineHeight = String(fillerState.lineHeight);
  fillerPreviewText.style.setProperty("--outline-size", `${Math.max(1.5, fillerState.outlineWidth / 3)}px`);
  fillerPreviewText.innerHTML = escapeHtml(fillerState.text).replaceAll("\n", "<br />");
  fillerPreviewText.classList.toggle("has-outline", fillerState.outlineEnabled);
}

function renderFillerTemplates() {
  if (!fillerTemplateList) {
    return;
  }

  if (fillerTemplates.length === 0) {
    fillerTemplateList.innerHTML = `<p class="filler-empty">目前還沒有填字模板。</p>`;
    if (fillerDownloadButton) {
      fillerDownloadButton.disabled = true;
    }
    return;
  }

  fillerTemplateList.innerHTML = fillerTemplates
    .map(
      (template) => `
        <button class="filler-template-chip${template.id === fillerState.templateId ? " is-active" : ""}" type="button" data-template-id="${template.id}">
          <img class="filler-template-thumb" src="${getTemplateImageSrc(template)}" alt="${template.name}" loading="lazy" />
          <span>${template.name}</span>
        </button>
      `,
    )
    .join("");

  fillerTemplateList.querySelectorAll("[data-template-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTemplate = fillerTemplates.find((template) => template.id === button.dataset.templateId);

      if (!nextTemplate) {
        return;
      }

      applyFillerTemplateDefaults(nextTemplate);
      renderFillerTemplates();
      updateFillerPreview();
    });
  });
}

function bindFillerControls() {
  if (!fillerTextInput || fillerTemplates.length === 0) {
    return;
  }

  fillerTextInput.addEventListener("input", () => {
    fillerState.text = fillerTextInput.value;
    updateFillerPreview();
  });

  fillerImageScaleInput?.addEventListener("input", () => {
    fillerState.imageScale = Number(fillerImageScaleInput.value);
    syncFillerControlLabels();
    updateFillerPreview();
  });

  fillerImageOutlineToggleInput?.addEventListener("change", () => {
    fillerState.imageOutlineEnabled = fillerImageOutlineToggleInput.checked;
    syncFillerControlLabels();
    updateFillerPreview();
  });

  fillerImageOutlineWidthInput?.addEventListener("input", () => {
    fillerState.imageOutlineWidth = Number(fillerImageOutlineWidthInput.value);
    syncFillerControlLabels();
    updateFillerPreview();
  });

  fillerFontSizeInput?.addEventListener("input", () => {
    fillerState.fontSize = Number(fillerFontSizeInput.value);
    syncFillerControlLabels();
    updateFillerPreview();
  });

  fillerWidthInput?.addEventListener("input", () => {
    fillerState.width = Number(fillerWidthInput.value);
    syncFillerControlLabels();
    updateFillerPreview();
  });

  fillerLineHeightInput?.addEventListener("input", () => {
    fillerState.lineHeight = Number(fillerLineHeightInput.value);
    syncFillerControlLabels();
    updateFillerPreview();
  });

  fillerOutlineToggleInput?.addEventListener("change", () => {
    fillerState.outlineEnabled = fillerOutlineToggleInput.checked;
    syncFillerControlLabels();
    updateFillerPreview();
  });

  fillerOutlineWidthInput?.addEventListener("input", () => {
    fillerState.outlineWidth = Number(fillerOutlineWidthInput.value);
    syncFillerControlLabels();
    updateFillerPreview();
  });

  fillerOutputSizeInput?.addEventListener("input", () => {
    const nextSize = Number(fillerOutputSizeInput.value);
    fillerState.outputSize = Number.isFinite(nextSize) ? Math.max(512, Math.min(4096, nextSize)) : fillerState.outputSize;
    syncFillerControlLabels();
  });

  fillerOutputSizeInput?.addEventListener("blur", () => {
    syncFillerControlLabels();
  });

  fillerResetButton?.addEventListener("click", () => {
    const activeTemplate = getActiveFillerTemplate();

    if (!activeTemplate) {
      return;
    }

    fillerState.x = activeTemplate.defaults.x;
    fillerState.y = activeTemplate.defaults.y;
    fillerState.width = activeTemplate.defaults.width;
    fillerState.fontSize = activeTemplate.defaults.fontSize;
    fillerState.lineHeight = activeTemplate.defaults.lineHeight;
    fillerState.outlineEnabled = activeTemplate.defaults.outlineEnabled;
    fillerState.outlineWidth = activeTemplate.defaults.outlineWidth;
    fillerState.imageX = activeTemplate.defaults.imageX;
    fillerState.imageY = activeTemplate.defaults.imageY;
    fillerState.imageScale = activeTemplate.defaults.imageScale;
    fillerState.imageOutlineEnabled = activeTemplate.defaults.imageOutlineEnabled;
    fillerState.imageOutlineWidth = activeTemplate.defaults.imageOutlineWidth;
    fillerState.outputSize = activeTemplate.defaults.outputSize;
    syncFillerControlLabels();
    updateFillerPreview();
  });
}

function bindFillerDragging() {
  if (!fillerStage || !fillerPreviewText || !fillerPreviewArt) {
    return;
  }

  const onPointerMove = (event) => {
    if (!fillerDragState) {
      return;
    }

    event.preventDefault();

    const deltaX = event.clientX - fillerDragState.startX;
    const deltaY = event.clientY - fillerDragState.startY;
    const nextX = Math.max(8, Math.min(92, fillerDragState.originX + (deltaX / fillerDragState.width) * 100));
    const nextY = Math.max(8, Math.min(92, fillerDragState.originY + (deltaY / fillerDragState.height) * 100));

    if (fillerDragState.kind === "image") {
      fillerState.imageX = nextX;
      fillerState.imageY = nextY;
    } else {
      fillerState.x = nextX;
      fillerState.y = nextY;
    }

    updateFillerPreview();
  };

  const stopDragging = () => {
    if (!fillerDragState) {
      return;
    }

    fillerStage.classList.remove("is-dragging");
    fillerPreviewText.classList.remove("is-dragging");
    fillerPreviewArt.classList.remove("is-dragging");
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    fillerDragState = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", stopDragging);
  };

  fillerPreviewText.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    const bounds = fillerStage.getBoundingClientRect();
    fillerDragState = {
      kind: "text",
      startX: event.clientX,
      startY: event.clientY,
      originX: fillerState.x,
      originY: fillerState.y,
      width: bounds.width,
      height: bounds.height,
    };
    fillerStage.classList.add("is-dragging");
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    fillerPreviewText.setPointerCapture?.(event.pointerId);
    fillerPreviewText.classList.add("is-dragging");
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopDragging);
  });

  fillerPreviewArt.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    const bounds = fillerStage.getBoundingClientRect();
    fillerDragState = {
      kind: "image",
      startX: event.clientX,
      startY: event.clientY,
      originX: fillerState.imageX,
      originY: fillerState.imageY,
      width: bounds.width,
      height: bounds.height,
    };
    fillerStage.classList.add("is-dragging");
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    fillerPreviewArt.setPointerCapture?.(event.pointerId);
    fillerPreviewArt.classList.add("is-dragging");
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopDragging);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`圖片載入失敗：${src}`));
    image.src = src;
  });
}

function drawOutlinedImage(context, image, x, y, width, height, outlineWidth, outlineColor) {
  const step = Math.max(1, Math.round(outlineWidth));
  const outlineCanvas = document.createElement("canvas");
  outlineCanvas.width = Math.max(1, Math.ceil(width));
  outlineCanvas.height = Math.max(1, Math.ceil(height));

  const outlineContext = outlineCanvas.getContext("2d");
  outlineContext.drawImage(image, 0, 0, width, height);
  outlineContext.globalCompositeOperation = "source-in";
  outlineContext.fillStyle = outlineColor;
  outlineContext.fillRect(0, 0, outlineCanvas.width, outlineCanvas.height);
  outlineContext.globalCompositeOperation = "source-over";

  context.save();
  for (let radius = 1; radius <= step; radius += 1) {
    for (let angle = 0; angle < 360; angle += 12) {
      const radians = (angle * Math.PI) / 180;
      const offsetX = Math.cos(radians) * radius;
      const offsetY = Math.sin(radians) * radius;
      context.drawImage(outlineCanvas, x + offsetX, y + offsetY, width, height);
    }
  }
  context.restore();
}

async function downloadFillerImage() {
  const activeTemplate = getActiveFillerTemplate();

  if (!activeTemplate) {
    return;
  }

  fillerDownloadButton.disabled = true;
  fillerDownloadButton.textContent = "匯出中...";

  try {
    const resolvedImageUrl = getTemplateImageSrc(activeTemplate);
    const image = await loadImage(resolvedImageUrl);
    const canvas = document.createElement("canvas");
    canvas.width = fillerState.outputSize;
    canvas.height = fillerState.outputSize;

    const context = canvas.getContext("2d");
    const defaults = activeTemplate.defaults;
    const fontSizePx = fillerState.fontSize;
    const maxTextWidth = canvas.width * (fillerState.width / 100);
    const centerX = canvas.width * (fillerState.x / 100);
    const centerY = canvas.height * (fillerState.y / 100);
    const drawWidth = canvas.width * (fillerState.imageScale / 100);
    const drawHeight = canvas.height * (fillerState.imageScale / 100);
    const drawX = canvas.width * (fillerState.imageX / 100) - drawWidth / 2;
    const imageDrawY = canvas.height * (fillerState.imageY / 100) - drawHeight / 2;

    if (fillerState.imageOutlineEnabled) {
      drawOutlinedImage(
        context,
        image,
        drawX,
        imageDrawY,
        drawWidth,
        drawHeight,
        fillerState.imageOutlineWidth,
        "rgba(255,248,241,0.98)",
      );
    }

    context.drawImage(image, drawX, imageDrawY, drawWidth, drawHeight);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.lineJoin = "round";
    context.lineCap = "round";
    context.miterLimit = 2;
    context.strokeStyle = defaults.stroke;
    context.fillStyle = defaults.fill;
    context.lineWidth = fillerState.outlineWidth;
    context.font = `${defaults.fontWeight} ${fontSizePx}px "Noto Sans TC", sans-serif`;

    const lines = splitTextToLines(context, fillerState.text.trim() || defaults.text, maxTextWidth);
    const lineHeightPx = fontSizePx * fillerState.lineHeight;
    let drawY = centerY - ((lines.length - 1) * lineHeightPx) / 2;

    lines.forEach((line) => {
      if (fillerState.outlineEnabled) {
        context.strokeText(line, centerX, drawY, maxTextWidth);
      }
      context.fillText(line, centerX, drawY, maxTextWidth);
      drawY += lineHeightPx;
    });

    const downloadLink = document.createElement("a");
    downloadLink.href = canvas.toDataURL("image/png");
    downloadLink.download = `${activeTemplate.downloadName}.png`;
    downloadLink.style.display = "none";
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  } catch (error) {
    window.alert("下載失敗，請再試一次。如果還是不行，我再幫你修。");
  } finally {
    fillerDownloadButton.disabled = false;
    fillerDownloadButton.textContent = "下載";
  }
}

function renderSocialLinks() {
  if (!socialGrid) {
    return;
  }

  socialGrid.innerHTML = socialLinks
    .map(
      (item) => `
        <a class="social-card" href="${item.href}" ${item.href.startsWith("http") ? 'target="_blank" rel="noreferrer"' : ""} style="color:${item.color}">
          <div class="social-meta">
            <span class="social-icon">${item.icon}</span>
            <span class="social-tag">${item.handle}</span>
          </div>
          <div>
            <p class="social-name">${item.name}</p>
            <p class="social-copy">${item.description}</p>
          </div>
        </a>
      `,
    )
    .join("");
}

function renderGalleryFilters() {
  if (!galleryFilters) {
    return;
  }

  const discoveredCategories = [...new Set(galleryItems.map((item) => item.category))];
  const categories = [
    "全部",
    ...discoveredCategories.sort((left, right) => {
      const leftIndex = preferredCategoryOrder.indexOf(left);
      const rightIndex = preferredCategoryOrder.indexOf(right);

      if (leftIndex === -1 && rightIndex === -1) {
        return left.localeCompare(right, "zh-Hant");
      }

      if (leftIndex === -1) {
        return 1;
      }

      if (rightIndex === -1) {
        return -1;
      }

      return leftIndex - rightIndex;
    }),
  ];

  galleryFilters.innerHTML = categories
    .map(
      (category) => `
        <button class="filter-chip${category === activeCategory ? " is-active" : ""}" type="button" data-category="${category}">
          ${category}
        </button>
      `,
    )
    .join("");

  galleryFilters.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category || "全部";
      renderGalleryFilters();
      renderGallery();
    });
  });
}

function renderGallery() {
  if (!galleryGrid) {
    return;
  }

  const visibleItems =
    activeCategory === "全部"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  if (visibleItems.length === 0) {
    galleryGrid.innerHTML = `
      <article class="gallery-card">
        <div class="gallery-body">
          <div class="gallery-meta">
            <span class="gallery-type">尚未同步</span>
          </div>
          <p class="gallery-empty-copy">把圖片放進「生圖」資料夾後執行同步，就會顯示在這裡。</p>
        </div>
      </article>
    `;
    return;
  }

  galleryGrid.innerHTML = visibleItems
    .map(
      (item) => `
        <a class="gallery-card gallery-card-link" href="${item.driveUrl}" target="_blank" rel="noreferrer">
          <div class="gallery-thumb">
            <img class="gallery-art gallery-image" src="${item.imageUrl}" alt="${item.title}" loading="lazy" />
          </div>
          <div class="gallery-body">
            <div class="gallery-meta">
              <span class="gallery-type">${item.category}</span>
            </div>
          </div>
        </a>
      `,
    )
    .join("");
}

function renderMarquee() {
  if (!marqueeTrack) {
    return;
  }

  if (galleryItems.length === 0) {
    marqueeTrack.innerHTML = "";
    return;
  }

  const marqueePool = shuffled(galleryItems).slice(0, Math.min(10, galleryItems.length));
  const loopingItems = [...marqueePool, ...marqueePool];

  marqueeTrack.innerHTML = loopingItems
    .map(
      (item, index) => `
        <a class="marquee-item" href="${item.driveUrl}" target="_blank" rel="noreferrer" style="--tilt:${index % 2 === 0 ? -2 : 2}">
          <img class="marquee-image" src="${item.imageUrl}" alt="${item.title}" loading="lazy" />
          <div class="marquee-caption">
            <span>${item.category}</span>
          </div>
        </a>
      `,
    )
    .join("");
}

function renderBoard() {
  if (!boardList) {
    return;
  }

  boardList.innerHTML = boardItems
    .map(
      (item) => `
        <article class="board-card">
          <span class="board-pin" aria-hidden="true"></span>
          <div class="board-meta">
            <span class="board-type">${item.type}</span>
            <span>${item.date}</span>
          </div>
          <h3 class="board-title">${item.title}</h3>
          <p class="board-copy">${item.description}</p>
        </article>
      `,
    )
    .join("");
}

function renderProducts() {
  if (!shopGrid) {
    return;
  }

  shopGrid.innerHTML = products
    .map(
      (item) => `
        <a class="product-card product-card-link" href="${item.href}" target="_blank" rel="noreferrer">
          <div class="product-visual">
            <img class="product-art product-image" src="${item.imageUrl}" alt="${item.name}" loading="lazy" />
          </div>
          <div class="product-body">
            <div class="product-meta">
              <span class="product-status">${item.status}</span>
              <span class="product-price">${item.price}</span>
            </div>
            <h3>${item.name}</h3>
            <p class="product-copy">${item.description}</p>
          </div>
        </a>
      `,
    )
    .join("");
}

function renderHero() {
  if (!heroStats) {
    return;
  }

  const stats = [
    { value: `${socialLinks.length}`, label: "社群入口" },
    { value: `${galleryItems.length}`, label: "作品展示" },
    { value: `${products.length}`, label: "近期商品" },
  ];

  heroStats.innerHTML = stats
    .map(
      (item) => `
        <div class="stat-card">
          <span class="stat-value">${item.value}</span>
          <span class="stat-label">${item.label}</span>
        </div>
      `,
    )
    .join("");

  updateHeadline();
}

function updateHeadline() {
  if (!headlineType || !headlineDate || !headlineBadge || !headlineTitle || !headlineText) {
    return;
  }

  const item = boardItems[headlineIndex % boardItems.length];
  headlineType.textContent = item.type;
  headlineDate.textContent = item.date;
  headlineBadge.textContent = item.type;
  headlineTitle.textContent = item.title;
  headlineText.textContent = item.description;
  headlineIndex += 1;
}

function init() {
  applyRandomFavicon();
  applyVersionLabel();

  if (window.location.hash) {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  renderMarquee();
  renderSocialLinks();
  renderGalleryFilters();
  renderGallery();
  if (fillerTemplates.length > 0) {
    applyFillerTemplateDefaults(getActiveFillerTemplate());
  }
  renderFillerTemplates();
  bindFillerControls();
  bindFillerDragging();
  updateFillerPreview();
  renderBoard();
  renderProducts();
  renderHero();
  if (yearLabel) {
    yearLabel.textContent = new Date().getFullYear();
  }

  if (fillerDownloadButton) {
    fillerDownloadButton.addEventListener("click", downloadFillerImage);
  }

  if (headlineTitle) {
    window.setInterval(updateHeadline, 4000);
  }

  if (marqueeTrack) {
    window.setInterval(renderMarquee, 16000);
  }
}

init();
