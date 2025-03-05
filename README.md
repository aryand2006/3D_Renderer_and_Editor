# 3D Renderer & Editor

A software-based 3D renderer and editor implemented purely in TypeScript, using the HTML Canvas API for rendering.

## Description

This project is a lightweight 3D rendering engine and editor that runs entirely in the browser without requiring any heavy 3D libraries like Three.js. It implements core 3D graphics concepts from scratch, including mesh representation, coordinate transformations, wireframe rendering, and ray casting for object picking.

## How to Run
```bash
# Compile TypeScript files
npx tsc

# Then open index.html in your browser
open index.html  # On macOS
# or
xdg-open index.html  # On Linux
# or
start index.html  # On Windows
```

## What it does

- Renders 3D primitives (cubes, spheres) with wireframe visualization
- Provides a full-featured 3D editor with:
  - Object selection, creation, and deletion
  - Transform controls (move, rotate, scale)
  - Property panel for precise object manipulation
  - Object hierarchy management
- Camera controls (rotation, pan, zoom)
- Ray casting for accurate object picking in 3D space

## How I built it

The renderer is built using:

- **TypeScript** for type-safe code organization
- **HTML Canvas API** for direct pixel manipulation
- **Custom math implementations** for 3D transformations
- **Software-based rendering techniques**:
  - No WebGL or hardware acceleration
  - Bresenham's line algorithm for wireframe drawing
  - Möller–Trumbore ray-triangle intersection algorithm for picking

The architecture follows a modular approach:
- `SoftEngine.ts`: Core rendering engine with mesh representation and drawing functionality
- `Editor.ts`: Editor functionality with UI interaction and tools
- `main.ts`: Application bootstrap and initialization

## Challenges I ran into

- **Performance optimization** for rendering complex meshes without hardware acceleration
- **Implementing proper picking** in 3D space using ray casting
- **Creating intuitive camera controls** that feel natural to use
- **Math-heavy algorithms** for coordinate transformations and intersection testing
- **Matrix math implementation** for object transformation and projection
- **Scaling implementation** for proper object manipulation

## Accomplishments I'm proud of

- Building a working 3D renderer from scratch without relying on graphics libraries
- Successfully implementing ray casting for object selection
- Creating an intuitive editor UI that mimics professional 3D software
- Achieving reasonable performance despite software-based rendering
- Implementing proper wireframe rendering with depth sorting
- Comprehensive camera controls for scene navigation

## What I learned

- Deep understanding of 3D graphics rendering pipeline
- Practical experience with vector and matrix mathematics
- Techniques for optimizing Canvas-based rendering
- Importance of proper 3D picking algorithms
- UI/UX considerations for 3D editing tools
- Software architecture for interactive 3D applications

## What's next

- **Shaded rendering** beyond wireframes using flat and Gouraud shading
- **Texturing support** for materials and surface details
- **Physics integration** for object interactions
- **Scene graph** for hierarchical object relationships
- **Import/export functionality** for common 3D formats
- **WebGL acceleration** option for better performance
- **Mobile touch support** for editing on tablets and phones
- **Undo/redo system** for editor operations