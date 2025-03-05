/// <reference path="babylon.d.ts" />
var SoftEngine;
(function (SoftEngine) {
    // Add new material class
    class Material {
        constructor() {
            this.diffuseColor = new BABYLON.Color4(1, 1, 1, 1);
            this.wireframeColor = new BABYLON.Color4(0.5, 0.5, 0.5, 1);
        }
    }
    SoftEngine.Material = Material;
    // Add new Face class for triangles
    class Face {
        constructor(a, b, c) {
            this.A = a;
            this.B = b;
            this.C = c;
        }
    }
    SoftEngine.Face = Face;
    // Add ray class for picking
    class Ray {
        constructor(origin, direction) {
            this.Origin = origin;
            this.Direction = direction;
            this.normalizeDirection();
        }
        normalizeDirection() {
            const length = Math.sqrt(this.Direction.x * this.Direction.x +
                this.Direction.y * this.Direction.y +
                this.Direction.z * this.Direction.z);
            if (length !== 0) {
                this.Direction.x /= length;
                this.Direction.y /= length;
                this.Direction.z /= length;
            }
        }
        // Check if ray intersects triangle defined by three points
        intersectsTriangle(v0, v1, v2) {
            // Möller–Trumbore intersection algorithm
            const EPSILON = 0.000001;
            // Find vectors for two edges sharing vertex v0
            const edge1 = {
                x: v1.x - v0.x,
                y: v1.y - v0.y,
                z: v1.z - v0.z
            };
            const edge2 = {
                x: v2.x - v0.x,
                y: v2.y - v0.y,
                z: v2.z - v0.z
            };
            // Begin calculating determinant - also used to calculate u parameter
            // P = ray direction cross edge 2
            const p = {
                x: this.Direction.y * edge2.z - this.Direction.z * edge2.y,
                y: this.Direction.z * edge2.x - this.Direction.x * edge2.z,
                z: this.Direction.x * edge2.y - this.Direction.y * edge2.x
            };
            // If determinant is near zero, ray is parallel to triangle plane or lies in the plane
            const det = edge1.x * p.x + edge1.y * p.y + edge1.z * p.z;
            if (det > -EPSILON && det < EPSILON) {
                return -1;
            }
            const invDet = 1.0 / det;
            // Calculate distance from v0 to ray origin
            const t = {
                x: this.Origin.x - v0.x,
                y: this.Origin.y - v0.y,
                z: this.Origin.z - v0.z
            };
            // Calculate u parameter
            const u = (t.x * p.x + t.y * p.y + t.z * p.z) * invDet;
            // Check bounds
            if (u < 0 || u > 1) {
                return -1;
            }
            // Prepare to test v parameter
            const q = {
                x: t.y * edge1.z - t.z * edge1.y,
                y: t.z * edge1.x - t.x * edge1.z,
                z: t.x * edge1.y - t.y * edge1.x
            };
            // Calculate v parameter
            const v = (this.Direction.x * q.x + this.Direction.y * q.y + this.Direction.z * q.z) * invDet;
            // Check bounds
            if (v < 0 || u + v > 1) {
                return -1;
            }
            // Calculate t - distance along ray to intersection
            const dist = (edge2.x * q.x + edge2.y * q.y + edge2.z * q.z) * invDet;
            // Only return positive intersections (in front of the ray origin)
            if (dist > EPSILON) {
                return dist;
            }
            return -1;
        }
    }
    SoftEngine.Ray = Ray;
    // Add picking result class
    class PickingInfo {
        constructor() {
            this.hit = false;
            this.distance = 0;
            this.mesh = null;
            this.faceId = -1;
        }
    }
    SoftEngine.PickingInfo = PickingInfo;
    class Camera {
        constructor() {
            this.Position = BABYLON.Vector3.Zero();
            this.Target = BABYLON.Vector3.Zero();
        }
        // Add camera controls
        RotateCamera(deltaX, deltaY) {
            const rotationSpeed = 0.01;
            // Calculate the camera position in spherical coordinates
            const radius = Math.sqrt(this.Position.x * this.Position.x +
                this.Position.y * this.Position.y +
                this.Position.z * this.Position.z);
            let theta = Math.atan2(this.Position.z, this.Position.x);
            let phi = Math.acos(this.Position.y / radius);
            // Apply rotations
            theta -= deltaX * rotationSpeed;
            phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi + deltaY * rotationSpeed));
            // Convert back to cartesian coordinates
            this.Position.x = radius * Math.sin(phi) * Math.cos(theta);
            this.Position.y = radius * Math.cos(phi);
            this.Position.z = radius * Math.sin(phi) * Math.sin(theta);
        }
        ZoomCamera(delta) {
            const zoomSpeed = 0.1;
            const direction = new BABYLON.Vector3(this.Target.x - this.Position.x, this.Target.y - this.Position.y, this.Target.z - this.Position.z);
            const length = Math.sqrt(direction.x * direction.x +
                direction.y * direction.y +
                direction.z * direction.z);
            direction.x /= length;
            direction.y /= length;
            direction.z /= length;
            this.Position.x += direction.x * delta * zoomSpeed;
            this.Position.y += direction.y * delta * zoomSpeed;
            this.Position.z += direction.z * delta * zoomSpeed;
        }
        PanCamera(deltaX, deltaY) {
            // Implementation for panning
        }
    }
    SoftEngine.Camera = Camera;
    class Mesh {
        constructor(name, verticesCount) {
            this.name = name;
            this.Vertices = new Array(verticesCount);
            this.Faces = [];
            this.Position = BABYLON.Vector3.Zero();
            this.Rotation = BABYLON.Vector3.Zero();
            this.Scaling = new BABYLON.Vector3(1, 1, 1);
            this.Material = new Material();
            this.IsSelected = false;
        }
        // Helper methods for primitive creation
        static CreateCube(name) {
            const mesh = new Mesh(name, 8);
            // Set cube vertices
            mesh.Vertices[0] = new BABYLON.Vector3(-1, 1, 1); // Front top left
            mesh.Vertices[1] = new BABYLON.Vector3(1, 1, 1); // Front top right
            mesh.Vertices[2] = new BABYLON.Vector3(-1, -1, 1); // Front bottom left
            mesh.Vertices[3] = new BABYLON.Vector3(1, -1, 1); // Front bottom right
            mesh.Vertices[4] = new BABYLON.Vector3(-1, 1, -1); // Back top left
            mesh.Vertices[5] = new BABYLON.Vector3(1, 1, -1); // Back top right
            mesh.Vertices[6] = new BABYLON.Vector3(-1, -1, -1); // Back bottom left
            mesh.Vertices[7] = new BABYLON.Vector3(1, -1, -1); // Back bottom right
            // Define faces (12 triangles = 6 sides)
            // Front face
            mesh.Faces.push(new Face(0, 1, 2));
            mesh.Faces.push(new Face(1, 3, 2));
            // Back face
            mesh.Faces.push(new Face(5, 4, 7));
            mesh.Faces.push(new Face(4, 6, 7));
            // Top face
            mesh.Faces.push(new Face(4, 5, 0));
            mesh.Faces.push(new Face(5, 1, 0));
            // Bottom face
            mesh.Faces.push(new Face(2, 3, 6));
            mesh.Faces.push(new Face(3, 7, 6));
            // Left face
            mesh.Faces.push(new Face(4, 0, 6));
            mesh.Faces.push(new Face(0, 2, 6));
            // Right face
            mesh.Faces.push(new Face(1, 5, 3));
            mesh.Faces.push(new Face(5, 7, 3));
            return mesh;
        }
        // Create a proper sphere with triangulated faces
        static CreateSphere(name, segments = 16) {
            // We'll use segments for both horizontal and vertical divisions
            const vertexCount = (segments + 1) * (segments + 1);
            const mesh = new Mesh(name, vertexCount);
            // Create vertices
            let index = 0;
            for (let y = 0; y <= segments; y++) {
                for (let x = 0; x <= segments; x++) {
                    const xSegment = x / segments;
                    const ySegment = y / segments;
                    const xPos = Math.cos(xSegment * 2.0 * Math.PI) * Math.sin(ySegment * Math.PI);
                    const yPos = Math.cos(ySegment * Math.PI);
                    const zPos = Math.sin(xSegment * 2.0 * Math.PI) * Math.sin(ySegment * Math.PI);
                    mesh.Vertices[index++] = new BABYLON.Vector3(xPos, yPos, zPos);
                }
            }
            // Create faces
            for (let y = 0; y < segments; y++) {
                for (let x = 0; x < segments; x++) {
                    const a = y * (segments + 1) + x;
                    const b = y * (segments + 1) + x + 1;
                    const c = (y + 1) * (segments + 1) + x;
                    const d = (y + 1) * (segments + 1) + x + 1;
                    mesh.Faces.push(new Face(a, b, c));
                    mesh.Faces.push(new Face(b, d, c));
                }
            }
            return mesh;
        }
        // Check if a ray intersects this mesh
        intersects(ray) {
            const result = new PickingInfo();
            if (!this.Faces || this.Faces.length === 0) {
                return result;
            }
            // Create the world matrix for the mesh
            const worldMatrix = BABYLON.Matrix.RotationYawPitchRoll(this.Rotation.y, this.Rotation.x, this.Rotation.z).multiply(BABYLON.Matrix.Translation(this.Position.x, this.Position.y, this.Position.z));
            // Find the closest intersection
            let minDistance = Number.MAX_VALUE;
            let closestFaceIndex = -1;
            for (let i = 0; i < this.Faces.length; i++) {
                const face = this.Faces[i];
                // Get the three vertices that make up this face
                const v0 = BABYLON.Vector3.TransformCoordinates(this.Vertices[face.A], worldMatrix);
                const v1 = BABYLON.Vector3.TransformCoordinates(this.Vertices[face.B], worldMatrix);
                const v2 = BABYLON.Vector3.TransformCoordinates(this.Vertices[face.C], worldMatrix);
                // Check for intersection with this face
                const distance = ray.intersectsTriangle(v0, v1, v2);
                if (distance >= 0 && distance < minDistance) {
                    minDistance = distance;
                    closestFaceIndex = i;
                }
            }
            // Set the result if we hit something
            if (closestFaceIndex !== -1) {
                result.hit = true;
                result.distance = minDistance;
                result.mesh = this;
                result.faceId = closestFaceIndex;
            }
            return result;
        }
    }
    SoftEngine.Mesh = Mesh;
    class Device {
        constructor(canvas) {
            console.log("Device constructor called with canvas:", canvas);
            this.workingCanvas = canvas;
            this.workingWidth = canvas.width;
            this.workingHeight = canvas.height;
            const context = this.workingCanvas.getContext("2d");
            if (!context) {
                console.error("Failed to get 2D context from canvas");
                throw new Error("Unable to get 2D context");
            }
            this.workingContext = context;
            // Initialize backbuffer immediately to prevent null reference
            this.clear();
            console.log("Device initialized successfully");
        }
        clear() {
            this.workingContext.clearRect(0, 0, this.workingWidth, this.workingHeight);
            this.backbuffer = this.workingContext.getImageData(0, 0, this.workingWidth, this.workingHeight);
        }
        present() {
            this.workingContext.putImageData(this.backbuffer, 0, 0);
        }
        putPixel(x, y, color) {
            this.backbufferdata = this.backbuffer.data;
            var index = ((x >> 0) + (y >> 0) * this.workingWidth) * 4;
            this.backbufferdata[index] = color.r * 255;
            this.backbufferdata[index + 1] = color.g * 255;
            this.backbufferdata[index + 2] = color.b * 255;
            this.backbufferdata[index + 3] = color.a * 255;
        }
        project(coord, transMat) {
            var point = BABYLON.Vector3.TransformCoordinates(coord, transMat);
            var x = point.x * this.workingWidth + this.workingWidth / 2.0 >> 0;
            var y = -point.y * this.workingHeight + this.workingHeight / 2.0 >> 0;
            return new BABYLON.Vector2(x, y);
        }
        drawPoint(point) {
            if (point.x >= 0 && point.y >= 0 && point.x < this.workingWidth && point.y < this.workingHeight) {
                this.putPixel(point.x, point.y, new BABYLON.Color4(1, 1, 0, 1));
            }
        }
        render(camera, meshes) {
            var viewMatrix = BABYLON.Matrix.LookAtLH(camera.Position, camera.Target, BABYLON.Vector3.Up());
            var projectionMatrix = BABYLON.Matrix.PerspectiveFovLH(0.78, this.workingWidth / this.workingHeight, 0.01, 1.0);
            for (var index = 0; index < meshes.length; index++) {
                var cMesh = meshes[index];
                var worldMatrix = BABYLON.Matrix.RotationYawPitchRoll(cMesh.Rotation.y, cMesh.Rotation.x, cMesh.Rotation.z).multiply(BABYLON.Matrix.Translation(cMesh.Position.x, cMesh.Position.y, cMesh.Position.z));
                var transformMatrix = worldMatrix.multiply(viewMatrix).multiply(projectionMatrix);
                for (var indexVertices = 0; indexVertices < cMesh.Vertices.length; indexVertices++) {
                    var projectedPoint = this.project(cMesh.Vertices[indexVertices], transformMatrix);
                    this.drawPoint(projectedPoint);
                }
                // Draw lines between vertices to form the wireframe
                for (var indexFaces = 0; indexFaces < cMesh.Faces.length; indexFaces++) {
                    var currentFace = cMesh.Faces[indexFaces];
                    var vertexA = this.project(cMesh.Vertices[currentFace.A], transformMatrix);
                    var vertexB = this.project(cMesh.Vertices[currentFace.B], transformMatrix);
                    var vertexC = this.project(cMesh.Vertices[currentFace.C], transformMatrix);
                    this.drawLine(vertexA, vertexB, cMesh.Material.wireframeColor);
                    this.drawLine(vertexB, vertexC, cMesh.Material.wireframeColor);
                    this.drawLine(vertexC, vertexA, cMesh.Material.wireframeColor);
                }
            }
        }
        // Add line drawing capability
        drawLine(point0, point1, color) {
            // Bresenham's line algorithm
            let x0 = point0.x >> 0;
            let y0 = point0.y >> 0;
            let x1 = point1.x >> 0;
            let y1 = point1.y >> 0;
            let dx = Math.abs(x1 - x0);
            let dy = Math.abs(y1 - y0);
            let sx = (x0 < x1) ? 1 : -1;
            let sy = (y0 < y1) ? 1 : -1;
            let err = dx - dy;
            while (true) {
                this.putPixel(x0, y0, color);
                if ((x0 === x1) && (y0 === y1))
                    break;
                let e2 = 2 * err;
                if (e2 > -dy) {
                    err -= dy;
                    x0 += sx;
                }
                if (e2 < dx) {
                    err += dx;
                    y0 += sy;
                }
            }
        }
        // Get width and height of the working canvas
        getWidth() {
            return this.workingWidth;
        }
        getHeight() {
            return this.workingHeight;
        }
        // Create a ray from screen coordinates
        createPickingRay(x, y, camera) {
            // Convert screen coordinates to normalized device coordinates (-1 to 1)
            const ndcX = (2.0 * x) / this.workingWidth - 1.0;
            const ndcY = 1.0 - (2.0 * y) / this.workingHeight;
            // Create view matrix
            const viewMatrix = BABYLON.Matrix.LookAtLH(camera.Position, camera.Target, BABYLON.Vector3.Up());
            // Create projection matrix
            const projectionMatrix = BABYLON.Matrix.PerspectiveFovLH(0.78, this.workingWidth / this.workingHeight, 0.01, 1.0);
            // Get the inverse of view and projection matrices
            const viewProjectionInverse = viewMatrix.multiply(projectionMatrix).invert();
            // Transform to world space
            const rayOriginNear = new BABYLON.Vector3(ndcX, ndcY, 0);
            const rayOriginFar = new BABYLON.Vector3(ndcX, ndcY, 1);
            const worldNear = BABYLON.Vector3.TransformCoordinates(rayOriginNear, viewProjectionInverse);
            const worldFar = BABYLON.Vector3.TransformCoordinates(rayOriginFar, viewProjectionInverse);
            // Create ray direction
            const direction = new BABYLON.Vector3(worldFar.x - worldNear.x, worldFar.y - worldNear.y, worldFar.z - worldNear.z);
            // Create and return the ray
            return new Ray(camera.Position, direction);
        }
    }
    SoftEngine.Device = Device;
})(SoftEngine || (SoftEngine = {}));
