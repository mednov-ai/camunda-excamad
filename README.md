# Excamad

Excamad is a browser-based admin portal for Camunda 7 REST APIs. It is built as a static Vue application: the frontend is served from Vite or a web server, and all Camunda calls are made directly from the user's browser to a configured Camunda REST endpoint.

The application is useful for working across one or more Camunda environments: process definitions and instances, history, incidents, migrations, task lists, decisions, BPMN/DMN diagrams, deployments, reporting, and operational dashboards.

## Current State

This repository has been modernized from the original Vue 2 / Vue CLI codebase to Vue 3 and Vite while preserving the existing routes and Camunda 7 REST behavior.

Main stack:

- Vue `3.5.39`
- Vite
- Vue Router 4 with hash routing
- Vuex 4
- Bootstrap 5 with `bootstrap-vue-next`
- Axios for Camunda REST calls
- bpmn.io runtime for BPMN and DMN diagrams:
  - `bpmn-js@18.19.0`
  - `bpmn-js-properties-panel@5.60.0`
  - `dmn-js@17.8.1`

The old Vue 2-only UI and form dependencies have been replaced with local Vue 3-compatible adapters and components under `src/ui/`, `src/forms/`, `src/plugins/`, and `src/visualization/`.

## License And Upstream Note

This repository is a fork and modified version of
[KotskinKotskin/camunda-excamad](https://github.com/KotskinKotskin/camunda-excamad),
originally released under GNU GPLv3.

Local modifications include migrating the original Vue 2 / Vue CLI application
to Vue 3 and Vite. These modifications were made on 2026-07-03.

This covered work is distributed under GNU GPLv3; see `LICENSE`. When
distributing built assets, provide the corresponding source code under the same
license. Third-party components retain their own license notices.

The upstream README previously noted that, starting from `2024-11-01`, further
commercial development moved under StormBPMN and is no longer published as open
source. This repository should be treated as the GPLv3 Excamad code line with
local modernization work applied.

## Requirements

- Node.js and npm
- A reachable Camunda 7 REST endpoint
- CORS enabled on the Camunda REST server for the frontend origin

The repository still contains `.nvmrc` with `14.21.3` as a historical Vue 2 stabilization baseline. The current application is Vue 3/Vite and has been verified with the modern local Node/npm toolchain.

## Quick Start

Install dependencies:

```sh
npm install
```

Start the frontend on the standard local development port:

```sh
npm run dev -- --port 5173
```

Open:

```text
http://localhost:5173/#/
```

To open directly against a local Camunda REST endpoint:

```text
http://localhost:5173/#/?baseurl=http://localhost:8080/engine-rest/
```

Build production assets:

```sh
npm run build
```

The build output is written to `dist/`. Do not commit generated `dist/` files.

## Camunda Backend For Local Testing

For local integration checks, this workspace uses a sibling embedded Camunda backend project:

```sh
cd ../Camunda-backend
./gradlew bootRun
```

Expected local endpoints:

- Camunda REST: `http://localhost:8080/engine-rest`
- Compatibility task form endpoint: `http://localhost:8080/taskfields/{taskId}`

The compatibility endpoint exists because the task list UI expects form field metadata through `/taskfields/{taskId}`.

The backend CORS defaults should allow:

- `http://localhost:5173`
- `http://localhost:8081`

If you connect Excamad to a different Camunda server, configure that server's CORS rules for the frontend origin.

## Connections And Authentication

Camunda endpoints are managed through connection profiles instead of long URLs in the main navigation.

Connection behavior:

- Profiles are stored in local storage under `excamad.connectionProfiles.v1`.
- The active connection controls the Camunda REST base URL used by `src/api/api.js`.
- Legacy storage keys such as `lastUrl`, `listOfUrl`, `urllist`, and `restAuthArray` are migrated on read.
- Deep links with `?baseurl=` are still supported and create or activate a temporary/current connection profile.
- Authentication is session-first. Credentials are not persisted unless the user enables "Remember on this device".

Do not commit real credentials, private customer URLs, or personal tokens in `src/config/`.

## Main Features

- Process definitions and runtime instances
- Process detail pages with current activity, variables, incidents, jobs, history, and history duration diagrams
- BPMN viewer and modeler with Camunda Platform properties
- Migration and complex migration screens
- Runtime and history search
- Incident inspection and retry/fix workflows
- Task list with generated forms
- Decision definitions, statistics, and DMN viewer/modeler
- Deployments and BPM-as-a-Service screens
- Live event stream
- Misc reports and operational dashboards

## Project Layout

- `src/main.js` - Vue 3 application bootstrap, plugin registration, and global components
- `src/router/router.js` - hash routes and `?baseurl=` preservation
- `src/store/store.js` - Vuex state for connections, auth runtime state, UI flags, and shared Camunda settings
- `src/api/api.js` - Axios-based Camunda REST client factory
- `src/connections/` - connection profile storage, normalization, migration, and tests
- `src/bpmn/` - BPMN runtime adapter, Camunda moddle setup, and focused tests
- `src/components/Diagram.vue` - BPMN diagram view/edit/download component
- `src/components/decisions/DecisionDiagram.vue` - DMN diagram view/edit/deploy component
- `src/components/BaseUrl.vue` - Connections screen
- `src/components/NavBar.vue` - global application navigation and connection chip
- `src/views/` - route-level screens
- `src/ui/` - local Vue 3 replacements for legacy UI widgets
- `src/forms/` - generated form rendering helpers
- `src/plugins/` - local Vue 3 plugin replacements for legacy Vue 2 plugins
- `public/help/` - static help assets
- `bpmnlint/` - vendored BPMN lint tooling artifact; do not change unless working on lint behavior

## Scripts

```sh
npm run dev
npm run serve
npm run build
npm run lint
npm run test:connections
npm run test:diagrams
npm run test:reports
npm run test:compat
```

Notes:

- `npm run serve` is an alias for the Vite dev server.
- `npm run lint` checks JavaScript and Vue files under `src/`.
- The focused test scripts use Node's built-in test runner.

## Verification Checklist

For frontend-only changes:

```sh
npm run lint
npm run build
```

For connection/profile changes:

```sh
npm run test:connections
```

For BPMN/DMN diagram changes:

```sh
npm run test:diagrams
```

For report/dashboard URL changes:

```sh
npm run test:reports
```

For Vue 3 compatibility hygiene:

```sh
npm run test:compat
```

For local integration:

1. Start `../Camunda-backend` on port `8080`.
2. Start this frontend on port `5173`.
3. Open `http://localhost:5173/#/?baseurl=http://localhost:8080/engine-rest/`.
4. Smoke-test process definitions, process detail, history, incidents, migration, task list, decisions, reports, and diagram edit/view flows.

## Repository Hygiene

Do not commit generated or local-only artifacts:

- `node_modules/`
- `dist/`
- `graphify-out/`
- local `.env.*.local` files

`graphify-out/` is generated codebase analysis output. Use it locally for architecture exploration, but keep it out of commits.
