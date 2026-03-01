import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { UsersService } from '../../modules/users/users.service';
import { UserRole, UserStatus } from '@tbcn/shared';

/**
 * Seed Test Users Command
 *
 * Usage:
 *   npm run seed:test-users
 *
 * Purpose:
 *   Upsert role-based test accounts for end-to-end portal testing.
 */

interface SeedUserInput {
  key: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  password: string;
  phone?: string;
}

interface SeedResult {
  key: string;
  email: string;
  role: UserRole;
  password: string;
  action: 'created' | 'updated';
}

function getSeedUsers(): SeedUserInput[] {
  const defaultPassword = process.env.SEED_USER_PASSWORD || 'TbcnTest123!';

  return [
    {
      key: 'super_admin',
      email: process.env.SEED_SUPER_ADMIN_EMAIL || 'superadmin@tbcn.local',
      firstName: process.env.SEED_SUPER_ADMIN_FIRST_NAME || 'Super',
      lastName: process.env.SEED_SUPER_ADMIN_LAST_NAME || 'Admin',
      role: UserRole.SUPER_ADMIN,
      password: process.env.SEED_SUPER_ADMIN_PASSWORD || defaultPassword,
      phone: process.env.SEED_SUPER_ADMIN_PHONE || '254700000001',
    },
    {
      key: 'admin',
      email: process.env.SEED_ADMIN_EMAIL || 'admin@tbcn.local',
      firstName: process.env.SEED_ADMIN_FIRST_NAME || 'Platform',
      lastName: process.env.SEED_ADMIN_LAST_NAME || 'Admin',
      role: UserRole.ADMIN,
      password: process.env.SEED_ADMIN_PASSWORD || defaultPassword,
      phone: process.env.SEED_ADMIN_PHONE || '254700000002',
    },
    {
      key: 'coach',
      email: process.env.SEED_COACH_EMAIL || 'coach@tbcn.local',
      firstName: process.env.SEED_COACH_FIRST_NAME || 'Primary',
      lastName: process.env.SEED_COACH_LAST_NAME || 'Coach',
      role: UserRole.COACH,
      password: process.env.SEED_COACH_PASSWORD || defaultPassword,
      phone: process.env.SEED_COACH_PHONE || '254700000003',
    },
    {
      key: 'mentor',
      email: process.env.SEED_MENTOR_EMAIL || 'mentor@tbcn.local',
      firstName: process.env.SEED_MENTOR_FIRST_NAME || 'Mentor',
      lastName: process.env.SEED_MENTOR_LAST_NAME || 'Coach',
      role: UserRole.COACH,
      password: process.env.SEED_MENTOR_PASSWORD || defaultPassword,
      phone: process.env.SEED_MENTOR_PHONE || '254700000004',
    },
    {
      key: 'partner',
      email: process.env.SEED_PARTNER_EMAIL || 'partner@tbcn.local',
      firstName: process.env.SEED_PARTNER_FIRST_NAME || 'Strategic',
      lastName: process.env.SEED_PARTNER_LAST_NAME || 'Partner',
      role: UserRole.PARTNER,
      password: process.env.SEED_PARTNER_PASSWORD || defaultPassword,
      phone: process.env.SEED_PARTNER_PHONE || '254700000005',
    },
    {
      key: 'member',
      email: process.env.SEED_MEMBER_EMAIL || 'member@tbcn.local',
      firstName: process.env.SEED_MEMBER_FIRST_NAME || 'Test',
      lastName: process.env.SEED_MEMBER_LAST_NAME || 'Member',
      role: UserRole.MEMBER,
      password: process.env.SEED_MEMBER_PASSWORD || defaultPassword,
      phone: process.env.SEED_MEMBER_PHONE || '254700000006',
    },
  ];
}

async function upsertUser(
  usersService: UsersService,
  input: SeedUserInput,
): Promise<SeedResult> {
  const existing = await usersService.findByEmail(input.email);

  if (existing) {
    await usersService.update(existing.id, {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
    });

    await usersService.updatePassword(existing.id, input.password);

    await usersService.adminUpdate(existing.id, {
      role: input.role,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    });

    await usersService.verifyEmail(existing.id);

    return {
      key: input.key,
      email: input.email,
      role: input.role,
      password: input.password,
      action: 'updated',
    };
  }

  const created = await usersService.create({
    email: input.email,
    password: input.password,
    firstName: input.firstName,
    lastName: input.lastName,
    role: input.role,
  });

  await usersService.verifyEmail(created.id);

  if (input.phone) {
    await usersService.update(created.id, { phone: input.phone });
  }

  return {
    key: input.key,
    email: input.email,
    role: input.role,
    password: input.password,
    action: 'created',
  };
}

async function bootstrap() {
  console.log('\nTBCN role user seeding started\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    const seedUsers = getSeedUsers();
    const results: SeedResult[] = [];

    for (const seedUser of seedUsers) {
      const result = await upsertUser(usersService, seedUser);
      results.push(result);
      console.log(`${result.action.toUpperCase()}: ${result.email} (${result.role})`);
    }

    console.log('\nSeeded credentials (for local/dev only):');
    console.table(
      results.map((result) => ({
        key: result.key,
        email: result.email,
        role: result.role,
        password: result.password,
        action: result.action,
      })),
    );

    console.log('\nCompleted role user seeding.\n');
  } finally {
    // Some Nest integrations can keep open handles in CLI context.
    // Bound shutdown wait so the script always returns control to the shell.
    await Promise.race([
      app.close(),
      new Promise<void>((resolve) => setTimeout(resolve, 1500)),
    ]);
  }
}

bootstrap().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
}).then(() => {
  process.exit(0);
});
