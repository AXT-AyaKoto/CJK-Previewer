/** ================================================================================================
 * テンプレート
================================================================================================= */

/**
 * ページのロード完了を待つ
 */
await Promise.race([
    // ページのロード完了を待つ
    new Promise((resolve) => { window.addEventListener("load", resolve, { once: true }); }),
    // 3秒経過したら強制的にresolve
    new Promise((resolve) => { setTimeout(resolve, 3000); }),
]);

/**
 * document.querySelectorのエイリアス
 * @param {String} selector - CSSセレクタ
 * @returns {Element}
 */
const $ = selector => document.querySelector(selector);

/**
 * document.querySelectorAllのエイリアス
 * @param {String} selector - CSSセレクタ
 * @returns {Element[]}
 */
const $$ = selector => Array.from(document.querySelectorAll(selector));

/** ================================================================================================
 * プレビューを再描画
================================================================================================= */

const updatePreview = (letter) => {
    /** @type {HTMLTrElement} - プレビューエリアの文字プレビュー部分の要素 */
    const preview = $$(".preview-area table tbody>tr>td");
    /** trの各要素に、文字を挿入 */
    preview.forEach((td) => {
        td.textContent = letter;
    });
};

/** ================================================================================================
 * canvasプレビュー(diff)を再描画
================================================================================================= */

const updateDiff = (letter) => {
    /** @type {HTMLCanvasElement} - canvas */
    const canvas = $("#diff-canvas");
    /** @type {CanvasRenderingContext2D} - canvas context */
    const ctx = canvas.getContext("2d");
    /** @type {{R: String, G: String, B: String}} - 色設定 */
    const color = {
        R: "rgb(192 32 32)",
        G: "rgb(32 192 32)",
        B: "rgb(32 32 192)",
    };
    /** canvasをリセット */
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    /** 言語とフォントの対応表 */
    const fontMap = {
        "ja-JP": "Noto Sans JP",
        "ko-KR": "Noto Sans KR",
        "zh-Hans": "Noto Sans SC",
        "zh-Hant-TW": "Noto Sans TC",
        "zh-Hant-HK": "Noto Sans HK",
    };
    /** 赤・緑・青でそれぞれどの言語を描画するか取得 */
    const select = {
        R: $("#diff-red").value,
        G: $("#diff-green").value,
        B: $("#diff-blue").value,
    };
    /** 文字を描画 */
    if (letter) {
        ctx.globalCompositeOperation = "lighter";
        ["R", "G", "B"].forEach(key => {
            ctx.font = `400 1024px/1024px ${fontMap[select[key]]}, sans-serif`;
            canvas.lang = select[key];
            ctx.fillStyle = color[key];
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(letter, 512, 512);
        });
        canvas.lang = "ja-JP";
    }
    /** 背景は透明？黒塗り？ */
    ctx.globalCompositeOperation = "destination-over";
    switch ($("#diff-bg").value) {
        case "transparent":
            ctx.fillStyle = "rgba(0, 0, 0, 0)";
            break;
        case "black":
            ctx.fillStyle = "rgb(0 0 0)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            break;
        case "white":
            ctx.fillStyle = "rgb(255 255 255)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            break;
        default:
            break;
    }
    ctx.globalCompositeOperation = "source-over";
};

/** ================================================================================================
 * 入力変化時のイベント
================================================================================================= */

$("section.input-area #input").addEventListener("input", (e) => {
    const letter = e.target.value[0];
    if (!letter) return;
    updatePreview(letter);
    updateDiff(letter);
});

$$("section.diff-area select").forEach((select) => {
    select.addEventListener("change", () => {
        const letter = $("#input").value[0];
        if (!letter) return;
        updateDiff(letter);
    });
});

/** ================================================================================================
 * 定期的にcanvas描画更新
================================================================================================= */

setInterval(() => {
    const letter = $("#input").value[0];
    updateDiff(letter);
}, 1000 / 24);
