import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { UsersService } from '../../modules/users/users.service';
import { UserRole, UserStatus } from '@tbcn/shared';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';

/**
 * Seed Super Admin Command
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register src/common/commands/seed-admin.ts
 *
 * Or via npm script:
 *   npm run seed:admin
 *
 * This creates the first SUPER_ADMIN user if one doesn't already exist.
 * It can also promote an existing user to SUPER_ADMIN.
 */

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function bootstrap() {
  console.log('\n🔐 Brand Coach Network — Super Admin Seeder\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  // Check if a super admin already exists
  const existingAdmins = await usersService.findAll({
    role: UserRole.SUPER_ADMIN,
    page: 1,
    limit: 1,
  });

  if (existingAdmins.data.length > 0) {
    console.log(`⚠️  A Super Admin already exists: ${existingAdmins.data[0].email}`);

    const action = await prompt(
      'Do you want to (C)reate another admin or (P)romote an existing user? [C/P/exit]: ',
    );

    if (action.toLowerCase() === 'exit' || action === '') {
      console.log('Exited.');
      await app.close();
      return;
    }

    if (action.toLowerCase() === 'p') {
      const email = await prompt('Enter the email of the user to promote: ');
      const user = await usersService.findByEmail(email);
      if (!user) {
        console.error(`❌ No user found with email: ${email}`);
        await app.close();
        return;
      }
      await usersService.adminUpdate(user.id, { role: UserRole.SUPER_ADMIN });
      console.log(`✅ ${user.email} promoted to SUPER_ADMIN`);
      await app.close();
      return;
    }
  }

  // Create new super admin
  const email = process.env.ADMIN_EMAIL || (await prompt('Email: '));
  const password = process.env.ADMIN_PASSWORD || (await prompt('Password (min 8 chars): '));
  const firstName = process.env.ADMIN_FIRST_NAME || (await prompt('First name: '));
  const lastName = process.env.ADMIN_LAST_NAME || (await prompt('Last name: '));

  if (!email || !password || password.length < 8) {
    console.error('❌ Email and password (8+ chars) are required.');
    await app.close();
    return;
  }

  // Check if email already exists
  const existing = await usersService.findByEmail(email);
  if (existing) {
    // Promote to super admin
    await usersService.adminUpdate(existing.id, { role: UserRole.SUPER_ADMIN });
    console.log(`✅ Existing user ${email} promoted to SUPER_ADMIN`);
    await app.close();
    return;
  }

  // Create user with super admin role
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await usersService.create({
    email,
    password: hashedPassword,
    firstName: firstName || 'Admin',
    lastName: lastName || 'User',
    role: UserRole.SUPER_ADMIN,
  });

  // Mark as active and email verified (admin doesn't need verification)
  await usersService.verifyEmail(user.id);

  console.log(`\n✅ Super Admin created successfully!`);
  console.log(`   Email: ${email}`);
  console.log(`   Role: ${UserRole.SUPER_ADMIN}`);
  console.log(`   Status: ${UserStatus.ACTIVE}`);
  console.log(`\n💡 You can now log in at your frontend URL.\n`);

  await app.close();
}

bootstrap().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
