# Web Backend Migration Checklist

## What Moves to the Server
- File storage: userDataDir attachments and exports should move to R2.
- Excel processing: `searchLogic.js`, `src/main/features/agreements/exportExcel.js`, `src/main/features/bid-result/*`.
- Records data: `src/main/features/records/*` (SQLite) and attachments.
- Mail: `src/main/features/mail/smtpService.js`.

## IPC to HTTP Mapping (Starting Point)
- `search-companies` -> `POST /api/search/companies`
- `search-many-companies` -> `POST /api/search/companies/batch`
- `get-regions` -> `GET /api/search/regions`
- `agreements-export-excel` -> `POST /api/agreements/export`
- `records:list-projects` -> `GET /api/records/projects`
- `records:get-project` -> `GET /api/records/projects/:id`
- `records:create-project` -> `POST /api/records/projects`
- `records:update-project` -> `PATCH /api/records/projects/:id`
- `records:delete-project` -> `DELETE /api/records/projects/:id`
- `records:remove-attachment` -> `DELETE /api/records/projects/:id/attachment`
- `records:replace-attachment` -> `PUT /api/records/projects/:id/attachment`
- `mail:send-test` -> `POST /api/mail/test`
- `mail:send-batch` -> `POST /api/mail/batch`

## R2 Environment Variables
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- Optional: `R2_ENDPOINT`, `R2_PUBLIC_BASE_URL`

## Notes
- `src/main/features/excel/excelAutomation.js` is Windows Excel COM automation and will not work on a web server.
- Anything using Electron dialogs/clipboard needs to move to client UI or server APIs.
