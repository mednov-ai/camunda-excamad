# Agent Instructions

## Project Overview

Excamad is a Vue 2 single-page application for administering one or more Camunda REST endpoints from the browser. It includes process, decision, incident, migration, tasklist, deployment, BPM-as-a-Service, Jira, Bitbucket, and reporting screens.

The upstream README states that the open-source code is no longer actively updated after 2024-11-01, while the previous code remains under GNU GPLv3. Treat this repository as a legacy Vue 2 application and avoid broad modernization unless explicitly requested.

## Main Commands

- Install dependencies: `npm install`
- Start the local dev server: `npm run serve`
- Build static assets into `dist/`: `npm run build`
- Run linting: `npm run lint`

This project uses older dependencies, including Vue CLI 4, Vue 2.6, and `node-sass` 4. If install/build fails on a modern Node.js version, retry with an older Node runtime compatible with this stack, or use the Docker build as a reference.

## Architecture Map

- `src/main.js` is the application bootstrap. It registers many Vue plugins and global components, attaches the API factory as `Vue.prototype.$api`, and mounts the root app.
- `src/router/router.js` defines the Vue Router routes and preserves `baseurl` query parameters while navigating.
- `src/store/store.js` holds the shared Vuex state for Camunda base URL, auth settings, BPM-as-a-Service mode, role, server status, and UI flags.
- `src/api/api.js` creates axios clients from Vuex state and applies Basic or Bearer auth headers when enabled.
- `src/config/*.js` stores default environment URLs and integration endpoints. Do not commit real credentials or private customer endpoints here.
- `src/views/` contains route-level screens.
- `src/components/` contains the feature components. Important subareas include `detail-process-instance`, `detail-process-definition`, `decisions`, `migration`, `modification`, `tasklist`, `bpmasservice`, `systems`, `groups`, `jira-integration`, and `bitbucket-integration`.
- `public/help/` contains markdown and GIF help assets served as static public files.
- `bpmnlint/` is a local copy of bpmnlint 6.4.0 and custom BPMN lint rules/configuration. Treat it as vendored/tooling code unless the task is specifically about BPMN lint behavior.

## Coding Guidelines

- Follow the existing Vue 2 Options API style and current component organization.
- Prefer local, feature-scoped changes over large framework or dependency upgrades.
- Keep route-level wiring in `src/router/router.js` and shared cross-screen state in Vuex.
- Use the existing axios API factory instead of creating unrelated HTTP clients.
- Preserve the app's browser-only/serverless deployment model: generated files are hosted statically, and Camunda REST calls happen from the browser.
- Be careful with auth-related state. The app stores REST auth settings in Vuex/localStorage paths; avoid logging or hardcoding secrets.
- The ESLint configuration is intentionally permissive for this legacy codebase. Do not introduce unrelated formatting churn.
- Keep generated build output, `node_modules`, and graph/index artifacts out of commits unless the user asks for them.

## Camunda And Integration Notes

- Camunda REST endpoints usually use `/rest` for embedded Camunda and `/engine-rest` for standalone Camunda.
- CORS must be enabled on the target Camunda server because the SPA calls REST APIs from the browser.
- BPM-as-a-Service uses defaults from `src/config/settings.js`, especially `BPMAASURL` and `STATRTERPROCESSNAME`.
- Jira, Bitbucket, Splunk, and audit URLs are configured in `src/config/settings.js`; verify whether they are placeholders, legacy internal URLs, or current customer values before changing behavior.

## Verification

- Run `npm run lint` after JavaScript/Vue edits when dependencies are installed.
- Run `npm run build` before claiming production readiness.
- There is no obvious unit test suite in the root `package.json`; for behavioral changes, add focused manual verification notes or tests only when the existing setup supports them.
- For Docker verification, use the root `Dockerfile`; it builds with `node:10-alpine` and serves the built app through an unprivileged nginx image.

## Graphify

- `graphify-out/` is generated analysis output and should normally remain local.
- When asked about architecture or code relationships, prefer the existing graph in `graphify-out/graph.json` if present. Rebuild or update the graph only when the user asks for fresh indexing.
