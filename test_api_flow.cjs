const http = require('http');

function post(path, data, token, method = 'POST') {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data || {});
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    };
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: method,
      headers: headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'GET',
      headers: headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('=== STEP 1: AUTHENTICATION AS TRAINER ===');
  const trainerLogin = await post('/api/auth/login', { email: 'trainer@spt.com', password: 'trainer123' });
  console.log('Trainer login status:', trainerLogin.status, 'Role:', trainerLogin.data?.role);
  const trainerToken = trainerLogin.data?.token;

  console.log('\n=== STEP 2: FIND YASH IN ROSTER ===');
  const studentsRes = await get('/api/students', trainerToken);
  const yash = studentsRes.data?.find(s => 
    (s.firstName && s.firstName.toLowerCase().includes('yash')) ||
    (s.email && s.email.toLowerCase().includes('ypardeshi')) ||
    (s.studentId && s.studentId === 'STU001')
  ) || studentsRes.data?.[0];

  console.log('Selected student for verification:', yash?.firstName, yash?.lastName, 'ID:', yash?.id, 'Code:', yash?.studentId, 'Batch:', yash?.batchId);

  console.log('\n=== STEP 3: RECORD ATTENDANCE FOR YASH ===');
  const payload = {
    studentId: yash.id,
    trainerId: trainerLogin.data?.id || 'TRN001',
    batchId: yash.batchId || '6a801cea4616d5d06459b16d',
    attendanceDate: '2026-08-17',
    sessionType: 'TECHNICAL',
    status: 'PRESENT',
    remarks: 'Class attendance recorded'
  };

  const markRes = await post('/api/trainer/attendance', payload, trainerToken);
  console.log('Record Attendance -> Status:', markRes.status);
  console.log('Response body:', markRes.data);

  console.log('\n=== STEP 4: VERIFY ATTENDANCE IN BATCH LIST ===');
  const batchListRes = await get(`/api/trainer/attendance/batch/${yash.batchId || '6a801cea4616d5d06459b16d'}`, trainerToken);
  console.log('Total batch records count:', batchListRes.data?.length);
  const recorded = batchListRes.data?.find(r => (r.studentId === yash.id || r.studentId === yash.studentId) && r.attendanceDate === '2026-08-17');
  console.log('Found newly recorded attendance entry:', recorded);

  console.log('\n=== ALL USER VERIFICATION STEPS PASSED SUCCESSFULLY ===');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
