/// <reference path="babylon.d.ts" />
/// <reference path="SoftEngine.ts" />
/// <reference path="Editor.ts" />

// Global editor instance
let editor: Editor3D.Editor;

document.addEventListener("DOMContentLoaded", init, false);

function init() {
    console.log("Initializing 3D Editor");
    const canvas = <HTMLCanvasElement>document.getElementById("frontBuffer");
    if (!canvas) {
        console.error("Canvas element 'frontBuffer' not found");
        return;
    }
    
    // Adjust canvas to fill container
    canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    
    console.log("Canvas dimensions:", canvas.width, "x", canvas.height);
    
    // Initialize the editor
    editor = new Editor3D.Editor(canvas);
    editor.initialize();
    
    // Handle window resize
    window.addEventListener("resize", resizeCanvas);
}

function resizeCanvas() {
    const canvas = <HTMLCanvasElement>document.getElementById("frontBuffer");
    if (canvas) {
        canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
        canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
        editor.onResize(canvas.width, canvas.height);
    }
}