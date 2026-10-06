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
  console.log('🚀 TESTING NIRVANA CLUB SPECIFIC REQUIREMENTS');
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

  // 1. Home Page & Static Client
  console.log('--- 1. NIRVANA Home Page & Client SPA ---');
  const homeRes = await request('/');
  assert(homeRes.status === 200 && typeof homeRes.data === 'string' && homeRes.data.includes('<div id="root">'), 'Client SPA index.html served at root "/"');

  const settingsRes = await request('/api/settings');
  assert(settingsRes.status === 200 && settingsRes.data.club_name === 'NIRVANA', 'Club name is set to "NIRVANA" in settings');

  // 2. Professors / Faculty Section
  console.log('\n--- 2. Professors & Faculty Advisory ---');
  const profsRes = await request('/api/professors');
  assert(profsRes.status === 200 && Array.isArray(profsRes.data) && profsRes.data.length > 0, `Professors list retrieved (${profsRes.data.length} professors)`);
  const profSample = profsRes.data[0];
  assert(profSample.name && profSample.role && profSample.bio !== undefined, `Professor has name ("${profSample.name}"), role ("${profSample.role}"), and bio`);

  // 3. Team Members & Unique QR Codes
  console.log('\n--- 3. Team Members & QR Code ID-Card Data ---');
  const teamRes = await request('/api/members');
  assert(teamRes.status === 200 && Array.isArray(teamRes.data) && teamRes.data.length > 0, `Active team members retrieved (${teamRes.data.length} members)`);
  const teamSample = teamRes.data[0];
  assert(teamSample.name && teamSample.role, `Team member has name ("${teamSample.name}") and role ("${teamSample.role}")`);
  assert(teamSample.qr_data && teamSample.qr_data.startsWith('data:image/png;base64,'), 'Team member card has unique valid Base64 PNG QR code');

  // 4. Team Member Public Profile (from QR code scan)
  console.log('\n--- 4. Team Member Public Profile (QR target) ---');
  const teamProfileRes = await request(`/api/members/${teamSample.id}`);
  assert(teamProfileRes.status === 200 && teamProfileRes.data.exists === true, `Team member profile accessible at /team/${teamSample.id}`);
  assert(teamProfileRes.data.member.name === teamSample.name, 'Profile data matches member record');

  // 5. Alumni Members & Unique QR Codes
  console.log('\n--- 5. Alumni Members & QR Code ID-Card Data ---');
  const alumniRes = await request('/api/alumni');
  assert(alumniRes.status === 200 && Array.isArray(alumniRes.data) && alumniRes.data.length > 0, `Alumni members retrieved (${alumniRes.data.length} alumni)`);
  const alumniSample = alumniRes.data[0];
  assert(alumniSample.name && alumniSample.role !== undefined, `Alumni has name ("${alumniSample.name}") and role`);
  assert(alumniSample.qr_data && alumniSample.qr_data.startsWith('data:image/png;base64,'), 'Alumni card has unique valid Base64 PNG QR code');

  // 6. Alumni Public Profile (from QR code scan)
  console.log('\n--- 6. Alumni Public Profile (QR target) ---');
  const alumniProfileRes = await request(`/api/alumni/${alumniSample.id}`);
  assert(alumniProfileRes.status === 200 && alumniProfileRes.data.alumni, `Alumni profile accessible at /alumni/${alumniSample.id}`);
  assert(alumniProfileRes.data.alumni.name === alumniSample.name, 'Profile data matches alumni record');

  // 7. Admin Authentication
  console.log('\n--- 7. Admin Authentication ---');
  const loginRes = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin@club.org', password: 'admin123' }
  });
  assert(loginRes.status === 200 && loginRes.data.token, 'Admin login succeeded and returned JWT');
  const adminHeaders = { Authorization: `Bearer ${loginRes.data.token}` };

  // 8. Admin Professor Management (Add, Edit, Remove)
  console.log('\n--- 8. Admin Professor Management (CRUD) ---');
  const addProfRes = await request('/api/professors', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      name: 'Dr. Vikramaditya Joshi',
      role: 'Visiting Research Professor',
      bio: 'Advising NIRVANA student cohorts in advanced mathematics and algorithms.',
      photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
    }
  });
  assert(addProfRes.status === 201, 'Admin added new professor');
  const createdProf = addProfRes.data.professor;

  const updateProfRes = await request(`/api/professors/${createdProf.id}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: {
      ...createdProf,
      role: 'Distinguished Faculty Fellow'
    }
  });
  assert(updateProfRes.status === 200 && updateProfRes.data.professor.role === 'Distinguished Faculty Fellow', 'Admin edited professor role');

  const deleteProfRes = await request(`/api/professors/${createdProf.id}`, {
    method: 'DELETE',
    headers: adminHeaders
  });
  assert(deleteProfRes.status === 200, 'Admin removed professor successfully');

  // 9. Admin Team Member Management (Add, Edit, Remove with auto QR)
  console.log('\n--- 9. Admin Team Member Management (CRUD + auto QR) ---');
  const addMemberRes = await request('/api/members', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      name: 'Tanvi Saxena',
      role: 'Scholastic Coordinator',
      bio: 'Leading student discussion groups and technical reading circles in NIRVANA.',
      photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80'
    }
  });
  assert(addMemberRes.status === 201, 'Admin added new team member');
  const createdMember = addMemberRes.data.member;
  assert(createdMember.qr_data && createdMember.qr_data.startsWith('data:image/png;base64,'), 'QR code automatically generated for new member');

  const updateMemberRes = await request(`/api/members/${createdMember.id}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: {
      ...createdMember,
      role: 'Senior Academic Coordinator'
    }
  });
  assert(updateMemberRes.status === 200 && updateMemberRes.data.member.role === 'Senior Academic Coordinator', 'Admin edited team member role');

  const deleteMemberRes = await request(`/api/members/${createdMember.id}`, {
    method: 'DELETE',
    headers: adminHeaders
  });
  assert(deleteMemberRes.status === 200, 'Admin removed team member successfully');

  // 10. Admin Alumni Management (Add, Edit, Remove with auto QR)
  console.log('\n--- 10. Admin Alumni Management (CRUD + auto QR) ---');
  const addAlumRes = await request('/api/alumni', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      name: 'Karan Mehra',
      role: 'Alumni Researcher',
      bio: 'Co-founded NIRVANA student symposium initiative during undergraduate tenure.',
      photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80'
    }
  });
  assert(addAlumRes.status === 201, 'Admin added new alumni');
  const createdAlum = addAlumRes.data.alumni;
  assert(createdAlum.qr_data && createdAlum.qr_data.startsWith('data:image/png;base64,'), 'QR code automatically generated for new alumni');

  const updateAlumRes = await request(`/api/alumni/${createdAlum.id}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: {
      ...createdAlum,
      role: 'Senior Alumni Fellow'
    }
  });
  assert(updateAlumRes.status === 200 && updateAlumRes.data.alumni.role === 'Senior Alumni Fellow', 'Admin edited alumni role');

  const deleteAlumRes = await request(`/api/alumni/${createdAlum.id}`, {
    method: 'DELETE',
    headers: adminHeaders
  });
  assert(deleteAlumRes.status === 200, 'Admin removed alumni successfully');

  // 11. SPA Routing for Public Profiles
  console.log('\n--- 11. SPA Route Delivery ---');
  const teamSpa = await request('/team/1');
  assert(teamSpa.status === 200 && typeof teamSpa.data === 'string' && teamSpa.data.includes('<div id="root">'), 'SPA route /team/1 serves index.html');

  const alumniSpa = await request('/alumni/1');
  assert(alumniSpa.status === 200 && typeof alumniSpa.data === 'string' && alumniSpa.data.includes('<div id="root">'), 'SPA route /alumni/1 serves index.html');

  console.log('\n====================================================');
  console.log(`🏁 NIRVANA TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
