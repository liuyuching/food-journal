
(() => {
    "use strict";

    const STORAGE_KEY = "foodJournalPhotoSettingsV3";

    const photos = [
        { file: "01-cover.jpg", label: "首頁封面" },
        { file: "02-feature.jpg", label: "文章主圖" },
        { file: "03-uni-ikura-rice.jpg", label: "海膽鮭魚卵飯" },
        { file: "04-uni-sushi.jpg", label: "海膽握壽司" },
        { file: "05-beef-tongue.jpg", label: "鹽蔥牛舌" },
        { file: "06-baked-scallop.jpg", label: "焗烤扇貝" },
        { file: "07-mentaiko-chicken.jpg", label: "明太子雞腿肉串" },
        { file: "08-seafood-soup.jpg", label: "海鮮湯" },
        { file: "09-steamed-crab.jpg", label: "清蒸紅蟳" }
    ];

    const defaults = {
        x: 0,
        y: 0,
        scale: 100
    };

    let settings = {};

    try {
        settings = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "{}"
        );
    } catch {
        settings = {};
    }

    let selectedFile = photos[0].file;
    const imageRecords = new WeakMap();

    function getSettings(file) {
        return {
            ...defaults,
            ...(settings[file] || {})
        };
    }

    function saveSettings() {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(settings)
        );
    }

    function getFileName(img) {
        const src = img.getAttribute("src") || "";
        return src.split("/").pop().split("?")[0];
    }

    // 建立固定圖框，保留圖片原本顯示尺寸
    function prepareImage(img) {
        if (imageRecords.has(img)) return;

        const computed = getComputedStyle(img);

        const width = img.getBoundingClientRect().width;
        const height = img.getBoundingClientRect().height;

        if (!width || !height) return;

        const wrapper = document.createElement("div");

        wrapper.className = "photo-editor-frame";

        wrapper.style.cssText = `
            position: relative;
            display: block;
            width: ${width}px;
            height: ${height}px;
            max-width: 100%;
            overflow: hidden;
            box-sizing: border-box;
            vertical-align: middle;
        `;

        // 保留圖片原本的外距與對齊方式
        wrapper.style.margin = computed.margin;
        wrapper.style.float = computed.float;
        wrapper.style.verticalAlign = computed.verticalAlign;

        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);

        img.style.setProperty("display", "block", "important");
        img.style.setProperty("width", "100%", "important");
        img.style.setProperty("height", "100%", "important");
        img.style.setProperty("max-width", "none", "important");
        img.style.setProperty("margin", "0", "important");
        img.style.setProperty("transform-origin", "center center", "important");
        img.style.setProperty("transition", "transform 0.12s ease", "important");

        imageRecords.set(img, {
            wrapper,
            originalObjectFit: computed.objectFit
        });
    }

    function findPhoto(file) {
        return [...document.querySelectorAll("img")]
            .filter(img => getFileName(img) === file);
    }

    // 套用照片縮放與位置
    function applyPhoto(file) {
        const value = getSettings(file);

        findPhoto(file).forEach(img => {
            prepareImage(img);

            const record = imageRecords.get(img);
            if (!record) return;

            // 縮小時使用 contain，確保完整照片顯示
            // 100% 以上恢復原本的填框方式
            const fit = value.scale < 100
                ? "contain"
                : record.originalObjectFit;

            img.style.setProperty(
                "object-fit",
                fit,
                "important"
            );

            img.style.setProperty(
                "object-position",
                "center center",
                "important"
            );

            img.style.setProperty(
                "transform",
                `translate(${value.x}%, ${value.y}%) scale(${value.scale / 100})`,
                "important"
            );
        });
    }

    function applyAll() {
        photos.forEach(photo => applyPhoto(photo.file));
    }

    // 控制面板
    const panel = document.createElement("div");
    panel.id = "photo-editor-panel";

    panel.innerHTML = `
        <style>
            #photo-editor-panel {
                position: fixed;
                right: 18px;
                bottom: 18px;
                z-index: 999999;
                width: 290px;
                padding: 17px;
                background: #fffdf8;
                color: #34382f;
                border: 1px solid #d9d4c8;
                border-radius: 12px;
                box-shadow: 0 5px 25px rgba(0,0,0,.18);
                font-family: Arial, "Microsoft JhengHei", sans-serif;
                font-size: 13px;
            }

            #photo-editor-panel * {
                box-sizing: border-box;
            }

            #photo-editor-panel .editor-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 13px;
            }

            #photo-editor-panel label {
                display: block;
                margin: 13px 0 5px;
                font-weight: bold;
            }

            #photo-editor-panel select {
                width: 100%;
                padding: 8px;
                border: 1px solid #ccc;
                border-radius: 6px;
                background: white;
            }

            #photo-editor-panel input[type="range"] {
                width: 100%;
                cursor: pointer;
                accent-color: #8b9871;
            }

            #photo-editor-panel .value {
                float: right;
                color: #8b9871;
                font-weight: normal;
            }

            #photo-editor-panel .editor-buttons {
                display: flex;
                gap: 8px;
                margin-top: 15px;
            }

            #photo-editor-panel button {
                flex: 1;
                padding: 9px 5px;
                border: 0;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
            }

            #photo-editor-save {
                background: #667451;
                color: white;
            }

            #photo-editor-reset {
                background: #e8e4da;
                color: #444;
            }

            #photo-editor-toggle {
                width: 100%;
                margin-bottom: 10px;
                padding: 7px;
                background: #eee9df;
                border: 0;
                border-radius: 6px;
                cursor: pointer;
            }

            #photo-editor-status {
                margin-top: 10px;
                color: #777;
                line-height: 1.5;
                font-size: 11px;
            }

            @media (max-width: 600px) {
                #photo-editor-panel {
                    right: 8px;
                    bottom: 8px;
                    width: 260px;
                }
            }
        </style>

        <button id="photo-editor-toggle">收合調整面板 ▲</button>

        <div id="photo-editor-content">
            <div class="editor-title">照片位置調整</div>

            <label>選擇照片</label>
            <select id="photo-editor-select">
                ${photos.map(photo => `
                    <option value="${photo.file}">
                        ${photo.label}
                    </option>
                `).join("")}
            </select>

            <label>
                左右移動
                <span class="value" id="photo-editor-x-value"></span>
            </label>
            <input type="range" id="photo-editor-x"
                   min="-100" max="100" value="0">

            <label>
                上下移動
                <span class="value" id="photo-editor-y-value"></span>
            </label>
            <input type="range" id="photo-editor-y"
                   min="-100" max="100" value="0">

            <label>
                照片縮放
                <span class="value" id="photo-editor-scale-value"></span>
            </label>
            <input type="range" id="photo-editor-scale"
                   min="30" max="200" value="100">

            <div class="editor-buttons">
                <button id="photo-editor-reset">恢復原位</button>
                <button id="photo-editor-save">儲存設定</button>
            </div>

            <div id="photo-editor-status">
                調整滑桿即可預覽，完成後按下儲存。
            </div>
        </div>
    `;

    document.body.appendChild(panel);

    const select = document.getElementById("photo-editor-select");
    const x = document.getElementById("photo-editor-x");
    const y = document.getElementById("photo-editor-y");
    const scale = document.getElementById("photo-editor-scale");

    const xValue = document.getElementById("photo-editor-x-value");
    const yValue = document.getElementById("photo-editor-y-value");
    const scaleValue = document.getElementById("photo-editor-scale-value");
    const status = document.getElementById("photo-editor-status");

    function refreshControls() {
        const value = getSettings(selectedFile);

        x.value = value.x;
        y.value = value.y;
        scale.value = value.scale;

        xValue.textContent = value.x;
        yValue.textContent = value.y;
        scaleValue.textContent = value.scale + "%";
    }

    function updatePreview() {
        settings[selectedFile] = {
            x: Number(x.value),
            y: Number(y.value),
            scale: Number(scale.value)
        };

        refreshControls();
        applyPhoto(selectedFile);

        status.textContent = "正在預覽，按「儲存設定」保存。";
    }

    select.addEventListener("change", () => {
        selectedFile = select.value;
        refreshControls();
        applyPhoto(selectedFile);
        status.textContent = "已切換照片。";
    });

    [x, y, scale].forEach(input => {
        input.addEventListener("input", updatePreview);
    });

    document.getElementById("photo-editor-save")
        .addEventListener("click", () => {
            saveSettings();
            status.textContent = "設定已儲存。";
        });

    document.getElementById("photo-editor-reset")
        .addEventListener("click", () => {
            settings[selectedFile] = { ...defaults };
            refreshControls();
            applyPhoto(selectedFile);
            saveSettings();
            status.textContent = "已恢復這張照片的原始位置。";
        });

    document.getElementById("photo-editor-toggle")
        .addEventListener("click", event => {
            const content = document.getElementById(
                "photo-editor-content"
            );

            const hidden = content.style.display === "none";
            content.style.display = hidden ? "block" : "none";

            event.currentTarget.textContent = hidden
                ? "收合調整面板 ▲"
                : "展開調整面板 ▼";
        });

    function restoreSavedSettings() {
        try {
            settings = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "{}"
            );
        } catch {
            settings = {};
        }

        applyAll();
        refreshControls();
    }

    // 等待圖片載入後再建立圖框
    function initialize() {
        photos.forEach(photo => {
            findPhoto(photo.file).forEach(img => {
                if (img.complete && img.naturalWidth > 0) {
                    prepareImage(img);
                    applyPhoto(photo.file);
                } else {
                    img.addEventListener("load", () => {
                        prepareImage(img);
                        applyPhoto(photo.file);
                    }, { once: true });
                }
            });
        });

        restoreSavedSettings();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize);
    } else {
        initialize();
    }

})();
