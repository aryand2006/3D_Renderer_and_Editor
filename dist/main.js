/// <reference path="babylon.d.ts" />
/// <reference path="SoftEngine.ts" />
/// <reference path="Editor.ts" />
// Global editor instance
let editor;
document.addEventListener("DOMContentLoaded", init, false);
function init() {
    var _a, _b;
    console.log("Initializing 3D Editor");
    const canvas = document.getElementById("frontBuffer");
    if (!canvas) {
        console.error("Canvas element 'frontBuffer' not found");
        return;
    }
    // Adjust canvas to fill container
    canvas.width = ((_a = canvas.parentElement) === null || _a === void 0 ? void 0 : _a.clientWidth) || window.innerWidth;
    canvas.height = ((_b = canvas.parentElement) === null || _b === void 0 ? void 0 : _b.clientHeight) || window.innerHeight;
    console.log("Canvas dimensions:", canvas.width, "x", canvas.height);
    // Initialize the editor
    editor = new Editor3D.Editor(canvas);
    editor.initialize();
    // Handle window resize
    window.addEventListener("resize", resizeCanvas);
}
function resizeCanvas() {
    var _a, _b;
    const canvas = document.getElementById("frontBuffer");
    if (canvas) {
        canvas.width = ((_a = canvas.parentElement) === null || _a === void 0 ? void 0 : _a.clientWidth) || window.innerWidth;
        canvas.height = ((_b = canvas.parentElement) === null || _b === void 0 ? void 0 : _b.clientHeight) || window.innerHeight;
        editor.onResize(canvas.width, canvas.height);
    }
}
