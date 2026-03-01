/* eslint-disable no-console */
const BASE_URL = process.env.RBAC_BASE_URL || 'http://localhost:4000/api/v1';
const PASSWORD = process.env.RBAC_PASSWORD || 'TbcnTest123!';

const USERS = [
  { key: 'member', email: process.env.RBAC_MEMBER_EMAIL || 'member@tbcn.local', role: 'member' },
  { key: 'partner', email: process.env.RBAC_PARTNER_EMAIL || 'partner@tbcn.local', role: 'partner' },
  { key: 'coach', email: process.env.RBAC_COACH_EMAIL || 'coach@tbcn.local', role: 'coach' },
  { key: 'admin', email: process.env.RBAC_ADMIN_EMAIL || 'admin@tbcn.local', role: 'admin' },
  { key: 'super_admin', email: process.env.RBAC_SUPER_ADMIN_EMAIL || 'superadmin@tbcn.local', role: 'super_admin' },
];

const TESTS = [
  { name: 'Users list', method: 'GET', path: '/users', allow: ['admin', 'super_admin'] },
  { name: 'Users stats', method: 'GET', path: '/users/stats', allow: ['admin', 'super_admin'] },
  { name: 'Analytics overview', method: 'GET', path: '/analytics/admin/overview', allow: ['admin', 'super_admin'] },
  { name: 'Payments admin txns', method: 'GET', path: '/payments/admin/transactions', allow: ['admin', 'super_admin'] },
  { name: 'Coupons list', method: 'GET', path: '/coupons', allow: ['admin', 'super_admin'] },
  { name: 'Coupons analytics', method: 'GET', path: '/coupons/admin/analytics', allow: ['admin', 'super_admin'] },
  { name: 'Programs list', method: 'GET', path: '/programs', allow: ['coach', 'admin', 'super_admin'] },
  { name: 'Programs stats', method: 'GET', path: '/programs/stats', allow: ['admin', 'super_admin'] },
  { name: 'Community moderation list', method: 'GET', path: '/community/posts/moderation/list', allow: ['admin', 'super_admin'] },
  { name: 'Create event', method: 'POST', path: '/events', allow: ['coach', 'admin', 'super_admin'], body: {} },
  { name: 'Coach profile upsert', method: 'POST', path: '/coaches/me/profile', allow: ['coach', 'admin', 'super_admin'], body: {} },
  { name: 'Generate certificate', method: 'POST', path: '/certificates/generate', allow: ['coach', 'admin', 'super_admin'], body: {} },
  { name: 'Notifications list', method: 'GET', path: '/notifications', allow: ['member', 'partner', 'coach', 'admin', 'super_admin'] },
];

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  const text = await response.text();
  let body = text;
  try {
    body = JSON.parse(text);
  } catch {
    // keep raw text
  }
  return { status: response.status, body };
}

async function login(email) {
  const result = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });

  if (result.status !== 200 || !result.body?.data?.accessToken) {
    throw new Error(`Login failed for ${email}: status=${result.status}`);
  }

  return result.body.data.accessToken;
}

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function isAllowedStatus(status) {
  return status !== 401 && status !== 403;
}

async function ensureMemberEnrollment(memberToken) {
  const catalog = await request('/programs/catalog');
  if (catalog.status !== 200 || !Array.isArray(catalog.body?.data) || catalog.body.data.length === 0) {
    throw new Error('Could not load program catalog for enrollment isolation checks');
  }

  const programId = catalog.body.data[0].id;
  const mine = await request('/enrollments/me', {
    method: 'GET',
    headers: authHeaders(memberToken),
  });

  if (mine.status !== 200) {
    throw new Error(`Failed to list member enrollments: status=${mine.status}`);
  }

  if (Array.isArray(mine.body?.data) && mine.body.data.length > 0) {
    return mine.body.data[0].id;
  }

  const create = await request('/enrollments', {
    method: 'POST',
    headers: authHeaders(memberToken),
    body: JSON.stringify({ programId }),
  });

  if (create.status === 201 && create.body?.data?.id) {
    return create.body.data.id;
  }

  if (create.status === 409) {
    const retry = await request('/enrollments/me', {
      method: 'GET',
      headers: authHeaders(memberToken),
    });
    if (retry.status === 200 && Array.isArray(retry.body?.data) && retry.body.data.length > 0) {
      return retry.body.data[0].id;
    }
  }

  throw new Error(`Failed to create or resolve member enrollment: status=${create.status}`);
}

async function run() {
  console.log(`RBAC smoke check against: ${BASE_URL}`);
  const tokens = {};

  for (const user of USERS) {
    tokens[user.role] = await login(user.email);
  }

  const rows = [];
  const failures = [];

  for (const test of TESTS) {
    for (const user of USERS) {
      const response = await request(test.path, {
        method: test.method,
        headers: authHeaders(tokens[user.role]),
        body: test.body ? JSON.stringify(test.body) : undefined,
      });
      const shouldAllow = test.allow.includes(user.role);
      const pass = shouldAllow ? isAllowedStatus(response.status) : response.status === 403;
      const row = {
        test: test.name,
        role: user.role,
        status: response.status,
        expected: shouldAllow ? 'allow' : 'deny',
        pass,
      };
      rows.push(row);
      if (!pass) {
        failures.push({ ...row, body: response.body });
      }
    }
  }

  const memberEnrollmentId = await ensureMemberEnrollment(tokens.member);
  const partnerEnrollmentRead = await request(`/enrollments/${memberEnrollmentId}`, {
    method: 'GET',
    headers: authHeaders(tokens.partner),
  });
  const partnerSubmissionsRead = await request(
    `/assessments/enrollment/${memberEnrollmentId}/submissions`,
    {
      method: 'GET',
      headers: authHeaders(tokens.partner),
    },
  );

  const isolationRows = [
    {
      test: 'Partner cannot read member enrollment',
      role: 'partner',
      status: partnerEnrollmentRead.status,
      expected: 'deny',
      pass: partnerEnrollmentRead.status === 403,
      body: partnerEnrollmentRead.body,
    },
    {
      test: 'Partner cannot read member enrollment submissions',
      role: 'partner',
      status: partnerSubmissionsRead.status,
      expected: 'deny',
      pass: partnerSubmissionsRead.status === 403,
      body: partnerSubmissionsRead.body,
    },
  ];

  for (const row of isolationRows) {
    rows.push({ test: row.test, role: row.role, status: row.status, expected: row.expected, pass: row.pass });
    if (!row.pass) {
      failures.push(row);
    }
  }

  console.table(rows);
  const passCount = rows.filter((row) => row.pass).length;
  console.log(`Summary: total=${rows.length} pass=${passCount} fail=${failures.length}`);

  if (failures.length > 0) {
    console.log('Failures:');
    console.table(failures);
    process.exit(1);
  }
}

run().catch((error) => {
  console.error('RBAC smoke failed:', error);
  process.exit(1);
});
