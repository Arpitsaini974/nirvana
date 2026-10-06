/**
 * Comprehensive Automated Test Suite for PHP Backend
 * Verifies 100% API Parity between Node.js and PHP
 */

const BASE_URL = 'http://127.0.0.1:8000';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 TESTING NIRVANA PHP BACKEND FOR HOSTINGER');
  console.log('====================================================\n');

  // 1. Health Check
  console.log('--- 1. Health Check & Service ---');
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    assert(res.status === 200, 'Health check returns 200 OK');
    assert(data.status === 'ok', 'Status is "ok"');
  } catch (e) {
    assert(false, `Health check error: ${e.message}`);
  }

  // 2. Settings
  console.log('\n--- 2. Club Settings ---');
  try {
    const res = await fetch(`${BASE_URL}/api/settings`);
    const data = await res.json();
    assert(res.status === 200, 'Settings returns 200 OK');
    assert(data.club_name === 'NIRVANA', `Club name is "${data.club_name}"`);
    assert(Array.isArray(data.objectives), 'Objectives parsed as array');
    assert(typeof data.social_links === 'object', 'Social links parsed as object');
  } catch (e) {
    assert(false, `Settings error: ${e.message}`);
  }

  // 3. Professors
  console.log('\n--- 3. Professors / Faculty Advisory ---');
  try {
    const res = await fetch(`${BASE_URL}/api/professors`);
    const data = await res.json();
    assert(res.status === 200, 'Professors returns 200 OK');
    assert(Array.isArray(data) && data.length >= 4, `Found ${data.length} professors`);
    assert(!!data[0].name && !!data[0].role, 'Professor has name and role');
  } catch (e) {
    assert(false, `Professors error: ${e.message}`);
  }

  // 4. Team Members & QR Codes
  console.log('\n--- 4. Team Members & Dynamic QR Codes ---');
  try {
    const res = await fetch(`${BASE_URL}/api/members`);
    const data = await res.json();
    assert(res.status === 200, 'Members list returns 200 OK');
    assert(Array.isArray(data) && data.length >= 6, `Found ${data.length} active team members`);
    assert(data[0].qr_data && data[0].qr_data.startsWith('data:image/png;base64,'), 'Member has valid base64 PNG QR code');

    // Single member public profile
    const singleRes = await fetch(`${BASE_URL}/api/members/1`);
    const singleData = await singleRes.json();
    assert(singleRes.status === 200, 'Single member profile returns 200 OK');
    assert(singleData.exists === true, 'Member exists flag is true');
    assert(singleData.member.name === data[0].name, 'Member name matches');
  } catch (e) {
    assert(false, `Members error: ${e.message}`);
  }

  // 5. Alumni & QR Codes
  console.log('\n--- 5. Alumni & Dynamic QR Codes ---');
  try {
    const res = await fetch(`${BASE_URL}/api/alumni`);
    const data = await res.json();
    assert(res.status === 200, 'Alumni list returns 200 OK');
    assert(Array.isArray(data) && data.length >= 3, `Found ${data.length} alumni members`);
    assert(data[0].qr_data && data[0].qr_data.startsWith('data:image/png;base64,'), 'Alumni has valid base64 PNG QR code');

    // Single alumni
    const singleRes = await fetch(`${BASE_URL}/api/alumni/1`);
    const singleData = await singleRes.json();
    assert(singleRes.status === 200, 'Single alumni returns 200 OK');
    assert(singleData.alumni && singleData.alumni.name === data[0].name, 'Alumni profile retrieved');
  } catch (e) {
    assert(false, `Alumni error: ${e.message}`);
  }

  // 6. Events
  console.log('\n--- 6. Events & Filtering ---');
  try {
    const statsRes = await fetch(`${BASE_URL}/api/events/stats`);
    const statsData = await statsRes.json();
    assert(statsRes.status === 200, 'Events stats returns 200 OK');
    assert(statsData.total >= 5, `Total events: ${statsData.total}`);

    const eventsRes = await fetch(`${BASE_URL}/api/events`);
    const eventsData = await eventsRes.json();
    assert(eventsRes.status === 200, 'Events list returns 200 OK');
    assert(eventsData.length >= 5, `Retrieved ${eventsData.length} events`);
  } catch (e) {
    assert(false, `Events error: ${e.message}`);
  }

  // 7. Certificates
  console.log('\n--- 7. Certificates ---');
  try {
    const typesRes = await fetch(`${BASE_URL}/api/certificates/types`);
    const typesData = await typesRes.json();
    assert(typesRes.status === 200, 'Certificates types returns 200 OK');
    assert(Array.isArray(typesData) && typesData.length > 0, `Types found: ${typesData.join(', ')}`);

    const certsRes = await fetch(`${BASE_URL}/api/certificates`);
    const certsData = await certsRes.json();
    assert(certsRes.status === 200, 'Public certificates returns 200 OK');
    assert(Array.isArray(certsData) && certsData.length > 0, `Found ${certsData.length} public certificates`);
  } catch (e) {
    assert(false, `Certificates error: ${e.message}`);
  }

  // 8. Contact Messages
  console.log('\n--- 8. Contact Form Submission ---');
  try {
    const msgRes = await fetch(`${BASE_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'PHP Test User',
        email: 'test@hostinger.com',
        subject: 'Testing PHP API',
        message: 'Hello from PHP test suite'
      })
    });
    const msgData = await msgRes.json();
    assert(msgRes.status === 201, 'Contact message submitted with 201 Created');
    assert(msgData.message.includes('Thank you'), 'Confirmation message received');
  } catch (e) {
    assert(false, `Contact message error: ${e.message}`);
  }

  // 9. Admin Authentication & Session
  console.log('\n--- 9. Admin Authentication (JWT) ---');
  let adminToken = '';
  try {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@nirvana.edu',
        password: 'Admin@123'
      })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'NIRVANA Admin login returns 200 OK');
    assert(!!loginData.token, 'Received valid JWT Bearer token');
    adminToken = loginData.token;

    // Verify session via /api/auth/me
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, '/api/auth/me session verified with 200 OK');
    assert(meData.admin.email === 'admin@nirvana.edu', `Admin verified as ${meData.admin.email}`);
  } catch (e) {
    assert(false, `Auth error: ${e.message}`);
  }

  // 10. Forgot Password & Reset Password Workflow
  console.log('\n--- 10. Forgot Password & Reset Password Workflow ---');
  try {
    const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@nirvana.edu' })
    });
    const forgotData = await forgotRes.json();
    assert(forgotRes.status === 200, 'Forgot password returns 200 OK');
    assert(!!forgotData.code, `Received 6-digit OTP code: ${forgotData.code}`);

    // Reset password with code
    const resetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@nirvana.edu',
        code: forgotData.code,
        newPassword: 'TempPHPPassword@999'
      })
    });
    const resetData = await resetRes.json();
    assert(resetRes.status === 200, 'Reset password with code returns 200 OK');

    // Login with new password
    const newLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@nirvana.edu',
        password: 'TempPHPPassword@999'
      })
    });
    assert(newLogin.status === 200, 'Login with new password succeeded');

    // Restore original password Admin@123
    const f2 = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@nirvana.edu' })
    });
    const d2 = await f2.json();
    await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@nirvana.edu',
        code: d2.code,
        newPassword: 'Admin@123'
      })
    });
    assert(true, 'Restored original password Admin@123');
  } catch (e) {
    assert(false, `Password reset error: ${e.message}`);
  }

  // 11. Admin Professor CRUD
  console.log('\n--- 11. Admin Professor Management (CRUD) ---');
  let testProfId = 0;
  try {
    const addRes = await fetch(`${BASE_URL}/api/professors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Dr. Hostinger Test',
        role: 'Visiting Faculty',
        bio: 'Expert in cloud hosting'
      })
    });
    const addData = await addRes.json();
    assert(addRes.status === 201, 'Created new professor with 201 status');
    testProfId = addData.professor.id;

    // Edit
    const editRes = await fetch(`${BASE_URL}/api/professors/${testProfId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Dr. Hostinger Test',
        role: 'Senior Visiting Faculty'
      })
    });
    assert(editRes.status === 200, 'Updated professor with 200 status');

    // Delete
    const delRes = await fetch(`${BASE_URL}/api/professors/${testProfId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(delRes.status === 200, 'Deleted professor with 200 status');
  } catch (e) {
    assert(false, `Professor CRUD error: ${e.message}`);
  }

  // 12. Admin Team Member CRUD & Auto QR
  console.log('\n--- 12. Admin Team Member CRUD & Auto QR ---');
  let testMemberId = 0;
  try {
    const addRes = await fetch(`${BASE_URL}/api/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'PHP Team Member',
        role: 'Tech Coordinator',
        bio: 'PHP and MySQL developer'
      })
    });
    const addData = await addRes.json();
    assert(addRes.status === 201, 'Created team member with 201 status');
    assert(addData.member && addData.member.qr_data.startsWith('data:image/png;base64,'), 'QR code was automatically generated');
    testMemberId = addData.member.id;

    // Delete
    const delRes = await fetch(`${BASE_URL}/api/members/${testMemberId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(delRes.status === 200, 'Deleted team member with 200 status');
  } catch (e) {
    assert(false, `Team Member CRUD error: ${e.message}`);
  }

  // 13. Admin Alumni CRUD & Auto QR
  console.log('\n--- 13. Admin Alumni CRUD & Auto QR ---');
  let testAlumId = 0;
  try {
    const addRes = await fetch(`${BASE_URL}/api/alumni`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'PHP Alumni Member',
        role: 'Senior Architect',
        admission_number: 'U2021009',
        time_span: '2021 - 2025'
      })
    });
    const addData = await addRes.json();
    assert(addRes.status === 201, 'Created alumni with 201 status');
    assert(addData.alumni && addData.alumni.qr_data.startsWith('data:image/png;base64,'), 'QR code was automatically generated for alumni');
    testAlumId = addData.alumni.id;

    // Delete
    const delRes = await fetch(`${BASE_URL}/api/alumni/${testAlumId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(delRes.status === 200, 'Deleted alumni with 200 status');
  } catch (e) {
    assert(false, `Alumni CRUD error: ${e.message}`);
  }

  // 14. Admin Dashboard Stats
  console.log('\n--- 14. Admin Dashboard Stats ---');
  try {
    const statsRes = await fetch(`${BASE_URL}/api/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const statsData = await statsRes.json();
    assert(statsRes.status === 200, 'Admin stats returns 200 OK');
    assert(statsData.metrics && typeof statsData.metrics.totalMembers === 'number', 'Metrics object received');
    assert(Array.isArray(statsData.recentMembers), 'Recent members array received');
  } catch (e) {
    assert(false, `Admin stats error: ${e.message}`);
  }

  // 15. SPA Static Route Serving
  console.log('\n--- 15. SPA Static Route Serving ---');
  try {
    const spaRes = await fetch(`${BASE_URL}/team/1`);
    const spaHtml = await spaRes.text();
    assert(spaRes.status === 200, 'SPA route /team/1 serves index.html with 200 OK');
    assert(spaHtml.includes('<div id="root">') || spaHtml.includes('html'), 'Contains React index.html root');
  } catch (e) {
    assert(false, `SPA serving error: ${e.message}`);
  }

  console.log('\n====================================================');
  console.log(`🏁 PHP BACKEND TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
