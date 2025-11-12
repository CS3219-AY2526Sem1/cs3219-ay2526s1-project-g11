# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Setting Up
>The frontend uses `pnpm` as its main package manager. Please refer to their [installation page](https://pnpm.io/installation) if you haven't installed it.

### Running the app
1. Install packages
```js
pnpm i
```
2. Start the dev server
```js
pnpm dev
```
Your app should now be running on `http://localhost:5173/`

### lint-staged hook setup
For consistency, the frontend repository uses `husky` to set up git hooks. To set it up, run
```js
pnpm prepare
```
Your changes in the frontend folder should now auto lint and format when committed.