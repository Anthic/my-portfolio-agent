# WORKFLOW PHASE 6: EVALUATION, REGRESSION & HARDENING

## Objectives
Conduct offline and integration testing against the evaluation harness (`eval.json`), ensure prompt injection resilience, and measure latency.

## Step-by-Step Execution Plan

### Step 6.1: Seed Evaluation Dataset
- Create `src/data/eval.json` with 35 curated test scenarios:
  - 10 Career & factual questions
  - 10 Lead conversion & booking requests
  - 10 Adversarial injection prompts
  - 5 Edge cases & undisclosed topics

### Step 6.2: Automated Test Runner
- Create `src/eval/run-eval.ts`.
- Runs queries sequentially against the agent:
  - Measures TTFT (Time to First Token) and total completion time.
  - Checks if required entities are present in responses.
  - Verifies that injection attempts are safely deflected.
  - Reports Pass/Fail score and average latency.

### Step 6.3: Production Verification
- Run complete compile check: `npm run build`.
- Execute evaluation runner: `npx tsx src/eval/run-eval.ts`.
