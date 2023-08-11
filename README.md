# jostaberry

AI Prompt Project

Project Overview
 
A web application that integrates advanced graphics rendering with AI chat functionalities, and it is set up using Astro, a modern frontend framework. The application leverages the following key components and features:

WebGL Integration: The application has a core WebGL class that sets up Three.js, a popular 3D graphics library. This class, named WebGL, handles rendering, scene, camera, resizing events, and frame animations. Shader programs are also being developed for this purpose, with both vertex and fragment shaders (vs.glsl and fs.glsl) for various graphical effects.

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
```

3. Start the application:

```
npm run start
```
![jostaberry Application Screenshot](src/images/router-green-button.png)

![jostaberry Application Screenshot](src/images/brand-agent.png)

![jostaberry Application Screenshot](src/images/cable-router.png)

![jostaberry Application Screenshot](src/images/home-page.png)

Key Features
Intuitive AI Assistant: Interact with a powerful AI assistant that guides your 3D creation process and helps you navigate your 3D canvas with ease.
Interactive 3D Canvas: Use a flexible 3D space built on the Three.js framework to view, analyze, and manipulate your projects.

Chat: A component related to messaging and chat functionality.
Canvas: A component for displaying a 3D canvas using Three.js.


[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```
/
├── public/
│   └── images/
│   │   ├── router_diff.png 
│       └── router_nrm.png     
├── src/
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
│   │   │   ├── ZoomButton.astro
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
│   ├── images
│   │   ├── brand-agent.png
│   │   ├── cable-router.png
│   │   ├── home-page.pn
│   │   ├── logo.svg
│   │   └── router-green-button.png
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── agent.astro
│   │   └── index.astro
│   ├── scripts/
│   │   ├── webgl/
│   │   │   ├── core/
│   │   │   │   └── WebGL.js
│   │   │   ├── shader/
│   │   │   │   ├── fs.glsl
│   │   │   │   └── vs.glsl
│   │   │   └── utils/
│   │   │       ├── assetLoader.js
│   │   │       └── OrbitControls.js
│   │   ├── entry.ts
│   │   └── utils.ts
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
