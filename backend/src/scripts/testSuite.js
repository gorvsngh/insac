const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5001';

// Helper for making HTTP requests with cookie handling
function makeRequest(method, endpoint, body = null, cookie = null, isFormData = false) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + endpoint);
    const headers = {};

    if (cookie) {
      headers['Cookie'] = cookie;
    }

    let payload = null;
    if (body) {
      if (typeof body === 'object') {
        payload = JSON.stringify(body);
        headers['Content-Type'] = 'application/json';
        headers['Content-Length'] = Buffer.byteLength(payload);
      } else {
        payload = body;
      }
    }

    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: headers,
    }, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        const setCookie = res.headers['set-cookie'];
        let json = null;
        try {
          json = JSON.parse(buffer.toString());
        } catch {
          // not json
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          setCookie: setCookie ? setCookie.map(c => c.split(';')[0]).join('; ') : null,
          body: json || buffer,
          raw: buffer,
        });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('\n========================================');
  console.log('   INSAC 2026 FULL-STACK TEST SUITE    ');
  console.log('========================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName} ${details ? '— ' + details : ''}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await makeRequest('GET', '/api/v1/health');
    assert(health.statusCode === 200 && health.body.success === true, 'API Health Check returns 200');

    // 2. Public Settings
    const pubSettings = await makeRequest('GET', '/api/v1/settings/public');
    assert(pubSettings.statusCode === 200 && pubSettings.body.settings.eventTitle.includes('INSAC 2026'), 'Public Settings API returns event metadata');
    assert(pubSettings.body.settings.committees.length > 0, 'Committees populated from Details.docx');
    assert(pubSettings.body.settings.fees.student === 500, 'Student fee is ₹500');
    assert(pubSettings.body.settings.fees.research_scholar === 750, 'Research Scholar fee is ₹750');
    assert(pubSettings.body.settings.fees.faculty === 1000, 'Faculty fee is ₹1,000');
    assert(pubSettings.body.settings.datesConfirmed === false, 'Dates marked as unconfirmed / proposed');

    // 3. Official Template Download
    const templateRes = await makeRequest('GET', '/api/v1/settings/template/download');
    assert(templateRes.statusCode === 200, 'Template download route returns 200');
    assert(templateRes.headers['content-disposition'].includes('Template for extended abstract (INSAC-2026).docx'), 'Downloaded filename matches original official template');
    assert(templateRes.raw.length > 1700000, `Downloaded file size matches original docx (${(templateRes.raw.length / 1024 / 1024).toFixed(2)} MB)`);

    // 4. Participant Registration
    const testEmail = `scholar_${Date.now()}@lnmu.edu.in`;
    const regRes = await makeRequest('POST', '/api/v1/auth/register', {
      fullName: 'Dr. Anita Sharma',
      email: testEmail,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
      phone: '+91 9876543210',
      institution: 'Dr. A.P.J. Abdul Kalam WIT, LNMU',
      department: 'Computer Science',
      designation: 'Research Fellow',
      participantCategory: 'research_scholar',
      consentGiven: true,
    });
    assert(regRes.statusCode === 201 && regRes.body.success === true, 'Participant registration succeeds (201)');
    const participantCookie = regRes.setCookie;

    // 5. Duplicate Email Rejection
    const dupRes = await makeRequest('POST', '/api/v1/auth/register', {
      fullName: 'Duplicate Tester',
      email: testEmail,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
      consentGiven: true,
    });
    assert(dupRes.statusCode === 409 || dupRes.statusCode === 400, 'Duplicate email registration is rejected (409/400)');

    // 6. Login
    const loginRes = await makeRequest('POST', '/api/v1/auth/login', {
      email: testEmail,
      password: 'SecurePassword123!',
    });
    assert(loginRes.statusCode === 200 && loginRes.body.success === true, 'Participant login succeeds (200)');
    assert(loginRes.setCookie && loginRes.setCookie.includes('token='), 'HttpOnly auth cookie is set on login');

    // 7. Get Current User (/auth/me)
    const meRes = await makeRequest('GET', '/api/v1/auth/me', null, participantCookie);
    assert(meRes.statusCode === 200 && meRes.body.user.role === 'participant', 'Current user profile retrieved with role participant');
    assert(meRes.body.user.password === undefined, 'Password hash is not exposed in API response');

    // 8. Create Registration & Verify Backend Fee Calculation
    const createReg = await makeRequest('POST', '/api/v1/registrations', {
      category: 'research_scholar',
      institution: 'Dr. A.P.J. Abdul Kalam WIT, LNMU',
      department: 'Computer Science',
    }, participantCookie);
    assert(createReg.statusCode === 201 && createReg.body.success === true, 'Registration created with unique reference');
    assert(createReg.body.registration.feeAmount === 750, 'Backend correctly calculates fee for research_scholar as ₹750');
    assert(createReg.body.registration.status === 'pending', 'Initial registration status is pending');
    const registrationRef = createReg.body.registration.registrationRef;

    // 9. Payment Submission (UPI reporting)
    const payRes = await makeRequest('POST', '/api/v1/payments', {
      registrationRef: registrationRef,
      paymentMethod: 'upi',
      amountPaid: 750,
      paymentDate: '2026-10-27',
      transactionId: 'UPI123456789012',
      payerUpiId: 'anita@oksbi',
      remarks: 'Paid as per WIT LNMU instructions',
    }, participantCookie);
    assert(payRes.statusCode === 201 && payRes.body.success === true, 'Payment submission recorded for verification');
    assert(payRes.body.payment.status === 'submitted', 'Payment status is initially submitted');
    const paymentId = payRes.body.payment._id;

    // 10. Abstract Submission Word Limit Validation
    // Exceeding word limit test (> 250 words)
    const longText = Array(260).fill('word').join(' ');
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    let multipartBody = '';
    multipartBody += `--${boundary}\r\nContent-Disposition: form-data; name="title"\r\n\r\nAI-DRIVEN REACTOR MONITORING\r\n`;
    multipartBody += `--${boundary}\r\nContent-Disposition: form-data; name="abstractText"\r\n\r\n${longText}\r\n`;
    multipartBody += `--${boundary}\r\nContent-Disposition: form-data; name="authorName"\r\n\r\nDr. Anita Sharma\r\n`;
    multipartBody += `--${boundary}\r\nContent-Disposition: form-data; name="institution"\r\n\r\nWIT LNMU\r\n`;
    multipartBody += `--${boundary}\r\nContent-Disposition: form-data; name="researchTheme"\r\n\r\nAI and Digital Twins for Nuclear Reactor Monitoring and Safety\r\n`;
    multipartBody += `--${boundary}\r\nContent-Disposition: form-data; name="contactEmail"\r\n\r\n${testEmail}\r\n`;
    multipartBody += `--${boundary}--\r\n`;

    const url = new URL(BASE_URL + '/api/v1/abstracts');
    const overLimitRes = await new Promise((resolve) => {
      const req = http.request({
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Cookie': participantCookie,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': Buffer.byteLength(multipartBody),
        },
      }, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(d) }));
      });
      req.write(multipartBody);
      req.end();
    });
    assert(overLimitRes.statusCode === 400 && overLimitRes.body.success === false, 'Abstract exceeding 250 words is rejected by backend validator (400)');

    // 11. Valid Abstract Submission (under word limit)
    const validText = 'This research investigates AI and digital twins for nuclear reactor safety, thermal hydraulic validation, and sensor fault diagnostics. Novel neural operator architectures are evaluated on simulated core temperature profiles.';
    let validMultipart = '';
    validMultipart += `--${boundary}\r\nContent-Disposition: form-data; name="title"\r\n\r\nAI-DRIVEN REACTOR SAFETY DIGITAL TWINS\r\n`;
    validMultipart += `--${boundary}\r\nContent-Disposition: form-data; name="abstractText"\r\n\r\n${validText}\r\n`;
    validMultipart += `--${boundary}\r\nContent-Disposition: form-data; name="authorName"\r\n\r\nDr. Anita Sharma\r\n`;
    validMultipart += `--${boundary}\r\nContent-Disposition: form-data; name="institution"\r\n\r\nDr. A.P.J. Abdul Kalam WIT, LNMU\r\n`;
    validMultipart += `--${boundary}\r\nContent-Disposition: form-data; name="researchTheme"\r\n\r\nAI and Digital Twins for Nuclear Reactor Monitoring and Safety\r\n`;
    validMultipart += `--${boundary}\r\nContent-Disposition: form-data; name="contactEmail"\r\n\r\n${testEmail}\r\n`;
    validMultipart += `--${boundary}\r\nContent-Disposition: form-data; name="keywords"\r\n\r\nDigital Twins, Reactor Safety, Neural Operators, Sensor Validation\r\n`;
    validMultipart += `--${boundary}--\r\n`;

    const validAbstractRes = await new Promise((resolve) => {
      const req = http.request({
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Cookie': participantCookie,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': Buffer.byteLength(validMultipart),
        },
      }, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(d) }));
      });
      req.write(validMultipart);
      req.end();
    });
    assert(validAbstractRes.statusCode === 201 && validAbstractRes.body.success === true, 'Valid extended abstract submitted successfully (201)');
    const abstractId = validAbstractRes.body.abstract._id;

    // 12. Security Check: Participant cannot access admin endpoints
    const unauthAdmin = await makeRequest('GET', '/api/v1/settings/admin/stats', null, participantCookie);
    assert(unauthAdmin.statusCode === 403, 'Participant is denied access to admin stats (403 Forbidden)');

    // 13. Admin Login & Authorization
    const adminLogin = await makeRequest('POST', '/api/v1/auth/login', {
      email: 'admin@insac2026.org',
      password: 'ChangeThisSecurePassword123!',
    });
    assert(adminLogin.statusCode === 200 && adminLogin.body.user.role === 'admin', 'Admin account authenticates successfully');
    const adminCookie = adminLogin.setCookie;

    // 14. Admin Statistics
    const adminStats = await makeRequest('GET', '/api/v1/settings/admin/stats', null, adminCookie);
    assert(adminStats.statusCode === 200 && adminStats.body.stats.totalUsers >= 1, 'Admin retrieves real database statistics');

    // 15. Admin Payment Verification
    const verifyRes = await makeRequest('PATCH', `/api/v1/payments/${paymentId}/verify`, null, adminCookie);
    assert(verifyRes.statusCode === 200 && verifyRes.body.payment.status === 'verified', 'Admin verifies payment submission');

    // 16. Verify Registration Status automatically updated to confirmed
    const updatedReg = await makeRequest('GET', '/api/v1/registrations/my', null, participantCookie);
    assert(updatedReg.body.registration.status === 'confirmed', 'Participant registration status automatically updated to confirmed upon payment verification');

    // 17. Admin Abstract Review
    const reviewRes = await makeRequest('PATCH', `/api/v1/abstracts/${abstractId}/review`, {
      status: 'accepted',
      reviewNotes: 'Excellent work fitting within the AI & nuclear themes.',
    }, adminCookie);
    assert(reviewRes.statusCode === 200 && reviewRes.body.abstract.status === 'accepted', 'Admin accepts abstract');

    // 18. Participant Dashboard view reflects accepted status without exposing private review notes
    const myAbstract = await makeRequest('GET', '/api/v1/abstracts/my', null, participantCookie);
    assert(myAbstract.body.abstract.status === 'accepted', 'Participant sees accepted status');
    assert(myAbstract.body.abstract.reviewNotes === undefined, 'Private admin review notes remain strictly hidden from participant');

    // 19. Logout & Session Invalidation
    const logoutRes = await makeRequest('POST', '/api/v1/auth/logout', null, participantCookie);
    assert(logoutRes.statusCode === 200, 'Logout endpoint returns 200');
    assert(logoutRes.setCookie && (logoutRes.setCookie.includes('token=;') || logoutRes.setCookie.includes('token=')), 'Logout instructs browser to delete auth cookie');

    const afterLogout = await makeRequest('GET', '/api/v1/auth/me', null, logoutRes.setCookie);
    assert(afterLogout.statusCode === 401, 'Requests with cleared cookie are rejected (401 Unauthorized)');

    console.log('\n========================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  }
}

runTests();
