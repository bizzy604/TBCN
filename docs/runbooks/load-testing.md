# Load Testing Runbook

## Objective

Provide a repeatable baseline load test for Sprint 4 launch validation.

## Script

- `apps/api/test/load/smoke.k6.js`

The script validates:
- Public health endpoint latency and availability.
- Program catalog availability under concurrent load.
- Authenticated payments subscription endpoint (if token provided).

## Prerequisites

1. API running locally or on a staging environment.
2. k6 installed locally.
3. Optional: valid JWT token for authenticated checks.

## Commands

From `apps/api`:

```bash
# Run against local API
npm run test:load:smoke

# Run against a specific environment
BASE_URL=https://staging-api.example.com/api/v1 npm run test:load:smoke

# Include authenticated checks
BASE_URL=http://localhost:4000/api/v1 AUTH_TOKEN=<jwt> npm run test:load:smoke
```

## Suggested Thresholds

- `http_req_failed < 2%`
- `p95 http_req_duration < 800ms`

## Reporting Format

Capture and store:
- Test date/time and environment.
- k6 summary output (requests, error rate, latency percentiles).
- Any failed checks and impacted endpoints.
- Follow-up actions and owners.
