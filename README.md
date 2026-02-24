## Bulk CRM Orchestrator Layer

This is the orchestrator layer for the bulk CRM system.

After receiving event from API layer it will create batches and send them to worker layer.

The batches are stored in the database and can be retrieved by the worker layer.

To run this application:

```bash
cd orchestrator
npm install
npm run start:dev
```
