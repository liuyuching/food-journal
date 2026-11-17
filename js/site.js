
(() => {
    "use strict";

    function loadPhotos() {
        const slots = document.querySelectorAll(
            ".photo-slot[data-image]"
        );

        console.log("找到照片框數量：", slots.length);

        slots.forEach(slot => {
            const src = slot.dataset.image;

            const img = new Image();

            img.alt = slot.dataset.alt || slot.textContent.trim() || "";

            img.onload = () => {
                slot.innerHTML = "";
                slot.appendChild(img);

                console.log("[圖片載入成功]", src);
            };

            img.onerror = () => {
                console.error("[圖片載入失敗]", {
                    路徑: src,
                    完整網址: img.src
                });

                slot.innerHTML = `
                    <div style="
                        padding:20px;
                        color:#a33;
                        font-size:13px;
                        text-align:center;
                    ">
                        圖片載入失敗<br>
                        ${src}
                    </div>
                `;
            };

            img.src = src;
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            loadPhotos
        );
    } else {
        loadPhotos();
    }
})();
