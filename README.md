# AEROMINE 3D Mall Map

An interactive 3D mall directory concept developed by the **AEROMINE R&D Team**. The application renders a real GLTF/GLB building model in the browser and overlays smart, always-visible floating tags above each shop - enabling users to explore the mall layout intuitively and access shop information with a single click.

---

## Concept

Traditional mall directories are static floor plans that require users to orient themselves manually. This project explores a fully interactive 3D alternative: users orbit, pan, and zoom around a true-to-scale 3D model of the mall, while contextual tags float above each building or shop unit. Clicking a tag opens a detail panel with the shop's name, category, opening hours, contact information, and photo.

The approach is data-driven - adding a new shop requires only a single entry in a configuration file, with no changes to the rendering or interaction logic.

---

## Features

- Real-time 3D rendering of a GLTF mall model
- Floating billboarded tags anchored to named building meshes
- Click-to-open shop detail panel with photo, hours, phone, and website
- Orbit, pan, and zoom camera controls
- Fully responsive layout

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| 3D Rendering | [Three.js](https://threejs.org/) v0.176 |
| HTML Overlay Tags | Three.js CSS2DRenderer |
| Build Tool | [Vite](https://vitejs.dev/) v5 |
| 3D Models | GLTF 2.0 / GLB |
| Language | Vanilla JavaScript (ES Modules) |

---

## Project Structure

```
AEROMINE_3D_MALL/
├── public/
│   └── models/
│       ├── mallFinal.gltf        # 3D mall model
│       └── images/               # Shop photos
├── src/
│   ├── main.js                   # Application entry point
│   ├── viewer.js                 # Scene, renderers, camera, controls
│   ├── tag-manager.js            # Floating tag creation and positioning
│   ├── popup.js                  # Shop detail panel
│   └── shop-data.js              # Shop configuration (name, hours, photo, etc.)
├── style.css
├── index.html
└── package.json
```

---

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:3001` in your browser.

```bash
# Build for production
npm run build
```

---

## Adding a Shop

1. Name the mesh in Blender's Outliner panel before exporting the GLB (e.g. `Shop_Cafe_01`)
2. Add an entry to `src/shop-data.js`:

```js
{
  meshName: 'Shop_Cafe_01',
  name: 'Blue Cup Café',
  category: 'Café',
  icon: '☕',
  hours: 'Mon – Sun: 08:00 – 21:00',
  description: 'Specialty coffee and fresh pastries.',
  phone: '+30 210 000 0000',
  website: 'www.example.gr',
  photo: '/models/images/cafe.jpg',   // or null
}
```

No other code changes are required - the tag appears automatically on next load.

---

## About

Developed by the **AEROMINE R&D Team** as a concept project exploring interactive 3D spatial interfaces for real-world environments.

- Website: [www.aeromine.info](https://www.aeromine.info/)
- LinkedIn: [AEROMINE](https://www.linkedin.com/company/aeromine-info/)
