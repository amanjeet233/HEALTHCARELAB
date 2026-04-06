# Seed 1000+ Lab Tests & Backend Repair (Orchestration Plan)

We will orchestrate 3 agents to resolve current backend compilation errors and fulfill the request to seed 1000+ real, non-mock lab tests.

## 🔴 CRITICAL: User Review Required

> [!WARNING]
> Generating 1000+ completely distinct real lab tests via AI in a single Java seed file will result in a massive file size (~20,000+ lines of Java code) which exceeds LLM generation limits and timeout constraints. Attempting to write this inline will cause truncation and failures.
>   
> **Alternative Proposal (Highly Recommended):** 
> Allow me to generate a script (`python`/`node`) that synthetically scales the base real dataset permutations (100 real seed tests * 15 variations) up to 1000+ robust tests directly into the database, rather than hardcoding 1000 distinct tests in a `.java` file.
> 
> Please let me know whether you approve using a JSON seeding approach or script to populate the Database vs. forcing the Java file to contain 1000 hardcoded records!

## Proposed Agents

### 1. Backend Specialist (`backend-specialist`)
- **Fix Compilation:** Will resolve `[ERROR]... method searchTests in interface LabTestRepository cannot be applied ... reason: actual and formal argument lists differ in length.` found in `LabTestService.java` and `TestService.java`.
- Will also recreate `TestsSeedData.java`, which was wiped out, so the backend can compile.
- Ensure application compiles correctly via `mvn clean compile`.

### 2. Database Architect (`database-architect`)
- Will construct the seeding logic for the **1000+ Lab Tests**.
- Each test will enforce:
  - `item_type`: "TEST" or "PACKAGE"
  - `discount_percent`: 60 for all
  - Accurate `slug`, `parameters_count`, `original_price`, `discounted_price`
  - Real categorical values (CBC, LFT, RFT, TSH, Dengue, Thyroid, etc.)
  - Real fields for `is_top_booked`, `is_top_deal`, `fasting_required`, `image_url`
- *Note:* Dependent on your feedback regarding how this script/seed is inserted.

### 3. Test Engineer (`test-engineer`)
- Will run backend checks executing the Spring Boot test endpoints.
- Will verify UI integration tests via `checklist.py`.

## Verification Scripts Executed
- (Pending) `.agent/skills/vulnerability-scanner/scripts/security_scan.py`
- (Pending) `.agent/skills/lint-and-validate/scripts/lint_runner.py`

## Open Questions

> [!IMPORTANT]
> How would you like me to tackle the 1000-test generation? 
> 1. Write a `.json` file that `TestsSeeder` parses at boot time (Highly recommended).
> 2. Write a Python script to push them directly.
> 3. Stick to the `.java` hardcoding (Will likely encounter truncation).
> 
> *Writing them directly as 1000 lines of `.java` code is extremely prone to timeout truncation.*
