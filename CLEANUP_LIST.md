# HEALTHCARELAB - Workspace Cleanup List

**Date:** 2026-04-14  
**Total Files for Deletion:** 56 files  
**Estimated Size to Free:** ~22MB  
**Previously Cleaned:** 53MB in commit f8137b1  

---

## ALREADY CLEANED (Previous Commit f8137b1)

**Items Successfully Deleted in Previous Cleanup:**

**Large Test Results (~48MB):**
- ~~`frontend/test-results/`~~ - 35 Playwright test result folders
- ~~`frontend/playwright-report/`~~ - 48MB Playwright report

**Design System (~5MB):**
- ~~`/design-system/`~~ - 10 orphaned design explorations

**Session Memory (~50KB):**
- ~~`/memory/`~~ - Session memory files
  - ~~`memory/SESSION_FINAL_SUMMARY.md`~~
  - ~~`memory/MEMORY.md`~~
  - ~~`memory/COMPLETION_SUMMARY.md`~~

**Duplicate Database Files:**
- ~~`backend/database/1000_tests_seed.sql`~~ - Replaced by V17 migration
- ~~`/backend/database/migrations/`~~ - Conflicting migration folder

**Total Previously Cleaned:** 53MB of files and folders

---

## CATEGORY 1: Root .md Session Files (KEEP ONLY README.md)

**Files to Delete:**
- `redesgin.md` (misspelled, unused)
- `tree.md` (auto-generated tree, 77KB)
- `ux_research.md` (research doc, not referenced)

**Keep These:**
- `README.md` - Project README
- `UI-SPEC.md` - UI specification
- `AUDIT_*.md` - All 5 audit reports (keep these)

**Count:** 3 files, ~78KB

---

## CATEGORY 2: Root Script Files (No Longer Needed)

**Python Scripts:**
- `audit.py` - One-time audit script
- `generate_audit.py` - One-time audit generation
- `generate_audit_new.py` - Duplicate audit script

**PowerShell Scripts:**
- `update_script.py` - Update script (should be .py)
- `update_labtests.ps1` - One-time lab test update
- `fix_controllers.ps1` - One-time controller fix

**Other Files:**
- `push_error.txt` - Error log, should not be committed

**Count:** 6 files, ~5KB

---

## CATEGORY 3: Backend Junk Files

**Large Log Files:**
- `backend/backend_log.txt` - 16MB log file (NEVER commit logs)

**Error Reports:**
- `backend/compile_error.txt` - Compilation error log

**Duplicate SQL Files (covered by migrations):**
- `backend/add-geolocation-columns.sql`
- `backend/add-individual-tests-columns.sql`
- `backend/add-quiz-notifications-tables.sql`
- `backend/create-audit-table.sql`

**Wrong Table SQL Files:**
- `backend/insert-sample-tests.sql` (inserts to wrong table)
- `backend/schema_update.sql` (alters wrong table)

**One-time Scripts:**
- `backend/cleanup.sql` (one-time script, done)
- `backend/generate_1000_tests.py` (replaced by V17 migration)
- `backend/generate_layers.py` (one-time codegen, done)

**Utility Scripts:**
- `backend/generate_missing.ps1`
- `backend/parse_schema.py`
- `backend/check_layers.ps1`
- `backend/fix_repos1.ps1`
- `backend/restore_repos.ps1`

**Developer Utility (should not be in repo):**
- `backend/kill-port.bat` (developer utility)

**Duplicate Database Files:**
- ~~`backend/database/1000_tests_seed.sql`~~ (replaced by V17) - **DELETED in commit f8137b1**

**Count:** 16 files, ~16MB

---

## CATEGORY 4: Frontend Debug and Temp Files

**Debug Files:**
- `frontend/dbg_tech.txt` (empty debug file)
- `frontend/dbg_tech_col.txt` (empty debug file)
- `frontend/debug_patient.txt`
- `frontend/doctor_lint.txt` (empty)
- `frontend/final_test_output.txt` (empty)
- `frontend/temp_card.txt` (empty)

**TypeScript Error Logs:**
- `frontend/tsc_b_out.txt`
- `frontend/tsc_err.txt`
- `frontend/tsc_errors.txt`

**Lint Output:**
- `frontend/pending_lint.txt`
- `frontend/lint_output.txt`
- `frontend/lint_output.json`

**Source Temp Files:**
- `frontend/src/temp_debug.txt`
- `frontend/src/replace.cjs`

**Count:** 13 files, ~2MB

---

## CATEGORY 5: Frontend One-Time Script Files

**JavaScript/CJS Scripts:**
- `frontend/fix.cjs`
- `frontend/fix.js`
- `frontend/fix2.cjs`
- `frontend/rewrite.cjs`
- `frontend/rewrite2.cjs`
- `frontend/modify.js`
- `frontend/mod_ts.js`
- `frontend/script.js`
- `frontend/myfix.js`
- `frontend/test1.js`

