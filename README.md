# jostaberry - 👾 3D Graphics Rendering and AI Chat Application 💬 
Project Overview
 
A web application that integrates advanced graphics rendering with AI chat functionalities, and it is set up using Astro, a modern frontend framework. The application leverages the following key components and features:

WebGL Integration: The application has a core WebGL class that sets up Three.js, a popular 3D graphics library. This class, named WebGL, handles rendering, scene, camera, resizing events, and frame animations. Shader programs are also being developed for this purpose, with both vertex and fragment shaders (vertexShader.glsl and fragmentShader.glsl) for various graphical effects.

Astro Framework: The frontend is built using the Astro framework. There are distinct pages (index.astro, agent.astro) and reusable components (e.g., Hero, Layout, Card, Canvas, and Chat). The Astro configuration (astro.config.mjs) has been set up to work with TailwindCSS and includes server-side configurations to proxy API requests.

Chat Functionality: Within the application, there's a chat component, an AI-driven chatbot. It communicates with Azure ML, as seen from the azureML.js module, which handles posting data to an Azure endpoint. This module was refactored to use Axios for HTTP requests and better handle chat histories.

Server-Side Operations: A separate Express server (server.js) has been established, to act as a middleware or proxy server. This server is responsible for making post requests, using Axios, to an external API. The server is set up with CORS for cross-origin requests and includes logging middleware for monitoring incoming request bodies.

Configuration and Build Tools: The project has TypeScript (ts.config.json) for static typing and robust tooling. The build and development processes are managed using npm scripts defined in package.json.

Styling with TailwindCSS: TailwindCSS is integrated into the Astro framework, allowing for utility-first CSS, which makes for rapid UI development.

In essence, the jostaberry project seems to be a rich web application that merges 3D graphics rendering capabilities with interactive chat functionalities, AI-powered, all built on a modern stack comprising Astro, Three.js, TypeScript, and Express.


Getting Started
1. Installation

Clone the repository:

```
git clone https://github.com/mollybeach/jostaberry.git
```

2. Navigate into the project directory:

```
cd jostaberry
cd webapp
```

3. Start the application:

```
npm run start
```
![Jostaberry Application Screenshot](https://github.com/mollybeach/jostaberry/blob/main/public/images/readme/lighting-sculpture.gif)

![jostaberry Application Screenshot](webapp/src/images/readme/router-green-button.png)

![jostaberry Application Screenshot](webapp/src/images/readme/brand-agent.png)

![jostaberry Application Screenshot](webapp/src/images/readme/cable-router.png)

![jostaberry Application Screenshot](webapp/src/images/readme/home-page.png)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```
webapp/
├── public/
│   ├── images/
│   │   └── favicon.svg
│   └── models/
│       ├── fbx
│       │   ├── router_diff.png
│       │   ├── router_nrm.png
│       │   └── router_v01.fbx
│       ├── glb
│       │   ├── router_notexture.glb
│       │   ├── router_texture_cabletest4.glb
│       │   ├── router_texture_lightblinktest.glb
│       │   └── router_texture_restbuttontest.glb
│       └── gltf
│           ├── router_notexture.gltf
│           ├── router_texture_cabletest4.gltf
│           ├── router_texture_lightblinktest.gltf
│           └── router_texture_restbuttontest.gltf
├── src/
│   ├── api/
│   │   └── azureML.js
│   ├── components/
│   │   ├── common/
│   │   │   ├── Box.astro
│   │   │   ├── Card.astro
│   │   │   ├── Container.astro
│   │   ├── primitives/
│   │   │   ├── ArrowButton.astro
│   │   │   ├── Avatar.astro
│   │   │   ├── Button.astro
│   │   │   ├── ButtonMessage.astro
│   │   │   ├── EmojiButton.astro
│   │   │   ├── GitHubButton.astro
│   │   │   ├── IconHeader.astro
│   │   │   ├── SendButton.astro
│   │   │   ├── SuggestionButton.astro
│   │   │   ├── TwitterButton.astro
│   │   │   ├── UploadFileButton.astro
│   │   │   └── ZoomButton.astro
│   │   ├── Canvas.astro
│   │   ├── CanvasBar.astro
│   │   ├── CanvasScene.astro 
│   │   ├── Chat.astro
│   │   ├── ChatBar.astro
│   │   ├── ChatMessages.astro
│   │   ├── ChatSuggestions.astro
│   │   ├── Footer.astro
│   │   ├── Header.astro
│   │   └── Hero.astro
│   ├── data/
│   │   ├── sampleMessageData.js
│   │   ├── sampleMessageData.json
│   │   ├── sampleSuggestionsData.js
│   │   └── sampleSuggestionsData.json
│   ├── graphics/ 
│   │   ├── core/
│   │   │   └── WebGL.js
│   │   ├── shader/
│   │   │   ├── fragmentShader.glsl
│   │   │   └── vertexShader.glsl
│   │   ├──utils/
│   │   │       ├── assetLoader.js
│   │   │       └── OrbitControls.js
│   │   └── ThreeCanvas.ts
│   ├── images
│   │   ├── readme/
│   │   │   ├── brand-agent.png
│   │   │   ├── cable-router.png
│   │   │   ├── home-page.pn
│   │   │   └── router-green-button.png
│   │   └── logo.svg
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── agent.astro
│   │   └── index.astro
│   ├── stores/
│   │    └── store.js
│   └── types/
│       └── glsl.d.ts
├── env.d.ts
├── astro.config.mjs
├── package.json
├── prettier.config.js
├── README.md
├── server.js
├── tailwind.config.js
└── tsconfig.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:3000`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
