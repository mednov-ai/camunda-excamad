# FAQ

### What is Excamad?

Excamad is a browser-based Camunda 7 operations console. It calls the configured Camunda REST endpoint directly from the browser, so the Camunda server must allow CORS for the frontend origin.

### Which Camunda REST URL should I use?

- Standalone Camunda 7 usually uses `/engine-rest/`.
- Embedded Camunda 7 often uses `/rest/`.
- Local smoke testing in this workspace uses `http://localhost:8080/engine-rest/`.

Open [Connections](#/settings) to create, test, save, and switch Camunda REST profiles.

### Why does the app show "Cannot reach Camunda REST"?

Check these first:

- The Camunda backend is running.
- The URL ends with the REST root, for example `/engine-rest/`.
- CORS allows the frontend origin.
- Basic or Bearer authentication is valid when enabled.

For local testing, the companion backend should allow `http://localhost:5173`.

### How do deep links keep the active server?

Routes can include `?baseurl=...`. Excamad reads this query parameter, activates a temporary connection profile, and keeps the same base URL while navigating.

### Where are connection profiles stored?

Profiles are stored in browser local storage under `excamad.connectionProfiles.v1`. Authentication is session-first unless "Remember on this device" is enabled.

### Why does task list need `/taskfields/{taskId}`?

Camunda REST does not expose all generated task form metadata in the shape this UI expects. Excamad uses a small compatibility endpoint, `/taskfields/{taskId}`, to load form fields for the task details screen.

### Why is a report not shown?

Reports are mapped per Camunda REST URL. If the active connection has no configured dashboard mapping, the Reports page shows an empty configured state instead of embedding an unrelated dashboard.

### Can I edit BPMN and DMN diagrams?

Yes. Process and decision diagram screens use the current bpmn.io runtime for view and edit modes. Saving or deploying still depends on the Camunda REST permissions available for the active connection.

### Which screens are the main daily workflow?

- [Process definitions and migration](#/migration)
- [Incidents](#/incident)
- [Task list](#/tasklist)
- [Decision definitions](#/decisiondefinitions)
- [History and search](#/history)
- [Live stream](#/stream)