**Python Scripts:**
- `frontend/modify.py`
- `frontend/mod_test.py`
- `frontend/update.py`
- `frontend/find_unused.py`
- `frontend/generate_test_database.cjs`
- `frontend/generate_test_database.py`

**Count:** 16 files, ~1MB

---

## CATEGORY 6: Frontend Committed Test Results (Binary/Large)

**Playwright Test Results:**
- ~~`frontend/test-results/`~~ (entire folder - 35 test result folders) - **DELETED in commit f8137b1**
- ~~`frontend/playwright-report/`~~ (entire folder - 48MB report) - **DELETED in commit f8137b1**

**Count:** 0 folders, 0MB (all cleaned)

---

## CATEGORY 7: Design System Orphaned Folder

**Design Explorations:**
- ~~`/design-system/`~~ (entire folder - 10 design explorations, none imported) - **DELETED in commit f8137b1**

**Count:** 0 folders, 0MB (all cleaned)

---

## CATEGORY 8: Memory and Docs Folders

**Session Memory Files:**
- ~~`/memory/`~~ (entire folder - session memory files, not needed in repo) - **DELETED in commit f8137b1**
  - ~~`memory/SESSION_FINAL_SUMMARY.md`~~
  - ~~`memory/MEMORY.md`~~
  - ~~`memory/COMPLETION_SUMMARY.md`~~

**Documentation Check:**
- `/docs/` folder - Contains guides and standards
  - **KEEP:** These are referenced in code and useful
  - **Exception:** Check if any are completely unused

**Count:** 0 folders, 0KB (all cleaned)

---

## CATEGORY 9: Duplicate Migration Folder

**Conflicting Migrations:**
- ~~`/backend/database/migrations/`~~ (NOT Flyway path, conflicts with src/main/resources/db/migration) - **DELETED in commit f8137b1**
  - ~~V10, V11, V12 version numbers conflict~~
  - ~~These are not executed by Flyway~~

**Count:** 0 folders, 0MB (all cleaned)

---

## CATEGORY 10: Postman Duplicates

**Duplicate Collections:**
- `/postman_collection.json` (root duplicate)
- `/Healthcare Local.postman_environment.json` (root duplicate)

**Keep These:**
- `/postman/` folder (canonical location)
- `/tests/` folder (canonical location)

**Count:** 2 files, ~1MB

---

## SUMMARY

### Total Files and Folders for Deletion:

| Category | Files/Folders | Size |
|----------|---------------|------|
| 1. Root .md files | 3 | ~78KB |
| 2. Root scripts | 6 | ~5KB |
| 3. Backend junk | 16 | ~16MB |
| 4. Frontend debug | 13 | ~2MB |
| 5. Frontend scripts | 16 | ~1MB |
| 6. Test results | 0 folders | 0MB |
| 7. Design system | 0 folder | 0MB |
| 8. Memory folder | 0 folder | 0KB |
| 9. Duplicate migrations | 0 folder | 0MB |
| 10. Postman duplicates | 2 | ~1MB |

**TOTAL:** 56 files + 0 folders = **56 items**
**ESTIMATED SIZE:** **~22MB**

---

## CRITICAL FILES TO KEEP (DO NOT DELETE)

### Essential Project Files:
- `README.md` - Project documentation
- `UI-SPEC.md` - UI specification
- `AUDIT_*.md` - All 5 audit reports
- `LICENSE` - Project license
- `package.json` (frontend & backend)
- `pom.xml` - Maven configuration
- `vite.config.ts` - Vite configuration
- `vercel.json` - Deployment config
- `start-*.bat` - Startup scripts
- `kill-port.bat` (root) - Developer utility

### Essential Folders:
- `/backend/src/` - Source code
- `/frontend/src/` - Source code
- `/docs/` - Documentation (keep)
- `/postman/` - Postman collection (keep)
- `/tests/` - Test collection (keep)
- `/load-test/` - Load testing (keep)

### Migration Files (KEEP THESE):
- `/backend/src/main/resources/db/migration/` - Active Flyway migrations
- `/backend/database/` - DELETE (duplicate folder)

---

## VERIFICATION CHECKLIST

After deletion, verify:

1. **Application still starts:**
   - Backend: `mvn spring-boot:run`
   - Frontend: `npm run dev`

2. **Git status clean:**
   - No unexpected file deletions
   - Only expected cleanup files removed

3. **Critical functionality works:**
   - Database migrations run
   - API endpoints respond
   - Frontend loads properly

4. **Size reduction:**
   - Repository size reduced by ~75MB
   - No large binary files remaining

---

**READY FOR DELETION:** All files listed above are safe to remove and will not impact application functionality.

**WAITING FOR CONFIRMATION:** Say "confirm delete" to proceed with cleanup.
