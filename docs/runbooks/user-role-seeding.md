# Role User Seeding Runbook

## Purpose

Seed local/dev role accounts so each portal flow can be tested end to end.

## Command

Run from `apps/api`:

```bash
npm run seed:test-users
```

## Default Seeded Accounts

If no `SEED_*` environment variables are set, the command creates or updates:

- `superadmin@tbcn.local` (`super_admin`)
- `admin@tbcn.local` (`admin`)
- `coach@tbcn.local` (`coach`)
- `mentor@tbcn.local` (`coach` role, mentor persona)
- `partner@tbcn.local` (`partner`)
- `member@tbcn.local` (`member`)

Default password for all accounts:

- `TbcnTest123!`

## Behavior

- Existing users are updated to expected role/profile and password.
- Missing users are created.
- Users are marked as email-verified and active.

## Optional Environment Overrides

You can override each account with env vars before running the command:

- Global password: `SEED_USER_PASSWORD`
- Per-role email/password/name:
  - `SEED_SUPER_ADMIN_EMAIL`, `SEED_SUPER_ADMIN_PASSWORD`, ...
  - `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, ...
  - `SEED_COACH_EMAIL`, `SEED_COACH_PASSWORD`, ...
  - `SEED_MENTOR_EMAIL`, `SEED_MENTOR_PASSWORD`, ...
  - `SEED_PARTNER_EMAIL`, `SEED_PARTNER_PASSWORD`, ...
  - `SEED_MEMBER_EMAIL`, `SEED_MEMBER_PASSWORD`, ...

## Source

- `apps/api/src/common/commands/seed-test-users.ts`
