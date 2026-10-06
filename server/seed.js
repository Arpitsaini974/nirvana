const db = require('./db');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');

async function seed() {
  console.log('--- Starting Database Seeding ---');

  // 1. Seed Admin
  const adminEmail = 'admin@club.org';
  const existingAdmin = db.prepare('SELECT id FROM admins WHERE email = ?').get(adminEmail);
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    db.prepare(`
      INSERT INTO admins (name, email, password_hash)
      VALUES (?, ?, ?)
    `).run('Club Administrator', adminEmail, passwordHash);
    console.log('✓ Admin account created: admin@club.org / admin123');
  } else {
    console.log('Admin account already exists.');
  }

  // 2. Seed Club Settings
  const existingSettings = db.prepare('SELECT id FROM club_settings WHERE id = 1').get();
  const objectives = JSON.stringify([
    'Promote hands-on engineering, robotics, and creative problem-solving.',
    'Participate in national and international technical symposiums and competitions.',
    'Mentor junior members through structured workshops, bootcamps, and hackathons.',
    'Build industry-standard open source systems and autonomous robots.',
    'Foster an active, supportive alumni network across global technology leaders.'
  ]);

  const socialLinks = JSON.stringify({
    linkedin: 'https://linkedin.com/company/apex-robotics-club',
    github: 'https://github.com/apex-robotics',
    twitter: 'https://twitter.com/ApexRobotics',
    instagram: 'https://instagram.com/apex_robotics',
    youtube: 'https://youtube.com/@ApexRobotics'
  });

  const clubSettingsData = {
    club_name: 'Apex Robotics & Innovation Club',
    tagline: 'Pioneering Automation, Applied AI & Engineering Excellence',
    logo_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80',
    favicon_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=64&q=80',
    banner_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1600&q=80',
    about: 'Founded with a passion for futuristic hardware and software systems, Apex Robotics & Innovation Club is an elite student-run technical society. We bring together passionate engineers, designers, and innovators to push the frontiers of autonomous robotics, artificial intelligence, IoT, and embedded computing.',
    history: 'Established in 2018 by five enthusiastic undergraduate students, the club has grown from a humble lab corner into a nationally recognized innovation hub with over 150+ active members and prestigious international awards.',
    mission: 'To empower students through practical engineering challenges, rigorous peer mentorship, and interdisciplinary collaboration to tackle real-world societal problems.',
    vision: 'To emerge as a premier collegiate research and innovation body, bridging academic excellence with cutting-edge industry technology.',
    objectives: objectives,
    email: 'contact@apexclub.org',
    phone: '+1 (555) 234-5678',
    address: 'Technology Innovation Center, Block 4, University Campus, Innovation Way',
    social_links: socialLinks
  };

  if (!existingSettings) {
    db.prepare(`
      INSERT INTO club_settings (
        id, club_name, tagline, logo_url, favicon_url, banner_url,
        about, history, mission, vision, objectives, email, phone, address, social_links
      ) VALUES (1, @club_name, @tagline, @logo_url, @favicon_url, @banner_url, @about, @history, @mission, @vision, @objectives, @email, @phone, @address, @social_links)
    `).run(clubSettingsData);
    console.log('✓ Club settings initialized.');
  }

  // Helper to generate QR
  const generateQR = async (memberId) => {
    // Permanent verification URL path
    const url = `/member/${memberId}`;
    return await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
  };

  // 3. Seed Team Members
  const memberCount = db.prepare('SELECT count(*) as count FROM team_members').get().count;
  if (memberCount === 0) {
    const initialMembers = [
      {
        member_id: 'ARC-2025-001',
        name: 'Aarav Sharma',
        role: 'Club President',
        department: 'Core Executive',
        joining_date: '2023-08-10',
        photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: 'Senior Undergraduate passionate about autonomous navigation, ROS2, and team leadership. Guided 4 competition teams to national podiums.',
        skills: JSON.stringify(['ROS2', 'Python', 'C++', 'SLAM', 'Leadership', 'Strategic Planning']),
        achievements: JSON.stringify(['National Robocon 2024 Team Captain', 'Best Innovation Award IEEE 2023', 'Published Research Paper on LiDAR Odometry']),
        status: 'active',
        is_featured: 1,
        display_order: 1
      },
      {
        member_id: 'ARC-2025-002',
        name: 'Elena Rostova',
        role: 'Vice President & Technical Lead',
        department: 'Autonomous Systems',
        joining_date: '2023-09-01',
        photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
        bio: 'Specialist in Computer Vision and Deep Learning for robotics manipulation. Leading our vision sensor fusion architecture.',
        skills: JSON.stringify(['PyTorch', 'Computer Vision', 'CUDA', 'OpenCV', 'Embedded Linux']),
        achievements: JSON.stringify(['1st Place in Vision Track at HackAI 2024', 'Author of open-source YOLO-depth pipeline']),
        status: 'active',
        is_featured: 1,
        display_order: 2
      },
      {
        member_id: 'ARC-2025-003',
        name: 'David Chen',
        role: 'Head of Mechanical & CAD',
        department: 'Hardware Design',
        joining_date: '2023-11-15',
        photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        bio: 'Mechanical engineering enthusiast who loves rapid prototyping, CNC machining, generative design, and high-torque drone chassis.',
        skills: JSON.stringify(['SolidWorks', 'Fusion 360', 'FEA Simulation', 'Rapid 3D Prototyping', 'Aerodynamics']),
        achievements: JSON.stringify(['Lightweight Carbon-Fiber Chassis patent pending', 'University Maker of the Year 2024']),
        status: 'active',
        is_featured: 1,
        display_order: 3
      },
      {
        member_id: 'ARC-2026-004',
        name: 'Sophia Martinez',
        role: 'Firmware & Electronics Lead',
        department: 'Embedded Systems',
        joining_date: '2024-01-20',
        photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        bio: 'Hardware engineer with focus on custom STM32 and ESP32 multi-layer PCB design, CAN bus protocol, and power distribution units.',
        skills: JSON.stringify(['Altium Designer', 'KiCAD', 'Embedded C', 'CAN Bus', 'RTOS', 'Power Systems']),
        achievements: JSON.stringify(['Designed 4-layer motor driver PCB with 98% power efficiency', 'Embedded Systems Hackathon Winner']),
        status: 'active',
        is_featured: 1,
        display_order: 4
      },
      {
        member_id: 'ARC-2026-005',
        name: 'Kavita Rao',
        role: 'Software Architect & Web Lead',
        department: 'Software & Infrastructure',
        joining_date: '2024-02-10',
        photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        bio: 'Full-stack developer building real-time telemetry dashboards, robot telemetry web sockets, and member management portals.',
        skills: JSON.stringify(['React', 'TypeScript', 'Node.js', 'WebSockets', 'Docker', 'SQLite/Postgres']),
        achievements: JSON.stringify(['Engineered real-time rover telemetry suite used in field tests', 'Dean’s Honour Roll']),
        status: 'active',
        is_featured: 0,
        display_order: 5
      },
      {
        member_id: 'ARC-2024-006',
        name: 'Marcus Vance',
        role: 'Research Associate',
        department: 'Robotics & AI',
        joining_date: '2022-09-12',
        photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        bio: 'Former sensor team member currently on leave for industrial co-op internship at automotive research laboratory.',
        skills: JSON.stringify(['C++', 'MATLAB', 'State Estimation', 'Kalman Filters']),
        achievements: JSON.stringify(['Sensors Track Finalist 2023']),
        status: 'inactive', // useful to test deactivated member status
        is_featured: 0,
        display_order: 6
      }
    ];

    const insertMember = db.prepare(`
      INSERT INTO team_members (
        member_id, name, role, department, joining_date, photo_url,
        bio, skills, achievements, status, qr_data, is_featured, display_order
      ) VALUES (
        @member_id, @name, @role, @department, @joining_date, @photo_url,
        @bio, @skills, @achievements, @status, @qr_data, @is_featured, @display_order
      )
    `);

    for (const m of initialMembers) {
      m.qr_data = await generateQR(m.member_id);
      insertMember.run(m);
    }
    console.log(`✓ Seeded ${initialMembers.length} team members with verified QR codes.`);
  }

  // 4. Seed Alumni
  const alumniCount = db.prepare('SELECT count(*) as count FROM alumni').get().count;
  if (alumniCount === 0) {
    const initialAlumni = [
      {
        name: 'Priya Nambiar',
        batch: 'Class of 2022',
        previous_role: 'Founding President (2020-2022)',
        department: 'Robotics & Control',
        current_company: 'Boston Dynamics',
        current_role: 'Robotics Controls Engineer',
        photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        bio: 'Priya led the club through its crucial initial growth phases and spearheaded the first national competition rover team.',
        achievements: JSON.stringify(['Led club to Top 3 in University Mars Rover Challenge', 'Published 2 IEEE papers', 'Mentored 30+ students']),
        status: 'active',
        linkedin_url: 'https://linkedin.com',
        is_featured: 1
      },
      {
        name: 'James Thornton',
        batch: 'Class of 2023',
        previous_role: 'Head of Software & Simulation',
        department: 'Computer Science',
        current_company: 'Tesla Autopilot',
        current_role: 'Autonomous Systems Engineer',
        photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
        bio: 'Created the club’s open-source simulation testbed and established the annual summer robotics boot camp.',
        achievements: JSON.stringify(['Creator of ApexSim Gazebo environment', 'Best Capstone Project 2023']),
        status: 'active',
        linkedin_url: 'https://linkedin.com',
        is_featured: 1
      },
      {
        name: 'Ananya Deshmukh',
        batch: 'Class of 2023',
        previous_role: 'Lead Mechanical Designer',
        department: 'Mechanical Engineering',
        current_company: 'NASA Jet Propulsion Laboratory (JPL)',
        current_role: 'Aerospace Mechanisms Engineer',
        photo_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80',
        bio: 'Spearheaded our Mars Rover robotic arm design and planetary sample collection mechanism.',
        achievements: JSON.stringify(['University Gold Medalist', 'National Aeromodelling Champion']),
        status: 'active',
        linkedin_url: 'https://linkedin.com',
        is_featured: 1
      },
      {
        name: 'Rohan Gupta',
        batch: 'Class of 2024',
        previous_role: 'Head of AI & Machine Learning',
        department: 'Artificial Intelligence',
        current_company: 'Google DeepMind',
        current_role: 'Research Scientist',
        photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
        bio: 'Pioneered reinforcement learning pipelines for multi-legged quadrupeds within the club labs.',
        achievements: JSON.stringify(['NeurIPS 2023 Workshop Author', 'Outstanding Club Contribution Award 2024']),
        status: 'active',
        linkedin_url: 'https://linkedin.com',
        is_featured: 1
      }
    ];

    const insertAlumni = db.prepare(`
      INSERT INTO alumni (
        name, batch, previous_role, department, current_company, current_role,
        photo_url, bio, achievements, status, linkedin_url, is_featured
      ) VALUES (
        @name, @batch, @previous_role, @department, @current_company, @current_role,
        @photo_url, @bio, @achievements, @status, @linkedin_url, @is_featured
      )
    `);

    for (const a of initialAlumni) {
      insertAlumni.run(a);
    }
    console.log(`✓ Seeded ${initialAlumni.length} alumni profiles.`);
  }

  // 5. Seed Certificates
  const certCount = db.prepare('SELECT count(*) as count FROM certificates').get().count;
  if (certCount === 0) {
    const member1 = db.prepare('SELECT id FROM team_members WHERE member_id = ?').get('ARC-2025-001');
    const member2 = db.prepare('SELECT id FROM team_members WHERE member_id = ?').get('ARC-2025-002');
    const alumni1 = db.prepare('SELECT id FROM alumni WHERE name = ?').get('Priya Nambiar');

    const initialCerts = [
      {
        title: 'National Robotics Championship - First Place Honor',
        recipient_name: 'Apex Robotics Club Rover Team',
        recipient_type: 'club',
        team_member_id: null,
        alumni_id: null,
        certificate_type: 'Honor',
        issue_date: '2024-03-18',
        description: 'Awarded for extraordinary performance in autonomous navigation, obstacle clearance, and planetary drill simulation.',
        file_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80',
        verification_id: 'CERT-ARC-2024-001',
        is_public: 1
      },
      {
        title: 'Excellence in Technical Leadership',
        recipient_name: 'Aarav Sharma',
        recipient_type: 'team_member',
        team_member_id: member1 ? member1.id : null,
        alumni_id: null,
        certificate_type: 'Leadership',
        issue_date: '2024-05-10',
        description: 'In recognition of outstanding dedication, team guidance, and stewardship as Club President.',
        file_url: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=1000&q=80',
        verification_id: 'CERT-ARC-2024-8841',
        is_public: 1
      },
      {
        title: 'Computer Vision & Deep Learning Achievement Award',
        recipient_name: 'Elena Rostova',
        recipient_type: 'team_member',
        team_member_id: member2 ? member2.id : null,
        alumni_id: null,
        certificate_type: 'Achievement',
        issue_date: '2024-04-22',
        description: 'Conferred for architecting real-time stereo-vision obstacle avoidance algorithms.',
        file_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=1000&q=80',
        verification_id: 'CERT-ARC-2024-7712',
        is_public: 1
      },
      {
        title: 'Distinguished Club Alumni & Founder Commendation',
        recipient_name: 'Priya Nambiar',
        recipient_type: 'alumni',
        team_member_id: null,
        alumni_id: alumni1 ? alumni1.id : null,
        certificate_type: 'Excellence',
        issue_date: '2023-06-30',
        description: 'Honoring foundational leadership, culture building, and continued mentorship to the club.',
        file_url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=1000&q=80',
        verification_id: 'CERT-ARC-2023-5509',
        is_public: 1
      }
    ];

    const insertCert = db.prepare(`
      INSERT INTO certificates (
        title, recipient_name, recipient_type, team_member_id, alumni_id,
        certificate_type, issue_date, description, file_url, verification_id, is_public
      ) VALUES (
        @title, @recipient_name, @recipient_type, @team_member_id, @alumni_id,
        @certificate_type, @issue_date, @description, @file_url, @verification_id, @is_public
      )
    `);

    for (const c of initialCerts) {
      insertCert.run(c);
    }
    console.log(`✓ Seeded ${initialCerts.length} certificates.`);
  }

  // 6. Seed Events
  const eventsCount = db.prepare('SELECT count(*) as count FROM events').get().count;
  if (eventsCount === 0) {
    const initialEvents = [
      {
        title: 'Autonomous Systems Symposium & Poster Exhibition',
        date: '2026-11-12',
        location: 'Main Seminar Hall, Technology Block',
        organizer: 'Academic Events Committee & Faculty Advisors',
        status: 'upcoming',
        short_description: 'A full-day technical presentation session where student teams exhibit research findings in robotics perception and control.',
        description: 'A day-long interactive symposium bringing together students and researchers to present papers, posters, and live prototypes in LiDAR SLAM, state estimation, and reinforcement learning. A jury of senior faculty members evaluates presentations with prize distribution at the valedictory session.',
        image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
        registration_link: 'https://forms.google.com'
      },
      {
        title: 'Hands-on ROS2 & Gazebo Simulation Workshop',
        date: '2026-10-25',
        location: 'Robotics Computing Lab 402',
        organizer: 'Software & Simulation Sub-team',
        status: 'upcoming',
        short_description: 'An intensive weekend tutorial covering ROS2 nodes, pub-sub architectures, and URDF robot modeling in simulation.',
        description: 'This hands-on workshop walks participants through configuring ROS2 Humble, creating custom package architectures, writing C++ and Python nodes, and importing CAD models into Gazebo for real-time physics simulation.',
        image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
        registration_link: 'https://forms.google.com'
      },
      {
        title: 'Pan-Collegiate Hardware Hackathon (Hack-A-Bot)',
        date: '2025-11-18',
        location: 'Innovation Center Ground Floor',
        organizer: 'Apex Robotics Club Executive Board',
        status: 'past',
        short_description: 'A 36-hour non-stop engineering sprint challenging 24 teams to build obstacle-avoiding mobile robots using standardized kits.',
        description: 'Participants were provided with microcontrollers, motor drivers, sensor arrays, and raw acrylic sheets to fabricate functional autonomous rovers. Over 100 students from 12 institutes competed across 3 qualifying rounds.',
        image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
        registration_link: ''
      },
      {
        title: 'Guest Lecture: Advances in Planetary Rover Locomotion',
        date: '2025-09-08',
        location: 'Auditorium Hall B',
        organizer: 'Department Faculty Advisor & Club Outreach',
        status: 'past',
        short_description: 'An academic lecture analyzing rocker-bogie mechanisms and extraterrestrial terrain traversal.',
        description: 'A distinguished guest lecture analyzing the mechanical design considerations for Martian soil traversal, slip compensation algorithms, and autonomous path planning on steep inclines.',
        image_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
        registration_link: ''
      }
    ];

    const insertEvent = db.prepare(`
      INSERT INTO events (
        title, date, location, organizer, status,
        short_description, description, image_url, registration_link
      ) VALUES (
        @title, @date, @location, @organizer, @status,
        @short_description, @description, @image_url, @registration_link
      )
    `);

    for (const ev of initialEvents) {
      insertEvent.run(ev);
    }
    console.log(`✓ Seeded ${initialEvents.length} club events.`);
  }

  console.log('--- Database Seeding Completed Successfully ---');
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
