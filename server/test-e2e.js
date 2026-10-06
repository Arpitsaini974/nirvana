const http = require('http');

const BASE_URL = 'http://localhost:5000';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  
  const status = response.status;
  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }
  return { status, data, ok: response.ok };
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 STARTING COMPREHENSIVE END-TO-END TEST SUITE');
  console.log('====================================================\n');

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

  // 1. Health check & Homepage served
  console.log('\n--- 1. Server Health & Static Client Delivery ---');
  const health = await request('/api/health');
  assert(health.status === 200 && health.data.status === 'ok', 'API health check responded 200 OK');

  const rootPage = await request('/');
  assert(rootPage.status === 200 && typeof rootPage.data === 'string' && rootPage.data.includes('<div id="root">'), 'Client SPA index.html served at root "/"');

  // 2. Public Settings
  console.log('\n--- 2. Public Club Settings ---');
  const settings = await request('/api/settings');
  assert(settings.status === 200 && settings.data.club_name.length > 0, 'Public settings retrieved with club name');
  assert(Array.isArray(settings.data.objectives), 'Objectives returned as an array');

  // 3. Public Team & Verification
  console.log('\n--- 3. Public Team & Verification ---');
  const members = await request('/api/members');
  assert(members.status === 200 && Array.isArray(members.data) && members.data.length > 0, `Active members list fetched (${members.data.length} members)`);

  const activeMember = members.data[0];
  console.log(`Testing verification for Member ID: ${activeMember.member_id}`);
  const verifyRes = await request(`/api/members/${activeMember.member_id}`);
  assert(verifyRes.status === 200 && verifyRes.data.exists === true, 'Member verification returned exists: true');
  assert(verifyRes.data.is_active === true, 'Member correctly reported as active');
  assert(verifyRes.data.member.qr_data && verifyRes.data.member.qr_data.startsWith('data:image/png;base64,'), 'Member QR code data URL is valid base64 PNG');

  // Test Inactive Member verification
  const inactiveMemberId = 'ARC-2024-006'; // Seeded as inactive
  const inactiveRes = await request(`/api/members/${inactiveMemberId}`);
  assert(inactiveRes.status === 200 && inactiveRes.data.is_active === false, 'Inactive member verification returns is_active: false');

  // Test Non-existent Member verification (should be 404 friendly, no raw errors)
  const notFoundRes = await request('/api/members/NON-EXISTENT-999');
  assert(notFoundRes.status === 404 && notFoundRes.data.exists === false, 'Non-existent member ID returns 404 with friendly exists: false');

  // 4. Public Alumni & Certificates
  console.log('\n--- 4. Public Alumni & Certificates ---');
  const alumni = await request('/api/alumni');
  assert(alumni.status === 200 && alumni.data.length > 0, `Alumni list fetched (${alumni.data.length} alumni)`);

  const batches = await request('/api/alumni/batches');
  assert(batches.status === 200 && Array.isArray(batches.data), 'Alumni batches list fetched');

  const certificates = await request('/api/certificates');
  assert(certificates.status === 200 && certificates.data.length > 0, `Certificates list fetched (${certificates.data.length} certificates)`);

  const events = await request('/api/events');
  assert(events.status === 200 && events.data.length > 0, `Events list fetched (${events.data.length} events)`);

  const featuredEvents = await request('/api/events/featured');
  assert(featuredEvents.status === 200 && featuredEvents.data.length > 0, 'Featured events fetched for homepage');

  // 5. Contact Form Message Submission
  console.log('\n--- 5. Public Contact Message Submission ---');
  const contactMsg = await request('/api/messages', {
    method: 'POST',
    body: {
      name: 'Verification Bot',
      email: 'test@verification.org',
      subject: 'Inquiry Verification Test',
      message: 'This is an automated E2E test message verifying the contact submission system.'
    }
  });
  assert(contactMsg.status === 201, 'Contact message submitted successfully');

  // 6. Security & Unauthorized Admin Access
  console.log('\n--- 6. Security & Authorization Checks ---');
  const unauthorizedStats = await request('/api/stats');
  assert(unauthorizedStats.status === 401, 'Unauthenticated access to /api/stats rejected with 401 Unauthorized');

  const invalidTokenStats = await request('/api/stats', {
    headers: { Authorization: 'Bearer fake-invalid-jwt-token' }
  });
  assert(invalidTokenStats.status === 403, 'Invalid token to /api/stats rejected with 403 Forbidden');

  // 7. Admin Authentication
  console.log('\n--- 7. Admin Authentication Flow ---');
  const badLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin@club.org', password: 'wrongpassword' }
  });
  assert(badLogin.status === 401, 'Bad credentials correctly rejected with 401');

  const goodLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin@club.org', password: 'admin123' }
  });
  assert(goodLogin.status === 200 && goodLogin.data.token, 'Admin login succeeded and returned JWT token');
  const token = goodLogin.data.token;
  const adminHeaders = { Authorization: `Bearer ${token}` };

  const authMe = await request('/api/auth/me', { headers: adminHeaders });
  assert(authMe.status === 200 && authMe.data.admin.email === 'admin@club.org', 'Admin session verified via /api/auth/me');

  // 8. Admin Dashboard Stats
  console.log('\n--- 8. Admin Dashboard Stats ---');
  const stats = await request('/api/stats', { headers: adminHeaders });
  assert(stats.status === 200 && stats.data.metrics.totalMembers >= 6, 'Dashboard stats retrieved with full metrics');

  // 9. COMPLETE FLOW: ADMIN CREATES MEMBER -> QR GENERATED -> VERIFY -> UPDATE -> SAME QR VERIFIES UPDATED INFO
  console.log('\n--- 9. Complete Member Lifecycle & QR Verification Flow ---');
  const testMemberId = `TEST-E2E-${Date.now().toString().slice(-4)}`;
  const createMemberRes = await request('/api/members', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      member_id: testMemberId,
      name: 'Dr. Jane Robotics',
      role: 'Autonomous AI Fellow',
      department: 'Robotics & AI',
      joining_date: '2026-01-15',
      bio: 'Leading test simulations and neural motion planning.',
      skills: ['Neural SLAM', 'ROS2', 'Reinforcement Learning'],
      achievements: ['Best Paper Award 2026'],
      status: 'active',
      is_featured: false
    }
  });

  assert(createMemberRes.status === 201, `Admin created member "${testMemberId}"`);
  const createdMember = createMemberRes.data.member;
  assert(createdMember.qr_data && createdMember.qr_data.startsWith('data:image/png;base64,'), 'QR code automatically generated for new member');

  // Verify public member verification page for new member
  const verifyNew = await request(`/api/members/${testMemberId}`);
  assert(verifyNew.status === 200 && verifyNew.data.member.name === 'Dr. Jane Robotics', 'New member immediately verified via public URL /member/:memberId');
  assert(verifyNew.data.is_active === true, 'New member has verified active status');

  // Admin updates member details (promotion)
  console.log('Updating member details (promotion to Chief Scientist)...');
  const updateRes = await request(`/api/members/${createdMember.id}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: {
      name: 'Dr. Jane Robotics',
      role: 'Chief AI Scientist & Director', // Updated role
      department: 'Robotics & AI',
      bio: 'Promoted to lead all laboratory research initiatives.',
      status: 'active'
    }
  });
  assert(updateRes.status === 200, 'Member details updated by admin');

  // Verify that the SAME member ID / QR URL now returns the updated role!
  const verifyUpdated = await request(`/api/members/${testMemberId}`);
  assert(verifyUpdated.status === 200 && verifyUpdated.data.member.role === 'Chief AI Scientist & Director', 'Same QR verification URL successfully reflects updated member details!');

  // Toggle member status to inactive
  console.log('Toggling member status to inactive...');
  const toggleRes = await request(`/api/members/${createdMember.id}/toggle-status`, {
    method: 'PATCH',
    headers: adminHeaders
  });
  assert(toggleRes.status === 200 && toggleRes.data.status === 'inactive', 'Member status toggled to inactive');

  const verifyInactive = await request(`/api/members/${testMemberId}`);
  assert(verifyInactive.status === 200 && verifyInactive.data.is_active === false, 'Public verification immediately reflects deactivated status');

  // Clean up test member
  const deleteMemberRes = await request(`/api/members/${createdMember.id}`, {
    method: 'DELETE',
    headers: adminHeaders
  });
  assert(deleteMemberRes.status === 200, 'Test member deleted successfully');

  // 10. COMPLETE FLOW: ADMIN CREATES ALUMNI -> ASSIGNS CERTIFICATE -> VERIFIES LINKING
  console.log('\n--- 10. Complete Alumni & Certificate Issuance Flow ---');
  const createAlumniRes = await request('/api/alumni', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      name: 'Vikram Sethi',
      batch: 'Class of 2025',
      previous_role: 'Telemetry Software Lead',
      department: 'Software Engineering',
      current_company: 'Waymo',
      current_role: 'Autonomous Fleet Engineer',
      bio: 'Pioneered vehicle communication protocols.',
      achievements: ['Autonomous Vehicle Innovation Trophy'],
      status: 'active'
    }
  });
  assert(createAlumniRes.status === 201, 'Admin created alumni profile');
  const createdAlum = createAlumniRes.data.alumni;

  // Issue Certificate assigned to this alumni
  const testCertId = `CERT-E2E-${Date.now().toString().slice(-4)}`;
  const createCertRes = await request('/api/certificates', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      title: 'Distinguished Autonomous Telemetry Award',
      recipient_name: createdAlum.name,
      recipient_type: 'alumni',
      alumni_id: createdAlum.id,
      certificate_type: 'Excellence',
      issue_date: '2025-12-01',
      description: 'Conferred for high-throughput sensor telemetry architectures.',
      file_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80',
      verification_id: testCertId,
      is_public: 1
    }
  });
  assert(createCertRes.status === 201, `Certificate "${testCertId}" issued and linked to alumni`);
  const createdCert = createCertRes.data.certificate;

  // Verify alumni profile endpoint returns the certificate!
  const alumProfileRes = await request(`/api/alumni/${createdAlum.id}`);
  assert(alumProfileRes.status === 200 && alumProfileRes.data.certificates.some(c => c.verification_id === testCertId), 'Certificate appears on alumni profile certificates list!');

  // Verify public certificates search
  const certSearchRes = await request(`/api/certificates?search=${encodeURIComponent(testCertId)}`);
  assert(certSearchRes.status === 200 && certSearchRes.data.length === 1, 'Certificate found in public search by verification ID');

  // Clean up test certificate & alumni
  await request(`/api/certificates/${createdCert.id}`, { method: 'DELETE', headers: adminHeaders });
  await request(`/api/alumni/${createdAlum.id}`, { method: 'DELETE', headers: adminHeaders });
  console.log('✓ Cleaned up test certificate and alumni');

  // 11. Club Information Live Update
  console.log('\n--- 11. Club Information Update Verification ---');
  const originalName = settings.data.club_name;
  const updateSettingsRes = await request('/api/settings', {
    method: 'PUT',
    headers: adminHeaders,
    body: {
      ...settings.data,
      tagline: 'Updated Tagline: Engineering the Autonomous Future'
    }
  });
  assert(updateSettingsRes.status === 200, 'Settings updated by admin');

  const verifySettings = await request('/api/settings');
  assert(verifySettings.data.tagline.includes('Engineering the Autonomous Future'), 'Updated tagline immediately live on public API');

  // Revert tagline
  await request('/api/settings', {
    method: 'PUT',
    headers: adminHeaders,
    body: {
      ...settings.data,
      tagline: settings.data.tagline
    }
  });

  // 12. Complete Event Flow & Discovery
  console.log('\n--- 12. Complete Event Lifecycle, Statistics & Filtering Flow ---');
  
  // Test Event Statistics
  const eventStats = await request('/api/events/stats');
  assert(eventStats.status === 200, 'GET /api/events/stats responded 200 OK');
  assert(typeof eventStats.data.total === 'number' && eventStats.data.total >= 4, `Event stats returned total count: ${eventStats.data.total}`);
  assert(typeof eventStats.data.upcoming === 'number', `Upcoming count: ${eventStats.data.upcoming}`);
  assert(typeof eventStats.data.live === 'number', `Live count: ${eventStats.data.live}`);
  assert(typeof eventStats.data.past === 'number', `Past count: ${eventStats.data.past}`);
  assert(Array.isArray(eventStats.data.categories) && eventStats.data.categories.length > 0, 'Categories list returned');
  assert(Array.isArray(eventStats.data.deliveryModes) && eventStats.data.deliveryModes.length > 0, 'Delivery modes list returned');

  // Test Event Details Page API
  const singleEvent = await request('/api/events/1');
  assert(singleEvent.status === 200 && singleEvent.data.id === 1, 'GET /api/events/:id returned valid event details');
  assert(singleEvent.data.title && singleEvent.data.title.length > 0, `Event title: "${singleEvent.data.title}"`);
  assert(singleEvent.data.delivery_mode, `Delivery mode: ${singleEvent.data.delivery_mode}`);

  // Test SPA route for event details
  const spaEventRoute = await request('/events/1');
  assert(spaEventRoute.status === 200 && typeof spaEventRoute.data === 'string' && spaEventRoute.data.includes('<div id="root">'), 'SPA index.html served for client route "/events/1"');

  // Admin creates rich event with category, type, mode, and speakers
  const createEventRes = await request('/api/events', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      title: 'Robotics Open House & Live Demonstrations',
      date: '2026-12-15',
      time: '11:00 AM - 04:00 PM',
      location: 'Central Lawn & Atrium',
      category: 'Robotics & Hardware',
      event_type: 'Symposium',
      delivery_mode: 'Hybrid',
      speakers: 'Dr. Sarah Connor (Robotics Institute), Elena Rostova',
      short_description: 'An open campus demonstration of all competition rovers and manipulation arms.',
      description: 'Public showcase featuring robot obstacle clearance, live neural SLAM mapping, and interactive Q&A sessions with club leads.',
      organizer: 'Club Public Relations & Outreach',
      registration_link: 'https://forms.google.com/test-e2e',
      status: 'upcoming'
    }
  });
  assert(createEventRes.status === 201, 'Admin created new club event with complete metadata');
  const createdEvent = createEventRes.data.event;
  assert(createdEvent.category === 'Robotics & Hardware', 'Event category persisted correctly');
  assert(createdEvent.delivery_mode === 'Hybrid', 'Event delivery mode persisted correctly');
  assert(createdEvent.speakers.includes('Sarah Connor'), 'Speakers persisted correctly');

  // Check event appears in public search
  const eventSearchRes = await request(`/api/events?search=${encodeURIComponent('Sarah Connor')}`);
  assert(eventSearchRes.status === 200 && eventSearchRes.data.some(e => e.id === createdEvent.id), 'Event searchable by speaker name');

  // Filter by category
  const catFilterRes = await request(`/api/events?category=${encodeURIComponent('Robotics & Hardware')}`);
  assert(catFilterRes.status === 200 && catFilterRes.data.some(e => e.id === createdEvent.id), 'Category filter works correctly');

  // Filter by delivery mode
  const modeFilterRes = await request(`/api/events?delivery_mode=Hybrid`);
  assert(modeFilterRes.status === 200 && modeFilterRes.data.some(e => e.id === createdEvent.id), 'Delivery mode filter works correctly');

  // Admin updates event to "live" status
  const updateEventRes = await request(`/api/events/${createdEvent.id}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: {
      ...createdEvent,
      status: 'live',
      location: 'Main University Amphitheater'
    }
  });
  assert(updateEventRes.status === 200, 'Event updated to "live" status by admin');

  // Verify updated status on public API
  const verifyEvent = await request(`/api/events/${createdEvent.id}`);
  assert(verifyEvent.status === 200 && verifyEvent.data.status === 'live', 'Public API verifies event is now "live"');

  // Delete event
  const deleteEventRes = await request(`/api/events/${createdEvent.id}`, {
    method: 'DELETE',
    headers: adminHeaders
  });
  assert(deleteEventRes.status === 200, 'Test event deleted successfully by admin');

  console.log('\n====================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Start testing
runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
