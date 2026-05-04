import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { rlsContext } from './rls-context';

const SET_CONFIG_SQL =
  `SELECT set_config('app.current_user_id', $1, false),` +
  `       set_config('app.user_role',       $2, false)`;

/**
 * RlsSubscriber — patches TypeORM's QueryRunner factory so every SQL query
 * is preceded by a PostgreSQL set_config() call that writes the current
 * user's id and role into session-level settings.
 *
 * PostgreSQL RLS policies on protected tables read these settings via
 * current_setting('app.current_user_id', true) and
 * current_setting('app.user_role', true) to decide which rows are visible.
 *
 * Why this approach:
 * - It is transparent: no repository or service changes required.
 * - It works correctly with connection pooling because the SET happens on
 *   the same physical pg connection that immediately runs the actual query.
 * - Background jobs / event listeners that run outside an HTTP request
 *   context will have userId = '' which the RLS policies treat as a
 *   "trusted system" operation with unrestricted access.
 *   For explicit system bypass use runAsSystem() from rls-context.ts.
 */
@Injectable()
export class RlsSubscriber implements OnModuleInit {
  private readonly logger = new Logger(RlsSubscriber.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  onModuleInit(): void {
    const driver = this.dataSource.driver as any;
    const originalCreateQueryRunner = driver.createQueryRunner.bind(driver);

    driver.createQueryRunner = (mode: 'master' | 'slave') => {
      const queryRunner = originalCreateQueryRunner(mode);
      const originalQuery = queryRunner.query.bind(queryRunner);

      queryRunner.query = async (
        sql: string,
        parameters?: unknown[],
        useStructuredResult?: boolean,
      ) => {
        // Skip intercepting our own SET query to prevent infinite recursion
        if (sql.trimStart().startsWith('SELECT set_config(')) {
          return originalQuery(sql, parameters, useStructuredResult);
        }

        const store = rlsContext.getStore();
        const userId = store?.userId ?? '';
        const role = store?.role ?? 'anonymous';

        try {
          await originalQuery(SET_CONFIG_SQL, [userId, role]);
        } catch (err) {
          // Log but never let a failed SET block the actual query —
          // application-level guards remain the last line of defence.
          this.logger.warn(`RLS set_config failed: ${(err as Error).message}`);
        }

        return originalQuery(sql, parameters, useStructuredResult);
      };

      return queryRunner;
    };

    this.logger.log('RLS query interceptor active');
  }
}
