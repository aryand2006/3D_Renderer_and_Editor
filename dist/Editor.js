/// <reference path="babylon.d.ts" />
/// <reference path="SoftEngine.ts" />
var Editor3D;
(function (Editor3D) {
    // Editor modes enum
    let EditMode;
    (function (EditMode) {
        EditMode[EditMode["SELECT"] = 0] = "SELECT";
        EditMode[EditMode["MOVE"] = 1] = "MOVE";
        EditMode[EditMode["ROTATE"] = 2] = "ROTATE";
        EditMode[EditMode["SCALE"] = 3] = "SCALE";
    })(EditMode = Editor3D.EditMode || (Editor3D.EditMode = {}));
    // Main editor class
    class Editor {
        constructor(canvas) {
            this.meshes = [];
            this.selectedMesh = null;
            this.currentMode = EditMode.SELECT;
            // Mouse interaction properties
            this.isMouseDown = false;
            this.lastMouseX = 0;
            this.lastMouseY = 0;
            this.isCameraRotating = false;
            this.isPanning = false;
            // FPS tracking
            this.frameCount = 0;
            this.fps = 0;
            this.lastFpsUpdateTime = 0;
            this.canvas = canvas;
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            // Initialize device and camera
            this.device = new SoftEngine.Device(this.canvas);
            this.camera = new SoftEngine.Camera();
            this.camera.Position = new BABYLON.Vector3(0, 0, 10);
            this.camera.Target = new BABYLON.Vector3(0, 0, 0);
            // Find UI elements
            this.objectList = document.getElementById("object-list");
            this.posXInput = document.getElementById("pos-x");
            this.posYInput = document.getElementById("pos-y");
            this.posZInput = document.getElementById("pos-z");
            this.rotXInput = document.getElementById("rot-x");
            this.rotYInput = document.getElementById("rot-y");
            this.rotZInput = document.getElementById("rot-z");
            this.scaleXInput = document.getElementById("scale-x");
            this.scaleYInput = document.getElementById("scale-y");
            this.scaleZInput = document.getElementById("scale-z");
            this.coordinatesDisplay = document.getElementById("coordinates");
            this.fpsDisplay = document.getElementById("fps");
            // Set up UI event listeners
            this.setupEventListeners();
        }
        // Initialize the editor
        initialize() {
            // Add initial objects
            this.addCube("Cube 1");
            // Start the rendering loop
            this.startRenderLoop();
        }
        // Set up all event listeners
        setupEventListeners() {
            // Mode selection buttons
            document.getElementById("btn-select").addEventListener("click", () => this.setMode(EditMode.SELECT));
            document.getElementById("btn-move").addEventListener("click", () => this.setMode(EditMode.MOVE));
            document.getElementById("btn-rotate").addEventListener("click", () => this.setMode(EditMode.ROTATE));
            document.getElementById("btn-scale").addEventListener("click", () => this.setMode(EditMode.SCALE));
            // Object creation buttons
            document.getElementById("btn-add-cube").addEventListener("click", () => this.addCube(`Cube ${this.meshes.length + 1}`));
            document.getElementById("btn-add-sphere").addEventListener("click", () => this.addSphere(`Sphere ${this.meshes.length + 1}`));
            document.getElementById("btn-delete").addEventListener("click", () => this.deleteSelectedMesh());
            // Camera control
            document.getElementById("btn-reset-camera").addEventListener("click", () => this.resetCamera());
            // Transform inputs
            this.posXInput.addEventListener("change", () => this.updateTransform());
            this.posYInput.addEventListener("change", () => this.updateTransform());
            this.posZInput.addEventListener("change", () => this.updateTransform());
            this.rotXInput.addEventListener("change", () => this.updateTransform());
            this.rotYInput.addEventListener("change", () => this.updateTransform());
            this.rotZInput.addEventListener("change", () => this.updateTransform());
            this.scaleXInput.addEventListener("change", () => this.updateTransform());
            this.scaleYInput.addEventListener("change", () => this.updateTransform());
            this.scaleZInput.addEventListener("change", () => this.updateTransform());
            // Canvas mouse events for object manipulation and camera control
            this.canvas.addEventListener("mousedown", (e) => this.onMouseDown(e));
            this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
            this.canvas.addEventListener("mouseup", () => this.onMouseUp());
            this.canvas.addEventListener("wheel", (e) => this.onMouseWheel(e));
            // Keyboard shortcuts
            document.addEventListener("keydown", (e) => this.onKeyDown(e));
            // Window resize event
            window.addEventListener("resize", () => {
                this.canvas.width = this.canvas.clientWidth;
                this.canvas.height = this.canvas.clientHeight;
            });
        }
        // Change the current editing mode
        setMode(mode) {
            this.currentMode = mode;
            // Update UI to reflect the current mode
            document.getElementById("btn-select").classList.remove("active");
            document.getElementById("btn-move").classList.remove("active");
            document.getElementById("btn-rotate").classList.remove("active");
            document.getElementById("btn-scale").classList.remove("active");
            switch (mode) {
                case EditMode.SELECT:
                    document.getElementById("btn-select").classList.add("active");
                    break;
                case EditMode.MOVE:
                    document.getElementById("btn-move").classList.add("active");
                    break;
                case EditMode.ROTATE:
                    document.getElementById("btn-rotate").classList.add("active");
                    break;
                case EditMode.SCALE:
                    document.getElementById("btn-scale").classList.add("active");
                    break;
            }
        }
        // Create and add a cube to the scene
        addCube(name) {
            const mesh = SoftEngine.Mesh.CreateCube(name);
            this.meshes.push(mesh);
            this.updateObjectList();
            this.selectMesh(mesh);
        }
        // Create and add a sphere to the scene with proper faces
        addSphere(name) {
            // Use the proper sphere creation method that includes faces
            const mesh = SoftEngine.Mesh.CreateSphere(name);
            this.meshes.push(mesh);
            this.updateObjectList();
            this.selectMesh(mesh);
        }
        // Delete the currently selected mesh
        deleteSelectedMesh() {
            if (this.selectedMesh) {
                const index = this.meshes.indexOf(this.selectedMesh);
                if (index !== -1) {
                    this.meshes.splice(index, 1);
                    this.selectedMesh = null;
                    this.updateObjectList();
                    this.updatePropertiesPanel();
                }
            }
        }
        // Update the object list in the UI
        updateObjectList() {
            // Clear the current list
            this.objectList.innerHTML = "";
            // Add each mesh to the list
            this.meshes.forEach((mesh, index) => {
                const li = document.createElement("li");
                li.className = "object-item";
                if (mesh === this.selectedMesh) {
                    li.classList.add("selected");
                }
                li.textContent = mesh.name;
                li.addEventListener("click", () => this.selectMesh(mesh));
                this.objectList.appendChild(li);
            });
        }
        // Select a mesh and update the UI
        selectMesh(mesh) {
            // Deselect the previously selected mesh
            if (this.selectedMesh) {
                this.selectedMesh.IsSelected = false;
            }
            // Select the new mesh
            this.selectedMesh = mesh;
            if (mesh) {
                mesh.IsSelected = true;
            }
            // Update the UI
            this.updateObjectList();
            this.updatePropertiesPanel();
        }
        // Update the properties panel with the selected mesh's data
        updatePropertiesPanel() {
            if (this.selectedMesh) {
                // Update position inputs
                this.posXInput.value = this.selectedMesh.Position.x.toFixed(2);
                this.posYInput.value = this.selectedMesh.Position.y.toFixed(2);
                this.posZInput.value = this.selectedMesh.Position.z.toFixed(2);
                // Update rotation inputs
                this.rotXInput.value = this.selectedMesh.Rotation.x.toFixed(2);
                this.rotYInput.value = this.selectedMesh.Rotation.y.toFixed(2);
                this.rotZInput.value = this.selectedMesh.Rotation.z.toFixed(2);
                // Update scale inputs
                this.scaleXInput.value = this.selectedMesh.Scaling.x.toFixed(2);
                this.scaleYInput.value = this.selectedMesh.Scaling.y.toFixed(2);
                this.scaleZInput.value = this.selectedMesh.Scaling.z.toFixed(2);
            }
        }
        // Update the selected mesh's transform from UI inputs
        updateTransform() {
            if (this.selectedMesh) {
                // Update position
                this.selectedMesh.Position.x = parseFloat(this.posXInput.value);
                this.selectedMesh.Position.y = parseFloat(this.posYInput.value);
                this.selectedMesh.Position.z = parseFloat(this.posZInput.value);
                // Update rotation
                this.selectedMesh.Rotation.x = parseFloat(this.rotXInput.value);
                this.selectedMesh.Rotation.y = parseFloat(this.rotYInput.value);
                this.selectedMesh.Rotation.z = parseFloat(this.rotZInput.value);
                // Update scale
                this.selectedMesh.Scaling.x = parseFloat(this.scaleXInput.value);
                this.selectedMesh.Scaling.y = parseFloat(this.scaleYInput.value);
                this.selectedMesh.Scaling.z = parseFloat(this.scaleZInput.value);
            }
        }
        // Reset the camera to its default position
        resetCamera() {
            this.camera.Position = new BABYLON.Vector3(0, 0, 10);
            this.camera.Target = new BABYLON.Vector3(0, 0, 0);
        }
        // Handle mouse down events
        onMouseDown(e) {
            this.isMouseDown = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            // Right mouse button for camera rotation
            if (e.button === 2) {
                this.isCameraRotating = true;
                e.preventDefault();
                return;
            }
            // Middle mouse button for camera panning
            if (e.button === 1) {
                this.isPanning = true;
                e.preventDefault();
                return;
            }
            // Left mouse button for selection or manipulation
            if (e.button === 0) {
                if (this.currentMode === EditMode.SELECT) {
                    // Get canvas-relative coordinates
                    const rect = this.canvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    // Create picking ray from mouse position
                    const ray = this.device.createPickingRay(x, y, this.camera);
                    // Test each mesh for intersection
                    let closestMesh = null;
                    let closestDistance = Number.MAX_VALUE;
                    for (const mesh of this.meshes) {
                        const pickInfo = mesh.intersects(ray);
                        if (pickInfo.hit && pickInfo.distance < closestDistance) {
                            closestDistance = pickInfo.distance;
                            closestMesh = mesh;
                        }
                    }
                    // Select the closest intersected mesh or clear selection
                    if (closestMesh) {
                        this.selectMesh(closestMesh);
                        // Update status bar with position info
                        if (this.coordinatesDisplay) {
                            this.coordinatesDisplay.textContent = `X: ${closestMesh.Position.x.toFixed(2)}, Y: ${closestMesh.Position.y.toFixed(2)}, Z: ${closestMesh.Position.z.toFixed(2)}`;
                        }
                    }
                    else {
                        this.selectMesh(null);
                        // Clear position info
                        if (this.coordinatesDisplay) {
                            this.coordinatesDisplay.textContent = `X: 0.00, Y: 0.00, Z: 0.00`;
                        }
                    }
                }
            }
        }
        // Handle mouse move events
        onMouseMove(e) {
            if (!this.isMouseDown) {
                return;
            }
            const deltaX = e.clientX - this.lastMouseX;
            const deltaY = e.clientY - this.lastMouseY;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            // Camera rotation with right mouse button
            if (this.isCameraRotating) {
                this.camera.RotateCamera(deltaX, deltaY);
                return;
            }
            // Camera panning with middle mouse button
            if (this.isPanning) {
                this.camera.PanCamera(deltaX, deltaY);
                return;
            }
            // Object manipulation with left mouse button
            if (this.selectedMesh) {
                switch (this.currentMode) {
                    case EditMode.MOVE:
                        // Move the selected object
                        this.selectedMesh.Position.x -= deltaX * 0.01;
                        this.selectedMesh.Position.y -= deltaY * 0.01;
                        break;
                    case EditMode.ROTATE:
                        // Rotate the selected object
                        this.selectedMesh.Rotation.y -= deltaX * 0.01;
                        this.selectedMesh.Rotation.x += deltaY * 0.01;
                        break;
                    case EditMode.SCALE:
                        // Scale the selected object
                        const scaleFactor = 1 + (deltaX + deltaY) * 0.005;
                        this.selectedMesh.Scaling.x *= scaleFactor;
                        this.selectedMesh.Scaling.y *= scaleFactor;
                        this.selectedMesh.Scaling.z *= scaleFactor;
                        break;
                }
                // Update UI to reflect changes
                this.updatePropertiesPanel();
            }
        }
        // Handle mouse up events
        onMouseUp() {
            this.isMouseDown = false;
            this.isCameraRotating = false;
            this.isPanning = false;
        }
        // Handle mouse wheel events for zooming
        onMouseWheel(e) {
            const delta = Math.sign(e.deltaY);
            this.camera.ZoomCamera(delta);
            e.preventDefault();
        }
        // Handle keyboard shortcuts
        onKeyDown(e) {
            switch (e.key.toLowerCase()) {
                case 'q':
                    this.setMode(EditMode.SELECT);
                    break;
                case 'w':
                    this.setMode(EditMode.MOVE);
                    break;
                case 'e':
                    this.setMode(EditMode.ROTATE);
                    break;
                case 'r':
                    this.setMode(EditMode.SCALE);
                    break;
                case 'delete':
                    this.deleteSelectedMesh();
                    break;
            }
        }
        // Handle resize events
        onResize(width, height) {
            // Update canvas dimensions
            this.canvas.width = width;
            this.canvas.height = height;
        }
        // Start the rendering loop
        startRenderLoop() {
            const renderFrame = () => {
                this.frameCount++;
                // Update FPS counter once per second
                const now = performance.now();
                if (now - this.lastFpsUpdateTime >= 1000) {
                    this.fps = this.frameCount;
                    this.frameCount = 0;
                    this.lastFpsUpdateTime = now;
                    this.fpsDisplay.textContent = `FPS: ${this.fps}`;
                }
                // Clear the screen
                this.device.clear();
                // Render the scene
                this.device.render(this.camera, this.meshes);
                this.device.present();
                // Request next frame
                requestAnimationFrame(renderFrame);
            };
            // Start the loop
            renderFrame();
        }
    }
    Editor3D.Editor = Editor;
})(Editor3D || (Editor3D = {}));
