// This is only needed if you're not using the npm package or script tag approach

declare namespace BABYLON {
    export class Vector2 {
        constructor(x: number, y: number);
        x: number;
        y: number;
    }

    export class Vector3 {
        constructor(x: number, y: number, z: number);
        x: number;
        y: number;
        z: number;
        static Zero(): Vector3;
        static Up(): Vector3;
        static TransformCoordinates(vector: Vector3, transformation: Matrix): Vector3;
    }

    export class Color4 {
        constructor(r: number, g: number, b: number, a: number);
        r: number;
        g: number;
        b: number;
        a: number;
    }

    export class Matrix {
        static LookAtLH(eye: Vector3, target: Vector3, up: Vector3): Matrix;
        static PerspectiveFovLH(fov: number, aspect: number, znear: number, zfar: number): Matrix;
        static RotationYawPitchRoll(yaw: number, pitch: number, roll: number): Matrix;
        static Translation(x: number, y: number, z: number): Matrix;
        multiply(other: Matrix): Matrix;
        invert(): Matrix;
    }
}
