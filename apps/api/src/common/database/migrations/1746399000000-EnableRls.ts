import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * EnableRls — activates PostgreSQL Row-Level Security on the five most
 * sensitive per-user tables and creates the access policies that the
 * application enforces via session-level set_config() calls.
 *
 * Policy logic (same pattern on every table):
 *
 *  SELECT / UPDATE / DELETE
 *    Allow when the row's owner column matches app.current_user_id
 *    OR the caller's role is admin / super_admin / system
 *    OR app.current_user_id is empty (trusted background / startup code)
 *
 *  INSERT (WITH CHECK)
 *    Same rules — system / admin code can insert for any user;
 *    regular users can only insert rows they own.
 *
 *  messages table is special: the ownership check covers BOTH sender_id
 *  and recipient_id so both parties can read the same message thread.
 *
 * FORCE ROW LEVEL SECURITY ensures policies apply even to the table owner
 * (the single DB role the application uses), so there is no accidental
 * bypass through the application account itself.
 */
export class EnableRls1746399000000 implements MigrationInterface {
  name = 'EnableRls1746399000000';

  // ── helpers ──────────────────────────────────────────────────────────────

  private setting(key: string): string {
    return `current_setting('${key}', true)`;
  }

  private bypassClause(): string {
    const role = this.setting('app.user_role');
    const uid  = this.setting('app.current_user_id');
    return (
      `${role} IN ('admin', 'super_admin', 'system') ` +
      `OR ${uid} = '' ` +
      `OR ${uid} IS NULL`
    );
  }

  private ownerUsing(table: string, col = 'user_id'): string {
    return `${col}::text = ${this.setting('app.current_user_id')} OR ${this.bypassClause()}`;
  }

  private ownerCheck(col = 'user_id'): string {
    return `${col}::text = ${this.setting('app.current_user_id')} OR ${this.bypassClause()}`;
  }

  // ── up ───────────────────────────────────────────────────────────────────

  async up(queryRunner: QueryRunner): Promise<void> {

    // ── transactions ────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE transactions ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`ALTER TABLE transactions FORCE ROW LEVEL SECURITY`);

    await queryRunner.query(`
      CREATE POLICY transactions_read ON transactions FOR SELECT
      USING (${this.ownerUsing('transactions')})
    `);
    await queryRunner.query(`
      CREATE POLICY transactions_insert ON transactions FOR INSERT
      WITH CHECK (${this.ownerCheck()})
    `);
    await queryRunner.query(`
      CREATE POLICY transactions_update ON transactions FOR UPDATE
      USING (${this.ownerUsing('transactions')})
      WITH CHECK (${this.ownerCheck()})
    `);
    await queryRunner.query(`
      CREATE POLICY transactions_delete ON transactions FOR DELETE
      USING (${this.setting('app.user_role')} IN ('admin', 'super_admin', 'system'))
    `);

    // ── subscriptions ────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`ALTER TABLE subscriptions FORCE ROW LEVEL SECURITY`);

    await queryRunner.query(`
      CREATE POLICY subscriptions_read ON subscriptions FOR SELECT
      USING (${this.ownerUsing('subscriptions')})
    `);
    await queryRunner.query(`
      CREATE POLICY subscriptions_insert ON subscriptions FOR INSERT
      WITH CHECK (${this.ownerCheck()})
    `);
    await queryRunner.query(`
      CREATE POLICY subscriptions_update ON subscriptions FOR UPDATE
      USING (${this.ownerUsing('subscriptions')})
      WITH CHECK (${this.ownerCheck()})
    `);
    await queryRunner.query(`
      CREATE POLICY subscriptions_delete ON subscriptions FOR DELETE
      USING (${this.setting('app.user_role')} IN ('admin', 'super_admin', 'system'))
    `);

    // ── enrollments ──────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`ALTER TABLE enrollments FORCE ROW LEVEL SECURITY`);

    await queryRunner.query(`
      CREATE POLICY enrollments_read ON enrollments FOR SELECT
      USING (${this.ownerUsing('enrollments')})
    `);
    await queryRunner.query(`
      CREATE POLICY enrollments_insert ON enrollments FOR INSERT
      WITH CHECK (${this.ownerCheck()})
    `);
    await queryRunner.query(`
      CREATE POLICY enrollments_update ON enrollments FOR UPDATE
      USING (${this.ownerUsing('enrollments')})
      WITH CHECK (${this.ownerCheck()})
    `);
    await queryRunner.query(`
      CREATE POLICY enrollments_delete ON enrollments FOR DELETE
      USING (${this.setting('app.user_role')} IN ('admin', 'super_admin', 'system'))
    `);

    // ── notifications ────────────────────────────────────────────────────────
    await queryRunner.query(`ALTER TABLE notifications ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`ALTER TABLE notifications FORCE ROW LEVEL SECURITY`);

    await queryRunner.query(`
      CREATE POLICY notifications_read ON notifications FOR SELECT
      USING (${this.ownerUsing('notifications')})
    `);
    await queryRunner.query(`
      CREATE POLICY notifications_insert ON notifications FOR INSERT
      WITH CHECK (${this.ownerCheck()})
    `);
    await queryRunner.query(`
      CREATE POLICY notifications_update ON notifications FOR UPDATE
      USING (${this.ownerUsing('notifications')})
      WITH CHECK (${this.ownerCheck()})
    `);
    await queryRunner.query(`
      CREATE POLICY notifications_delete ON notifications FOR DELETE
      USING (${this.setting('app.user_role')} IN ('admin', 'super_admin', 'system') OR ${this.ownerUsing('notifications')})
    `);

    // ── messages ─────────────────────────────────────────────────────────────
    // Ownership = sender OR recipient; both parties can read the thread.
    await queryRunner.query(`ALTER TABLE messages ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`ALTER TABLE messages FORCE ROW LEVEL SECURITY`);

    const uid = this.setting('app.current_user_id');
    const bypass = this.bypassClause();

    await queryRunner.query(`
      CREATE POLICY messages_read ON messages FOR SELECT
      USING (
        sender_id::text    = ${uid}
        OR recipient_id::text = ${uid}
        OR ${bypass}
      )
    `);
    await queryRunner.query(`
      CREATE POLICY messages_insert ON messages FOR INSERT
      WITH CHECK (
        sender_id::text = ${uid}
        OR ${bypass}
      )
    `);
    await queryRunner.query(`
      CREATE POLICY messages_update ON messages FOR UPDATE
      USING (
        sender_id::text = ${uid}
        OR ${bypass}
      )
      WITH CHECK (
        sender_id::text = ${uid}
        OR ${bypass}
      )
    `);
    await queryRunner.query(`
      CREATE POLICY messages_delete ON messages FOR DELETE
      USING (${this.setting('app.user_role')} IN ('admin', 'super_admin', 'system'))
    `);
  }

  // ── down ─────────────────────────────────────────────────────────────────

  async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of ['transactions', 'subscriptions', 'enrollments', 'notifications', 'messages']) {
      for (const op of ['read', 'insert', 'update', 'delete']) {
        await queryRunner.query(`DROP POLICY IF EXISTS ${table}_${op} ON ${table}`);
      }
      await queryRunner.query(`ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY`);
    }
  }
}
