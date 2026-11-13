'use client';

import { useState, useRef, useEffect } from 'react';

function sx(str) {
  const obj = {};
  (str || '').split(';').forEach((rule) => {
    const idx = rule.indexOf(':');
    if (idx === -1) return;
    let prop = rule.slice(0, idx).trim();
    let val = rule.slice(idx + 1).trim();
    if (!prop || !val) return;
    if (!prop.startsWith('--')) prop = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    obj[prop] = val;
  });
  return obj;
}

const FAIL_INDICES = { 2: 'Mailbox unavailable', 6: 'Address rejected by receiving server' };
const LANDING_CAROUSEL = [
  { title: 'No data stored', body: 'Sheets are read in memory and discarded the moment every email is sent. Nothing sits on a server.' },
  { title: 'Built for advising offices', body: 'Set the term, session, and level once, then send an entire batch of student records in minutes.' },
  { title: 'Less waiting for students', body: 'Each student gets their document the moment it\u2019s ready, instead of waiting on a manual queue.' }
];
const SCHOOLS_DB = [
  { name: 'Northbridge University', type: 'university', departments: ['Petroleum Engineering', 'Computer Science', 'Mechanical Engineering', 'Business Administration', 'Mathematics'] },
  { name: 'Fairview State College', type: 'university', departments: ['Nursing', 'Computer Science', 'Business Administration', 'Education'] },
  { name: 'Ashcombe Institute of Technology', type: 'university', departments: ['Mechanical Engineering', 'Electrical Engineering', 'Computer Science', 'Civil Engineering'] },
  { name: 'Rosewood Community College', type: 'university', departments: ['General Studies', 'Business Administration', 'Nursing'] },
  { name: 'Kingsley Polytechnic', type: 'university', departments: ['Computer Science', 'Mathematics', 'Petroleum Engineering', 'Architecture'] },
  { name: 'Riverside Primary School', type: 'primary', departments: ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'] },
  { name: 'Crestview Secondary School', type: 'secondary', departments: ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'] },
  { name: 'Oakwood High School', type: 'secondary', departments: ['JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3'] }
];
const NAV_DEFS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'send', label: 'Send Result' },
  { key: 'log', label: 'Session Log' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'help', label: 'Help & Support' },
  { key: 'logout', label: 'Logout' }
];
const PAGE_TITLES = { dashboard: 'Dashboard', send: 'Send Result', log: 'Session Log', feedback: 'Feedback', help: 'Help & Support' };

function pctPassed(node) {
  const total = node.passed + node.failed + (node.pending || 0);
  return total > 0 ? (node.passed / total) * 100 : 0;
}
function pieGradient(node, passedColor, failedColor, pendingColor) {
  const total = node.passed + node.failed + (node.pending || 0);
  if (total === 0) return `conic-gradient(${pendingColor} 0% 100%)`;
  const p = (node.passed / total) * 100;
  const f = (node.failed / total) * 100;
  return `conic-gradient(${passedColor} 0% ${p}%, ${failedColor} ${p}% ${p + f}%, ${pendingColor} ${p + f}% 100%)`;
}
function csvCell(v) {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function gradeToStatus(raw) {
  const v = String(raw ?? '').trim();
  if (v === '') return 'pending';
  if (/^[a-f][+-]?$/i.test(v)) {
    const letter = v[0].toUpperCase();
    if (letter === 'F' || letter === 'E') return 'failed';
    if (['A', 'B', 'C', 'D'].includes(letter)) return 'passed';
    return 'pending';
  }
  const num = parseFloat(v);
  if (!isNaN(num)) return num >= 60 ? 'passed' : 'failed';
  if (/pass/i.test(v)) return 'passed';
  if (/fail/i.test(v)) return 'failed';
  return 'pending';
}
function mapSheetRows(json) {
  if (!json.length) return [];
  const keys = Object.keys(json[0]);
  const findKey = (patterns) => keys.find((k) => patterns.some((p) => p.test(k.trim())));
  const nameKey = findKey([/^name$/i, /student.*name/i, /full.*name/i]) || keys[0];
  const emailKey = findKey([/^email$/i, /e-?mail/i]) || keys[1];
  const gpaKey = findKey([/^gpa$/i, /^cgpa$/i]);
  const docKey = findKey([/document/i, /attachment/i, /file.?name/i, /transcript/i]);
  const noteKey = findKey([/note/i, /comment/i, /remark/i]);
  const excluded = new Set([nameKey, emailKey, gpaKey, docKey, noteKey].filter(Boolean));
  const courseKeys = keys.filter((k) => !excluded.has(k));
  return json.map((row, i) => {
    const name = String(row[nameKey] ?? '').trim();
    const email = String(row[emailKey] ?? '').trim();
    const courses = courseKeys.map((ck) => ({ course: ck, status: gradeToStatus(row[ck]) }));
    const document = docKey ? String(row[docKey] ?? '').trim() : '';
    const note = noteKey ? String(row[noteKey] ?? '').trim() : '';
    return { id: i, name: name || `Row ${i + 1}`, email, courses, document: document || 'Result', note };
  }).filter((r) => r.name || r.email);
}
function computeCourseStats(rowsList) {
  const stats = {};
  rowsList.forEach((r) => {
    (r.courses || []).forEach(({ course, status }) => {
      const c = course || 'General';
      if (!stats[c]) stats[c] = { passed: 0, failed: 0, pending: 0 };
      stats[c][status] += 1;
    });
  });
  return stats;
}

const IconMail = (p) => (<svg width={p.w || 17} height={p.w || 17} viewBox="0 0 24 24" fill="none" stroke={p.color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M22 6l-10 7L2 6"></path></svg>);
const IconPhone = (p) => (<svg width={p.w || 17} height={p.w || 17} viewBox="0 0 24 24" fill="none" stroke={p.color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>);
const IconClock = (p) => (<svg width={p.w || 14} height={p.w || 14} viewBox="0 0 24 24" fill="none" stroke={p.color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>);
const NAV_ICONS = {
  dashboard: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"></rect><rect x="14" y="3" width="7" height="5" rx="1"></rect><rect x="14" y="12" width="7" height="9" rx="1"></rect><rect x="3" y="16" width="7" height="5" rx="1"></rect></svg>),
  send: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>),
  log: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"></path><circle cx="12" cy="13" r="8"></circle><path d="M5 3 2 6"></path><path d="M22 6l-3-3"></path></svg>),
  feedback: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>),
  help: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4"></path><line x1="12" y1="17" x2="12" y2="17"></line></svg>),
  logout: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>)
};

const SidebarIllustration = () => (
  <div style={sx('width:100%;height:120px;margin-bottom:14px;border-radius:12px;background:rgba(255,255,255,0.06);position:relative;overflow:hidden')}>
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" style={sx('position:absolute;top:30px;left:30px;animation:reas-paper-fold 6s ease-in-out infinite')}>
      <rect x="8" y="4" width="44" height="52" rx="3" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.5)" strokeWidth="2"></rect>
      <line x1="16" y1="18" x2="44" y2="18" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"></line>
      <line x1="16" y1="28" x2="44" y2="28" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"></line>
      <line x1="16" y1="38" x2="34" y2="38" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"></line>
    </svg>
    <svg width="64" height="46" viewBox="0 0 64 46" fill="none" style={sx('position:absolute;top:38px;left:26px;animation:reas-plane-throw 6s ease-in-out infinite')}>
      <path d="M2 34 L62 4 L38 23 L44 42 L34 30 Z" fill="rgba(255,255,255,0.16)" stroke="#fff" strokeWidth="2" strokeLinejoin="round"></path>
      <line x1="62" y1="4" x2="34" y2="30" stroke="#fff" strokeWidth="1.5"></line>
    </svg>
    <svg width="86" height="70" viewBox="0 0 120 96" fill="none" style={sx('position:absolute;top:25px;left:17px;animation:reas-envelope-land 6s ease-in-out infinite')}>
      <rect x="6" y="14" width="90" height="64" rx="8" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.35)" strokeWidth="2"></rect>
      <path d="M10 20 L51 50 L92 20" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
      <circle cx="94" cy="70" r="20" fill="#fff"></circle>
      <path d="M85 70 l6 6 l14 -14" stroke="oklch(28% 0.09 258)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" style={sx('transform-origin:94px 70px;animation:reas-check-pop 6s ease-in-out infinite')}></path>
    </svg>
  </div>
);

export default function YuvlexApp() {
  const fileInputRef = useRef(null);
  const sendTimerRef = useRef(null);
  const carouselTimerRef = useRef(null);
  const counterTimerRef = useRef(null);

  const [state, setStateRaw] = useState({
    page: 'landing',
    navPage: 'dashboard',
    step: 'upload',
    modalOpen: false,
    year: '2026',
    semester: 'Fall',
    session: 'Session 1',
    level: '200',
    term: '1st Term',
    schoolClass: 'Primary 1',
    comment: '',
    signature: '',
    mockFileName: '',
    parsedRows: null,
    parseError: '',
    rows: [],
    sendProgress: 0,
    sessionLog: [],
    feedbackText: '',
    feedbackSubmitted: false,
    settingsOpen: false,
    darkMode: false,
    notificationsEnabled: true,
    viewportWidth: 1280,
    mobileNavOpen: false,
    mobileRightOpen: false,
    isAuthenticated: false,
    loginEmail: '',
    loginPassword: '',
    loginError: '',
    advisorName: 'Jordan Blake',
    advisorSchoolQuery: '',
    advisorSchool: 'Northbridge University',
    advisorDepartment: 'Petroleum Engineering',
    landingCarouselIndex: 0,
    counterRecords: 0,
    counterHours: 0,
    passRateLevel: 'years',
    passRateYear: null,
    passRateSemester: null,
    colorEditorOpen: false,
    passedColorOverride: null,
    failedColorOverride: null
  });

  const setState = (updater) => setStateRaw((st) => ({ ...st, ...(typeof updater === 'function' ? updater(st) : updater) }));
  const s = state;

  useEffect(() => {
    const onResize = () => setState({ viewportWidth: window.innerWidth });
    onResize();
    window.addEventListener('resize', onResize);
    carouselTimerRef.current = setInterval(() => {
      setState((st) => ({ landingCarouselIndex: (st.landingCarouselIndex + 1) % LANDING_CAROUSEL.length }));
    }, 4200);
    counterTimerRef.current = setInterval(() => {
      setState((st) => {
        const records = Math.min(1284, st.counterRecords + 43);
        const hours = Math.min(6, st.counterHours + 1);
        if (records >= 1284 && hours >= 6) clearInterval(counterTimerRef.current);
        return { counterRecords: records, counterHours: hours };
      });
    }, 30);
    return () => {
      window.removeEventListener('resize', onResize);
      clearInterval(carouselTimerRef.current);
      clearInterval(counterTimerRef.current);
      if (sendTimerRef.current) clearInterval(sendTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLandingCarousel = (i) => setState({ landingCarouselIndex: i });
  const openYearPassRate = (year) => setState({ passRateLevel: 'semesters', passRateYear: year, passRateSemester: null });
  const backToPassRateYears = () => setState({ passRateLevel: 'years', passRateYear: null, passRateSemester: null });
  const toggleColorEditor = () => setState((st) => ({ colorEditorOpen: !st.colorEditorOpen }));
  const onPassedColorChange = (e) => setState({ passedColorOverride: e.target.value });
  const onFailedColorChange = (e) => setState({ failedColorOverride: e.target.value });

  const downloadPassRateData = () => {
    const rows = [['Year', 'Semester', 'Course', 'Passed', 'Failed', 'Pending Issues', 'Pass Rate %']];
    const byYear = {};
    s.sessionLog.forEach((e) => {
      const parts = (e.label || '').split(' · ');
      const year = parts[0] || 'Unknown';
      const semester = parts.slice(1).join(' · ') || e.time;
      if (!byYear[year]) byYear[year] = { passed: 0, failed: 0, pending: 0 };
      Object.keys(e.courseStats || {}).sort().forEach((course) => {
        const cs = e.courseStats[course];
        const total = cs.passed + cs.failed + cs.pending;
        rows.push([year, semester, course, cs.passed, cs.failed, cs.pending, total > 0 ? Math.round((cs.passed / total) * 100) : 0]);
        byYear[year].passed += cs.passed;
        byYear[year].failed += cs.failed;
        byYear[year].pending += cs.pending;
      });
    });
    Object.keys(byYear).sort().forEach((year) => {
      const total = byYear[year].passed + byYear[year].failed + byYear[year].pending;
      const avg = total > 0 ? Math.round((byYear[year].passed / total) * 100) : 0;
      rows.push([year, 'Average (all semesters)', 'All courses', byYear[year].passed, byYear[year].failed, byYear[year].pending, avg]);
    });
    const csv = rows.map((r) => r.map(csvCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'pass-rate-data.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const scrollToIdWhenReady = (id, attemptsLeft) => {
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: 'smooth' }); return; }
    if (attemptsLeft > 0) requestAnimationFrame(() => scrollToIdWhenReady(id, attemptsLeft - 1));
  };
  const scrollToHowItWorks = () => { const el = document.getElementById('how-it-works'); if (el) el.scrollIntoView({ behavior: 'smooth' }); };
  const goToFaqFromElsewhere = () => { setState({ page: 'landing' }); requestAnimationFrame(() => scrollToIdWhenReady('faq', 30)); };
  const goToPricingFromElsewhere = () => { setState({ page: 'landing' }); requestAnimationFrame(() => scrollToIdWhenReady('pricing', 30)); };

  const backToLanding = () => setState({ page: 'landing' });
  const goToHelp = () => setState({ navPage: 'help' });
  const openSettings = () => setState({ settingsOpen: true });
  const closeSettings = () => setState({ settingsOpen: false });
  const toggleDarkMode = () => setState((st) => ({ darkMode: !st.darkMode }));
  const toggleNotifications = () => setState((st) => ({ notificationsEnabled: !st.notificationsEnabled }));
  const toggleMobileNav = () => setState((st) => ({ mobileNavOpen: !st.mobileNavOpen, mobileRightOpen: false }));
  const toggleMobileRight = () => setState((st) => ({ mobileRightOpen: !st.mobileRightOpen, mobileNavOpen: false }));

  const goToLogin = () => setState({ page: 'login', loginError: '' });
  const goToSupport = () => setState({ page: 'support' });
  const onLoginEmailChange = (e) => setState({ loginEmail: e.target.value });
  const onLoginPasswordChange = (e) => setState({ loginPassword: e.target.value });
  const handleLogin = () => {
    if (!s.loginEmail.includes('@') || s.loginPassword.length < 4) {
      setState({ loginError: 'Enter a valid work email and a password of at least 4 characters.' });
      return;
    }
    setState({ page: 'app', isAuthenticated: true, loginError: '' });
  };
  const handleLogout = () => setState({ page: 'login', isAuthenticated: false, loginPassword: '' });

  const onAdvisorNameChange = (e) => setState({ advisorName: e.target.value });
  const onSchoolQueryChange = (e) => setState({ advisorSchoolQuery: e.target.value, advisorSchool: '', advisorDepartment: '' });
  const selectSchool = (school) => setState({ advisorSchool: school.name, advisorDepartment: school.departments[0], advisorSchoolQuery: '' });
  const onAdvisorDepartmentChange = (e) => setState({ advisorDepartment: e.target.value });

  const setNavPage = (key) => setState((st) => ({ navPage: key, modalOpen: key === 'send' && st.step === 'upload' ? true : st.modalOpen, mobileNavOpen: false }));

  const onYearChange = (e) => setState({ year: e.target.value });
  const onSemesterChange = (e) => setState({ semester: e.target.value });
  const onSessionChange = (e) => setState({ session: e.target.value });
  const onLevelChange = (e) => setState({ level: e.target.value });
  const onTermChange = (e) => setState({ term: e.target.value });
  const onSchoolClassChange = (e) => setState({ schoolClass: e.target.value });
  const onCommentChange = (e) => setState({ comment: e.target.value });
  const onSignatureChange = (e) => setState({ signature: e.target.value });
  const onFeedbackChange = (e) => setState({ feedbackText: e.target.value });

  const stopPropagation = (e) => e.stopPropagation();
  const openUploadModal = () => setState({ modalOpen: true, navPage: 'send' });
  const closeModal = () => setState({ modalOpen: false });
  const triggerFileDialog = () => { if (fileInputRef.current) fileInputRef.current.click(); };

  const onFileChosen = (e) => {
    const file = (e && e.target && e.target.files && e.target.files[0]) ? e.target.files[0] : null;
    if (e && e.target) e.target.value = '';
    if (!file) return;
    setState({ mockFileName: file.name, parsedRows: null, parseError: '' });
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const XLSX = await import('xlsx');
        const data = new Uint8Array(ev.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        const rows = mapSheetRows(json);
        if (rows.length === 0) setState({ parseError: 'No rows found in that sheet.' });
        else setState({ parsedRows: rows });
      } catch (err) {
        setState({ parseError: 'Could not read that file. Please upload a valid .xlsx, .xls, or .csv.' });
      }
    };
    reader.onerror = () => setState({ parseError: 'Could not read that file.' });
    reader.readAsArrayBuffer(file);
  };

  const submitUpload = () => {
    if (!s.mockFileName || !s.parsedRows || !s.parsedRows.length) return;
    const rows = s.parsedRows.map((r) => ({
      id: r.id, name: r.name, email: r.email, document: r.document, note: r.note, courses: r.courses,
      validation: r.email ? 'ready' : 'missing-email', result: undefined, failReason: ''
    }));
    setState({ rows, step: 'preview', modalOpen: false, navPage: 'send' });
  };

  const updateRowEmail = (id, value) => setState((st) => ({
    rows: st.rows.map((r) => r.id === id ? { ...r, email: value, validation: value.trim() ? 'ready' : 'missing-email' } : r)
  }));

  const backToUpload = () => setState({ rows: [], step: 'upload', mockFileName: '', parsedRows: null, parseError: '' });

  const handleSend = () => {
    const anyMissing = s.rows.some((r) => r.validation === 'missing-email');
    if (anyMissing || s.rows.length === 0) return;
    setState({ step: 'sending', sendProgress: 0 });
    sendTimerRef.current = setInterval(() => {
      setState((st) => {
        const next = Math.min(100, st.sendProgress + 8);
        if (next >= 100) {
          clearInterval(sendTimerRef.current);
          const rows = st.rows.map((r, i) => {
            const reason = FAIL_INDICES[i];
            return reason ? { ...r, result: 'failed', failReason: reason } : { ...r, result: 'sent', failReason: '' };
          });
          return { sendProgress: 100, rows, step: 'result' };
        }
        return { sendProgress: next };
      });
    }, 140);
  };

  const resendFailed = () => {
    setState({ step: 'sending', sendProgress: 0 });
    sendTimerRef.current = setInterval(() => {
      setState((st) => {
        const next = Math.min(100, st.sendProgress + 12);
        if (next >= 100) {
          clearInterval(sendTimerRef.current);
          const rows = st.rows.map((r) => r.result === 'failed' ? { ...r, result: 'sent', failReason: '' } : r);
          return { sendProgress: 100, rows, step: 'result' };
        }
        return { sendProgress: next };
      });
    }, 120);
  };

  const startNewBatch = () => {
    const { rows, year, semester, session, level, term, schoolClass, advisorSchool, signature, comment } = s;
    const schoolObj = SCHOOLS_DB.find((sc) => sc.name === advisorSchool);
    const isUni = !schoolObj || schoolObj.type === 'university';
    const sent = rows.filter((r) => r.result === 'sent').length;
    const failed = rows.filter((r) => r.result === 'failed').length;
    const courseStats = computeCourseStats(rows);
    const academicPassed = Object.values(courseStats).reduce((sum, c) => sum + c.passed, 0);
    const academicFailed = Object.values(courseStats).reduce((sum, c) => sum + c.failed, 0);
    const academicPending = Object.values(courseStats).reduce((sum, c) => sum + c.pending, 0);
    const entry = {
      id: Date.now(),
      label: isUni ? `${year} · ${semester} · ${session} · Level ${level}` : `${year} · ${term} · ${session} · ${schoolClass}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      total: rows.length, sent, failed, courseStats, academicPassed, academicFailed, academicPending, signature, comment
    };
    setState((st) => ({
      sessionLog: [entry, ...st.sessionLog],
      rows: [], step: 'upload', sendProgress: 0, mockFileName: '', parsedRows: null, parseError: '',
      comment: '', signature: '',
      passRateLevel: 'years', passRateYear: null, passRateSemester: null
    }));
  };

  const submitFeedback = () => { if (s.feedbackText.trim()) setState({ feedbackSubmitted: true }); };

  // ---- derived values ----
  const dark = s.darkMode && s.page === 'app';
  const vw = s.viewportWidth || 1280;
  const isAppMobile = vw < 880;
  const sidebarStyle = isAppMobile
    ? `flex:none;background:oklch(28% 0.09 258);color:#fff;display:flex;flex-direction:column;padding:26px 18px;position:fixed;top:0;left:0;height:100vh;width:240px;z-index:40;overflow:auto;transition:transform 0.25s ease;transform:translateX(${s.mobileNavOpen ? '0' : '-100%'})`
    : 'flex:none;background:oklch(28% 0.09 258);color:#fff;display:flex;flex-direction:column;padding:26px 18px;width:236px';
  const rightPanelStyle = isAppMobile
    ? `flex:none;background:oklch(32% 0.1 258);color:#fff;padding:26px 22px;overflow:auto;position:fixed;top:0;right:0;height:100vh;width:280px;z-index:40;transition:transform 0.25s ease;transform:translateX(${s.mobileRightOpen ? '0' : '100%'})`
    : 'flex:none;background:oklch(32% 0.1 258);color:#fff;padding:26px 22px;overflow:auto;width:264px';
  const advisorInitials = (s.advisorName || '').trim().split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'A';

  const passedColor = s.passedColorOverride ?? '#2b6cb0';
  const failedColor = s.failedColorOverride ?? '#c0392b';
  const pendingColor = '#d97706';
  const currentSchoolObjForBatch = SCHOOLS_DB.find((sc) => sc.name === s.advisorSchool);
  const isUniversitySchool = !currentSchoolObjForBatch || currentSchoolObjForBatch.type === 'university';
  const isK12School = !isUniversitySchool;
  const batchLabel = isUniversitySchool
    ? `${s.year} · ${s.semester} · ${s.session} · Level ${s.level}`
    : `${s.year} · ${s.term} · ${s.session} · ${s.schoolClass}`;

  const rowVms = s.rows.map((r) => {
    const isMissingEmail = r.validation === 'missing-email';
    let statusLabel = 'Ready', badgeBg = 'oklch(94% 0.015 258)', badgeFg = 'oklch(42% 0.02 258)';
    if (r.result === 'sent') { statusLabel = 'Sent'; badgeBg = 'oklch(92% 0.03 258)'; badgeFg = 'oklch(42% 0.16 258)'; }
    else if (r.result === 'failed') { statusLabel = 'Failed'; badgeBg = 'oklch(93% 0.05 30)'; badgeFg = 'oklch(50% 0.19 25)'; }
    else if (isMissingEmail) { statusLabel = 'Missing email'; badgeBg = 'oklch(93% 0.05 60)'; badgeFg = 'oklch(50% 0.15 60)'; }
    return {
      id: r.id, name: r.name, email: r.email, document: r.document, note: r.note,
      isMissingEmail, hasEmail: !isMissingEmail, statusLabel, badgeBg, badgeFg,
      onEmailChange: (e) => updateRowEmail(r.id, e.target.value)
    };
  });

  const rowCount = s.rows.length;
  const canSend = rowCount > 0 && s.rows.every((r) => r.validation !== 'missing-email');
  const missingCount = s.rows.filter((r) => r.validation === 'missing-email').length;
  const sendHintText = missingCount > 0 ? `Fix ${missingCount} flagged row${missingCount > 1 ? 's' : ''} before sending.` : ' ';
  const sendHintColor = missingCount > 0 ? 'oklch(50% 0.15 60)' : 'oklch(45% 0.02 258)';
  const doneCount = Math.round((s.sendProgress / 100) * rowCount);
  const sendingCountText = `Sending ${doneCount} of ${rowCount}…`;

  const sentRows = s.rows.filter((r) => r.result === 'sent');
  const failedRows = s.rows.filter((r) => r.result === 'failed');
  const failedRowVms = failedRows.map((r) => ({ id: r.id, name: r.name, email: r.email, failReason: r.failReason }));

  const sentBatches = s.sessionLog.slice();
  if (s.step === 'result' && s.rows.length > 0) {
    const liveCourseStats = computeCourseStats(s.rows);
    sentBatches.unshift({
      id: 'current', label: batchLabel, time: 'Just now', total: s.rows.length,
      sent: sentRows.length, failed: failedRows.length, courseStats: liveCourseStats,
      academicPassed: Object.values(liveCourseStats).reduce((sum, c) => sum + c.passed, 0),
      academicFailed: Object.values(liveCourseStats).reduce((sum, c) => sum + c.failed, 0),
      academicPending: Object.values(liveCourseStats).reduce((sum, c) => sum + c.pending, 0),
      signature: '', comment: ''
    });
  }
  const batchesByYear = {};
  sentBatches.forEach((e) => {
    const year = (e.label || '').split(' · ')[0] || 'Unknown';
    if (!batchesByYear[year]) batchesByYear[year] = { passed: 0, failed: 0, pending: 0, courseStats: {}, entries: [] };
    batchesByYear[year].passed += (e.academicPassed || 0);
    batchesByYear[year].failed += (e.academicFailed || 0);
    batchesByYear[year].pending += (e.academicPending || 0);
    Object.entries(e.courseStats || {}).forEach(([course, cs]) => {
      if (!batchesByYear[year].courseStats[course]) batchesByYear[year].courseStats[course] = { passed: 0, failed: 0, pending: 0 };
      batchesByYear[year].courseStats[course].passed += cs.passed;
      batchesByYear[year].courseStats[course].failed += cs.failed;
      batchesByYear[year].courseStats[course].pending += cs.pending;
    });
    batchesByYear[year].entries.push(e);
  });
  const hasSentData = sentBatches.length > 0;
  const passRateYears = Object.keys(batchesByYear).sort().map((y) => ({
    year: y, pctLabel: `${Math.round(pctPassed(batchesByYear[y]))}%`, pieBg: pieGradient(batchesByYear[y], passedColor, failedColor, pendingColor),
    hasData: (batchesByYear[y].passed + batchesByYear[y].failed + batchesByYear[y].pending) > 0,
    onClick: () => openYearPassRate(y)
  }));
  const yearPassData = s.passRateYear ? batchesByYear[s.passRateYear] : null;
  const yearHasCourseData = yearPassData ? (yearPassData.passed + yearPassData.failed + yearPassData.pending) > 0 : false;
  const passRateSemesters = yearPassData ? Object.keys(yearPassData.courseStats).sort().map((course) => ({
    semester: course, pctLabel: `${Math.round(pctPassed(yearPassData.courseStats[course]))}%`,
    pieBg: pieGradient(yearPassData.courseStats[course], passedColor, failedColor, pendingColor)
  })) : [];

  const fanCards = [
    { name: 'Chukwudi Chinomso', doc: 'Transcript', top: '0px', left: '150px', rotate: '-6deg' },
    { name: 'Damilola Oladeji', doc: 'Enrollment Ver.', top: '0px', left: '10px', rotate: '4deg' },
    { name: 'Yusef Danlamin', doc: 'Advising Summary', top: '210px', left: '190px', rotate: '7deg' },
    { name: 'Elvis Paul', doc: 'Transcript', top: '230px', left: '20px', rotate: '-5deg' }
  ];
  const avatarDots = [
    { initials: 'CC', bg: 'oklch(42% 0.16 258)', top: '0px', left: '335px', delay: '0s' },
    { initials: 'DO', bg: 'oklch(55% 0.15 250)', top: '300px', left: '0px', delay: '0.4s' },
    { initials: 'YD', bg: 'oklch(58% 0.14 245)', top: '300px', left: '300px', delay: '1.6s' }
  ];
  const marqueeSchools = SCHOOLS_DB.map((sc) => sc.name).concat(SCHOOLS_DB.map((sc) => sc.name));
  const carouselCards = LANDING_CAROUSEL.map((c, i) => ({ ...c, display: i === s.landingCarouselIndex ? 'block' : 'none' }));
  const carouselDots = LANDING_CAROUSEL.map((_, i) => ({ onClick: () => setLandingCarousel(i), color: i === s.landingCarouselIndex ? 'oklch(42% 0.16 258)' : 'oklch(85% 0.02 258)' }));

  const navItems = NAV_DEFS.map((d) => {
    const active = s.navPage === d.key;
    return {
      key: d.key, label: d.label,
      onClick: d.key === 'logout' ? handleLogout : () => setNavPage(d.key),
      bg: active ? 'rgba(255,255,255,0.14)' : 'transparent',
      dotColor: active ? '#fff' : 'rgba(255,255,255,0.6)'
    };
  });

  const completedTotal = s.sessionLog.reduce((sum, e) => sum + e.total, 0);
  const inFlight = (s.step === 'sending' || s.step === 'result') ? rowCount : 0;
  const totalRecordsThisSession = completedTotal + inFlight;

  const upToDateCount = s.sessionLog.reduce((sum, e) => sum + e.sent, 0) + sentRows.length;
  const currentPending = s.rows.filter((r) => r.validation === 'missing-email' || r.result === 'failed');
  const loggedFailed = s.sessionLog.reduce((sum, e) => sum + e.failed, 0);
  const pendingIssuesCount = currentPending.length + loggedFailed;
  const pendingIssuesColor = pendingIssuesCount > 0 ? 'oklch(55% 0.19 25)' : 'oklch(42% 0.16 258)';
  const pendingRowVms = currentPending.map((r) => ({
    id: r.id, name: r.name, reason: r.result === 'failed' ? r.failReason : 'Missing email address',
    badgeLabel: r.result === 'failed' ? 'Failed' : 'Missing email', badgeBg: 'oklch(93% 0.05 30)', badgeFg: 'oklch(50% 0.19 25)'
  }));
  const pendingRowsEmpty = pendingRowVms.length === 0;

  const historyBars = s.sessionLog.slice(0, 5).map((e) => {
    const pct = e.total > 0 ? Math.round((e.sent / e.total) * 100) : 0;
    return {
      label: `${e.year || ''}${e.label ? e.label.split(' · ')[0] : ''}`.trim() || e.time,
      pctLabel: `${pct}%`, barColor: e.failed > 0 ? 'oklch(65% 0.15 60)' : 'oklch(42% 0.16 258)'
    };
  });
  const historyEmpty = historyBars.length === 0;

  const sessionLogVms = s.sessionLog.map((e) => ({
    ...e, hasSignOff: !!(e.signature || e.comment),
    signOffText: [e.signature ? `Signed by ${e.signature}` : '', e.comment || ''].filter(Boolean).join(' — ')
  }));
  const sessionLogEmpty = s.sessionLog.length === 0;

  const notifications = s.sessionLog.slice(0, 5).map((e) => ({
    id: e.id, title: `${e.sent} of ${e.total} sent — ${e.label.split(' · ').slice(0, 3).join(' · ')}`, time: e.time
  }));
  const notificationsEmpty = notifications.length === 0;

  const canSubmitUpload = !!s.mockFileName && !!s.parsedRows && s.parsedRows.length > 0;
  const isParsing = !!s.mockFileName && !s.parsedRows && !s.parseError;
  const showUploadHint = !isParsing && !s.parseError && !(s.parsedRows && s.parsedRows.length > 0);

  const schoolQuery = s.advisorSchoolQuery.trim().toLowerCase();
  const schoolMatchList = schoolQuery ? SCHOOLS_DB.filter((sc) => sc.name.toLowerCase().includes(schoolQuery)) : [];
  const schoolMatches = schoolMatchList.slice(0, 5).map((sc) => ({ name: sc.name, onSelect: () => selectSchool(sc) }));
  const currentSchoolObj = SCHOOLS_DB.find((sc) => sc.name === s.advisorSchool);
  const showSchoolResults = schoolQuery !== '' && schoolMatches.length > 0;
  const showNoSchoolFound = schoolQuery !== '' && schoolMatchList.length === 0;
  const advisorDepartmentOptions = currentSchoolObj ? currentSchoolObj.departments : [];
  const noSchoolSelected = !currentSchoolObj;
  const profileDeptLabel = (currentSchoolObj && currentSchoolObj.type !== 'university') ? 'Class' : 'Department';
  const schoolInputValue = s.advisorSchoolQuery !== '' ? s.advisorSchoolQuery : s.advisorSchool;

  const isLanding = s.page === 'landing';
  const isLoginPage = s.page === 'login';
  const isSupportPage = s.page === 'support';
  const isApp = s.page === 'app';
  const hasLoginError = !!s.loginError;

  const pageTitle = PAGE_TITLES[s.navPage] || 'Dashboard';
  const isDashboardPage = s.navPage === 'dashboard';
  const isSendPage = s.navPage === 'send';
  const isLogPage = s.navPage === 'log';
  const isFeedbackPage = s.navPage === 'feedback';
  const isHelpPage = s.navPage === 'help';

  const isUpload = s.step === 'upload';
  const isPreview = s.step === 'preview';
  const isSending = s.step === 'sending';
  const isResult = s.step === 'result';
  const resultSentCount = sentRows.length;
  const resultFailedCount = failedRows.length;
  const hasFailed = failedRows.length > 0;
  const feedbackNotSubmitted = !s.feedbackSubmitted;

  const appTextColor = dark ? 'oklch(90% 0.01 258)' : 'oklch(22% 0.035 258)';
  const appCardBg = dark ? 'oklch(24% 0.03 258)' : '#fff';
  const appContentBg = dark ? 'oklch(16% 0.02 258)' : 'oklch(97% 0.008 258)';
  const appBorderColor = dark ? 'oklch(36% 0.04 258)' : 'oklch(88% 0.02 258)';
  const appMutedColor = dark ? 'oklch(65% 0.02 258)' : 'oklch(45% 0.02 258)';
  const appDividerColor = dark ? 'oklch(30% 0.03 258)' : 'oklch(92% 0.015 258)';
  const appTableheadBg = dark ? 'oklch(28% 0.03 258)' : 'oklch(96% 0.015 258)';

  const notifToggleBg = s.notificationsEnabled ? 'oklch(42% 0.16 258)' : 'oklch(70% 0.02 258)';
  const notifToggleLeft = s.notificationsEnabled ? '21px' : '3px';
  const darkToggleBg = s.darkMode ? 'oklch(42% 0.16 258)' : 'oklch(70% 0.02 258)';
  const darkToggleLeft = s.darkMode ? '21px' : '3px';
  const notificationsDisabled = !s.notificationsEnabled;

  const fileNameDisplay = s.mockFileName || 'Choose file...';
  const fileNameColor = s.mockFileName ? 'oklch(22% 0.035 258)' : 'oklch(50% 0.02 258)';
  const uploadBtnBg = canSubmitUpload ? 'oklch(42% 0.16 258)' : 'oklch(75% 0.02 258)';
  const uploadBtnOpacity = canSubmitUpload ? '1' : '0.7';
  const sendBtnBg = canSend ? 'oklch(42% 0.16 258)' : 'oklch(75% 0.02 258)';
  const sendBtnOpacity = canSend ? '1' : '0.7';
  const sendProgressPct = `${s.sendProgress}%`;

  const rootVars = sx(`min-height:100vh;background:oklch(99% 0.004 258);color:${appTextColor};--reas-text:${appTextColor};--reas-card:${appCardBg};--reas-bg:${appContentBg};--reas-border:${appBorderColor};--reas-muted:${appMutedColor};--reas-divider:${appDividerColor};--reas-tablehead:${appTableheadBg}`);

  const FaqCards = () => (
    <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px')}>
      {[
        ['What file formats can I upload?', ".xlsx, .xls, and .csv, with columns for Name, Email, Document, and Note."],
        ['Is the sheet stored anywhere?', "No. It's read in memory to send the emails, then discarded. The session log only keeps counts, not student data."],
        ['A delivery failed — what do I do?', 'Open the batch result and use "Resend failed" to retry just those records.']
      ].map(([q, a], i) => (
        <div key={i} style={sx('background:var(--reas-tablehead);border-radius:12px;padding:24px;cursor:default;transition:transform 0.15s ease,box-shadow 0.15s ease')}>
          <div style={sx('font:600 15px system-ui,sans-serif;margin-bottom:8px')}>{q}</div>
          <div style={sx('font:400 13.5px/1.6 system-ui,sans-serif;color:var(--reas-muted)')}>{a}</div>
        </div>
      ))}
    </div>
  );

  const Footer = ({ onFaq, onPricing }) => (
    <div style={sx('border-top:1px solid var(--reas-border);padding:clamp(40px,6vw,56px) clamp(20px,5vw,48px) 32px')}>
      <div style={sx('max-width:1120px;margin:0 auto')}>
        <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:40px;margin-bottom:44px')}>
          <div>
            <div style={sx('display:flex;align-items:center;gap:10px;margin-bottom:14px')}>
              <img src="/assets/yuvlex-logo.jpeg" alt="Yuvlex" style={sx('height:26px;width:auto;object-fit:contain')} />
              <div style={sx("font:700 16px 'Lora',Georgia,serif")}>Yuvlex</div>
            </div>
            <div style={sx('font:400 13.5px/1.6 system-ui,sans-serif;color:var(--reas-muted);max-width:280px')}>Sends results straight to students — no lining up, no crowding the notice board. Just a few clicks from home, and nothing is ever stored.</div>
          </div>
          <div>
            <div style={sx('font:600 12px system-ui,sans-serif;text-transform:uppercase;letter-spacing:0.05em;color:var(--reas-muted);margin-bottom:14px')}>Product</div>
            <div style={sx('display:flex;flex-direction:column;gap:10px;font:400 14px system-ui,sans-serif')}>
              <div onClick={onFaq} style={sx('color:oklch(22% 0.035 258);cursor:pointer')}>FAQ</div>
              <div onClick={onPricing} style={sx('color:oklch(22% 0.035 258);cursor:pointer')}>Pricing</div>
              <div onClick={goToLogin} style={sx('color:oklch(22% 0.035 258);cursor:pointer')}>Open Yuvlex</div>
            </div>
          </div>
          <div>
            <div style={sx('font:600 12px system-ui,sans-serif;text-transform:uppercase;letter-spacing:0.05em;color:var(--reas-muted);margin-bottom:14px')}>Contact</div>
            <div style={sx('display:flex;flex-direction:column;gap:10px;font:400 14px system-ui,sans-serif;color:oklch(22% 0.035 258)')}>
              <div>support@yuvlex.com</div>
              <div>+1 (800) 555-0139</div>
            </div>
          </div>
        </div>
        <div style={sx('border-top:1px solid var(--reas-border);padding-top:22px;display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center')}>
          <div style={sx('font:600 13px system-ui,sans-serif;color:var(--reas-muted)')}>Yuvlex · Advising record delivery</div>
          <div style={sx('font:400 13px system-ui,sans-serif;color:var(--reas-muted)')}>Files are never stored or logged after sending.</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={rootVars}>

      {isLanding && (
      <div>
        <div style={sx('position:sticky;top:0;z-index:10;background:oklch(99% 0.004 258 / 0.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--reas-border);display:flex;align-items:center;justify-content:space-between;padding:16px clamp(16px,4vw,48px)')}>
          <div style={sx('display:flex;align-items:center;gap:10px')}>
            <img src="/assets/yuvlex-logo.jpeg" alt="Yuvlex" style={sx('height:30px;width:auto;object-fit:contain')} />
            <div style={sx("font:700 19px 'Lora',Georgia,serif;letter-spacing:-0.01em")}>Yuvlex</div>
          </div>
          <div style={sx('display:flex;align-items:center;gap:28px;font:600 14px system-ui,sans-serif')}>
            <div onClick={goToSupport} style={sx('color:oklch(22% 0.035 258);cursor:pointer;transition:color 0.15s ease')}>Support</div>
            <a href="#faq" style={sx('color:oklch(22% 0.035 258);text-decoration:none;transition:color 0.15s ease')}>FAQ</a>
            <a href="#pricing" style={sx('color:oklch(22% 0.035 258);text-decoration:none;transition:color 0.15s ease')}>Pricing</a>
          </div>
          <div onClick={goToLogin} style={sx('background:oklch(42% 0.16 258);color:#fff;font:600 14px system-ui,sans-serif;padding:10px 20px;border-radius:7px;cursor:pointer;white-space:nowrap;flex-shrink:0')}>Open Yuvlex</div>
        </div>

        <div style={sx('position:relative;overflow:hidden')}>
          <div style={sx('position:absolute;top:-140px;right:-180px;width:560px;height:560px;border-radius:42%;background:oklch(42% 0.16 258);opacity:0.06;transform:rotate(-14deg);z-index:0')}></div>
          <div style={sx('max-width:1200px;margin:0 auto;padding:clamp(56px,10vw,84px) clamp(20px,5vw,48px) clamp(60px,10vw,110px);display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:clamp(32px,5vw,44px);align-items:center;position:relative;z-index:1')}>
            <div>
              <div style={sx('display:inline-flex;align-items:center;gap:8px;background:var(--reas-tablehead);border:1px solid var(--reas-border);border-radius:100px;padding:6px 14px;font:600 12px system-ui,sans-serif;color:oklch(42% 0.16 258);margin-bottom:24px;white-space:nowrap')}>
                <span style={sx('width:7px;height:7px;border-radius:50%;background:oklch(42% 0.16 258)')}></span>
                Nothing stored, ever
              </div>
              <div style={sx('font:700 clamp(38px,8vw,68px)/1.05 system-ui,sans-serif;letter-spacing:-0.025em;margin-bottom:2px')}>One sheet.</div>
              <div style={sx('font:700 clamp(38px,8vw,68px)/1.05 system-ui,sans-serif;letter-spacing:-0.025em;margin-bottom:26px')}>Every <span style={sx('background:oklch(42% 0.16 258);color:#fff;padding:0 10px;border-radius:6px;display:inline-block;white-space:nowrap')}>inbox.</span></div>
              <div style={sx('font:400 17px/1.6 system-ui,sans-serif;color:var(--reas-muted);max-width:440px;margin-bottom:32px')}>Yuvlex turns one advising sheet into individual emails — each student gets their document the moment it&apos;s ready. Nothing from the sheet is ever kept.</div>
              <div style={sx('display:flex;flex-wrap:wrap;gap:14px;align-items:center;margin-bottom:30px')}>
                <div onClick={goToLogin} style={sx('background:oklch(42% 0.16 258);color:#fff;font:600 15px system-ui,sans-serif;padding:14px 28px;border-radius:8px;cursor:pointer;white-space:nowrap')}>Open Yuvlex</div>
                <div onClick={scrollToHowItWorks} style={sx('background:transparent;color:oklch(22% 0.035 258);border:1px solid var(--reas-border);font:600 15px system-ui,sans-serif;padding:14px 28px;border-radius:8px;cursor:pointer;white-space:nowrap;flex-shrink:0')}>See how it works</div>
              </div>
              <div style={sx('display:flex;flex-wrap:wrap;gap:22px;font:600 13px system-ui,sans-serif;color:var(--reas-muted)')}>
                <span>✓ No setup</span><span>✓ Nothing stored</span><span>✓ Minutes, not days</span>
              </div>
            </div>

            <div style={sx('position:relative;height:340px;width:min(420px,100%);margin:0 auto;overflow:hidden')}>
              {fanCards.map((fc, i) => (
                <div key={i} style={sx(`position:absolute;top:${fc.top};left:${fc.left};width:150px;background:#fff;border:1px solid var(--reas-border);border-radius:10px;box-shadow:0 10px 26px oklch(22% 0.035 258 / 0.10);padding:12px;transform:rotate(${fc.rotate})`)}>
                  <div style={sx('width:18px;height:18px;border-radius:5px;background:oklch(42% 0.16 258);opacity:0.15;margin-bottom:8px')}></div>
                  <div style={sx('font:600 11.5px system-ui,sans-serif')}>{fc.name}</div>
                  <div style={sx('font:400 10px system-ui,sans-serif;color:var(--reas-muted);margin-top:2px')}>{fc.doc}</div>
                </div>
              ))}
              <div style={sx('position:absolute;top:150px;left:130px;width:150px;background:#fff;border:1px solid var(--reas-border);border-radius:10px;box-shadow:0 12px 26px oklch(22% 0.035 258 / 0.12);padding:11px;animation:reas-sheet-in 5s ease-in-out infinite')}>
                <div style={sx('display:flex;align-items:center;gap:8px')}>
                  <div style={sx('width:20px;height:20px;border-radius:4px;background:oklch(42% 0.16 258);flex:none;display:flex;align-items:center;justify-content:center;color:#fff;font:700 10px system-ui,sans-serif')}>XL</div>
                  <div style={sx('font:600 11.5px system-ui,sans-serif')}>Advising_Sheet.xlsx</div>
                </div>
              </div>
              <div style={sx('position:absolute;top:60px;left:70px;width:130px;height:52px;background:#fff;border:1px solid var(--reas-border);border-radius:10px;box-shadow:0 14px 30px oklch(22% 0.035 258 / 0.14);padding:11px;animation:reas-fly 5s ease-in-out infinite')}>
                <div style={sx('width:16px;height:16px;border-radius:4px;background:oklch(42% 0.16 258);margin-bottom:7px')}></div>
                <div style={sx('position:relative;height:16px')}>
                  <div style={sx('position:absolute;inset:0;font:600 11px system-ui,sans-serif;animation:reas-stage-1 5s ease-in-out infinite')}>Sending…</div>
                  <div style={sx('position:absolute;inset:0;font:600 11px system-ui,sans-serif;animation:reas-stage-2 5s ease-in-out infinite')}>Sent ✓</div>
                  <div style={sx('position:absolute;inset:0;font:600 11px system-ui,sans-serif;color:oklch(42% 0.16 258);animation:reas-stage-3 5s ease-in-out infinite')}>Delivered ✓</div>
                </div>
              </div>
              {avatarDots.map((av, i) => (
                <div key={i} style={sx(`position:absolute;top:${av.top};left:${av.left};width:34px;height:34px;border-radius:50%;background:${av.bg};color:#fff;display:flex;align-items:center;justify-content:center;font:700 12px system-ui,sans-serif;animation:reas-pulse-dot 2.4s ease-in-out infinite;animation-delay:${av.delay}`)}>{av.initials}</div>
              ))}
            </div>
          </div>
        </div>

        <div style={sx('border-top:1px solid var(--reas-border);border-bottom:1px solid var(--reas-border);padding:22px 0;overflow:hidden')}>
          <div style={sx('font:600 11px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.08em;text-align:center;margin-bottom:16px')}>Trusted by advising offices at</div>
          <div style={sx('display:flex;width:max-content;animation:reas-marquee 26s linear infinite')}>
            {marqueeSchools.map((sch, i) => (<div key={i} style={sx("padding:0 36px;font:600 16px 'Lora',Georgia,serif;color:var(--reas-muted);white-space:nowrap;flex:none")}>{sch}</div>))}
          </div>
        </div>

        <div style={sx('background:var(--reas-tablehead);padding:clamp(48px,8vw,72px) clamp(20px,5vw,48px)')}>
          <div style={sx('max-width:1120px;margin:0 auto')}>
            <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:28px;text-align:center;margin-bottom:56px')}>
              <div>
                <div style={sx("font:700 clamp(28px,6vw,42px) 'Lora',Georgia,serif;color:oklch(42% 0.16 258)")}>{s.counterRecords.toLocaleString()}</div>
                <div style={sx('font:600 13px system-ui,sans-serif;color:var(--reas-muted);margin-top:6px')}>Records sent this session</div>
              </div>
              <div>
                <div style={sx("font:700 clamp(28px,6vw,42px) 'Lora',Georgia,serif;color:oklch(42% 0.16 258)")}>{s.counterHours}h</div>
                <div style={sx('font:600 13px system-ui,sans-serif;color:var(--reas-muted);margin-top:6px')}>Hours saved per batch</div>
              </div>
              <div>
                <div style={sx("font:700 clamp(28px,6vw,42px) 'Lora',Georgia,serif;color:oklch(42% 0.16 258)")}>0</div>
                <div style={sx('font:600 13px system-ui,sans-serif;color:var(--reas-muted);margin-top:6px')}>Records stored after sending</div>
              </div>
            </div>
            <div style={sx('position:relative;min-height:150px')}>
              {carouselCards.map((card, i) => (
                <div key={i} style={sx(`display:${card.display};background:#fff;border:1px solid var(--reas-border);border-radius:12px;padding:28px;max-width:640px;margin:0 auto;animation:reas-fade-slide 0.4s ease`)}>
                  <div style={sx("font:700 17px 'Lora',Georgia,serif;margin-bottom:10px")}>{card.title}</div>
                  <div style={sx('font:400 14.5px/1.6 system-ui,sans-serif;color:var(--reas-muted)')}>{card.body}</div>
                </div>
              ))}
              <div style={sx('display:flex;justify-content:center;gap:8px;margin-top:20px')}>
                {carouselDots.map((dot, i) => (<div key={i} onClick={dot.onClick} style={sx(`width:8px;height:8px;border-radius:50%;background:${dot.color};cursor:pointer`)}></div>))}
              </div>
            </div>
          </div>
        </div>

        <div id="how-it-works" style={sx('max-width:1120px;margin:0 auto;padding:clamp(56px,8vw,80px) clamp(20px,5vw,48px)')}>
          <div style={sx("font:700 30px 'Lora',Georgia,serif;margin-bottom:44px")}>How it works</div>
          <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:40px;position:relative')}>
            {[
              ['01', 'Upload the sheet', "Drop in the term's advising export. Yuvlex reads every row."],
              ['02', 'Yuvlex sends each record', 'Every row becomes one email, addressed to that student, with their document attached.'],
              ['03', 'Keep the session log', 'See what went out this session — sent, failed, resent — with nothing saved after you close the tab.']
            ].map(([n, t, d], i) => (
              <div key={i} style={sx('padding:16px;margin:-16px;border-radius:12px;cursor:default;transition:transform 0.15s ease,box-shadow 0.15s ease')}>
                <div style={sx("font:700 15px 'Lora',Georgia,serif;color:oklch(42% 0.16 258);margin-bottom:10px")}>{n}</div>
                <div style={sx('font:600 16px system-ui,sans-serif;margin-bottom:8px')}>{t}</div>
                <div style={sx('font:400 14.5px/1.6 system-ui,sans-serif;color:var(--reas-muted)')}>{d}</div>
              </div>
            ))}
          </div>
        </div>

        <div id="pricing" style={sx('background:var(--reas-tablehead);padding:clamp(56px,8vw,80px) clamp(20px,5vw,48px)')}>
          <div style={sx('max-width:1120px;margin:0 auto')}>
            <div style={sx('text-align:center;margin-bottom:44px')}>
              <div style={sx("font:700 30px 'Lora',Georgia,serif;margin-bottom:10px")}>Pricing</div>
              <div style={sx('font:400 15px system-ui,sans-serif;color:var(--reas-muted)')}>Pay per student sent, or own the platform outright.</div>
            </div>
            <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;max-width:820px;margin:0 auto')}>
              <div style={sx('background:oklch(42% 0.16 258);border-radius:14px;padding:32px;position:relative;box-shadow:0 20px 44px oklch(22% 0.035 258 / 0.18)')}>
                <div style={sx('position:absolute;top:-12px;right:24px;background:#fff;color:oklch(42% 0.16 258);font:700 11px system-ui,sans-serif;padding:5px 12px;border-radius:100px')}>Most flexible</div>
                <div style={sx("font:700 16px 'Lora',Georgia,serif;color:#fff;margin-bottom:6px")}>Pay per student</div>
                <div style={sx('font:400 13px system-ui,sans-serif;color:oklch(92% 0.02 258);margin-bottom:20px')}>No contract — pay only for records you send.</div>
                <div style={sx("font:700 38px 'Lora',Georgia,serif;color:#fff;margin-bottom:4px")}>₦1,000<span style={sx('font:400 15px system-ui,sans-serif')}>/student</span></div>
                <div style={sx('font:400 13px system-ui,sans-serif;color:oklch(92% 0.02 258);margin-bottom:24px')}>Billed per batch, based on records sent</div>
                <div style={sx('display:flex;flex-direction:column;gap:10px;font:400 14px system-ui,sans-serif;color:#fff;margin-bottom:26px')}>
                  <div>✓ Upload &amp; send unlimited batches</div><div>✓ Resend failed deliveries free</div><div>✓ No data stored, ever</div><div>✓ Year/term/session/class filters</div>
                </div>
                <div onClick={goToLogin} style={sx('background:#fff;color:oklch(42% 0.16 258);text-align:center;padding:12px;border-radius:8px;cursor:pointer;font:600 14px system-ui,sans-serif')}>Open Yuvlex</div>
              </div>
              <div style={sx('background:#fff;border:1px solid var(--reas-border);border-radius:14px;padding:32px')}>
                <div style={sx("font:700 16px 'Lora',Georgia,serif;margin-bottom:6px")}>Institution license</div>
                <div style={sx('font:400 13px system-ui,sans-serif;color:var(--reas-muted);margin-bottom:20px')}>Own the platform outright; we host and maintain it.</div>
                <div style={sx("font:700 30px 'Lora',Georgia,serif;margin-bottom:4px")}>Custom</div>
                <div style={sx('font:400 13px system-ui,sans-serif;color:var(--reas-muted);margin-bottom:24px')}>One-time purchase + maintenance</div>
                <div style={sx('display:flex;flex-direction:column;gap:10px;font:400 14px system-ui,sans-serif;margin-bottom:26px')}>
                  <div>✓ Unlimited students, no per-send fee</div><div>✓ Branded for your school</div><div>✓ Ongoing hosting &amp; maintenance by us</div><div>✓ Priority support</div>
                </div>
                <div onClick={goToSupport} style={sx('background:transparent;border:1px solid var(--reas-border);color:oklch(22% 0.035 258);text-align:center;padding:12px;border-radius:8px;cursor:pointer;font:600 14px system-ui,sans-serif')}>Contact us</div>
              </div>
            </div>
          </div>
        </div>

        <div style={sx('max-width:1120px;margin:0 auto;padding:clamp(56px,8vw,80px) clamp(20px,5vw,48px) clamp(56px,8vw,80px)')}>
          <div style={sx('position:relative;overflow:hidden;background:oklch(42% 0.16 258);border-radius:20px;padding:clamp(40px,8vw,72px) clamp(20px,5vw,40px);text-align:center')}>
            <div style={sx('position:absolute;top:-100px;left:-60px;width:320px;height:320px;border-radius:50%;background:#fff;opacity:0.08;animation:reas-drift-a 10s ease-in-out infinite')}></div>
            <div style={sx('position:absolute;bottom:-120px;right:-60px;width:280px;height:280px;border-radius:50%;background:#fff;opacity:0.08;animation:reas-drift-b 12s ease-in-out infinite')}></div>
            <div style={sx('position:relative;z-index:1')}>
              <div style={sx('font:700 clamp(28px,6vw,40px)/1.15 system-ui,sans-serif;color:#fff;letter-spacing:-0.02em;margin-bottom:14px')}>Ready to stop sending<br />records one by one?</div>
              <div style={sx('font:400 16px/1.6 system-ui,sans-serif;color:oklch(92% 0.02 258);max-width:480px;margin:0 auto 30px')}>Upload this term&apos;s sheet and let Yuvlex reach every student&apos;s inbox — nothing is ever stored.</div>
              <div style={sx('display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:center')}>
                <div onClick={goToLogin} style={sx('background:#fff;color:oklch(42% 0.16 258);font:600 15px system-ui,sans-serif;padding:14px 28px;border-radius:8px;cursor:pointer;white-space:nowrap')}>Open Yuvlex</div>
                <div onClick={scrollToHowItWorks} style={sx('background:transparent;color:#fff;border:1px solid oklch(90% 0.02 258 / 0.4);font:600 15px system-ui,sans-serif;padding:14px 28px;border-radius:8px;cursor:pointer;white-space:nowrap')}>See how it works</div>
              </div>
            </div>
          </div>
        </div>

        <div id="faq" style={sx('max-width:1120px;margin:0 auto;padding:clamp(56px,8vw,80px) clamp(20px,5vw,48px) clamp(24px,4vw,40px)')}>
          <div style={sx("font:700 30px 'Lora',Georgia,serif;margin-bottom:32px")}>FAQ</div>
          <FaqCards />
        </div>

        <div id="support" style={sx('border-top:1px solid var(--reas-border);padding:clamp(40px,6vw,56px) clamp(20px,5vw,48px) 32px')}>
          <div style={sx('max-width:1120px;margin:0 auto')}>
            <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:40px;margin-bottom:44px')}>
              <div>
                <div style={sx('display:flex;align-items:center;gap:10px;margin-bottom:14px')}>
                  <img src="/assets/yuvlex-logo.jpeg" alt="Yuvlex" style={sx('height:26px;width:auto;object-fit:contain')} />
                  <div style={sx("font:700 16px 'Lora',Georgia,serif")}>Yuvlex</div>
                </div>
                <div style={sx('font:400 13.5px/1.6 system-ui,sans-serif;color:var(--reas-muted);max-width:280px')}>Sends results straight to students — no lining up, no crowding the notice board. Just a few clicks from home, and nothing is ever stored.</div>
              </div>
              <div>
                <div style={sx('font:600 12px system-ui,sans-serif;text-transform:uppercase;letter-spacing:0.05em;color:var(--reas-muted);margin-bottom:14px')}>Product</div>
                <div style={sx('display:flex;flex-direction:column;gap:10px;font:400 14px system-ui,sans-serif')}>
                  <a href="#how-it-works" style={sx('color:oklch(22% 0.035 258);text-decoration:none')}>How it works</a>
                  <div onClick={goToLogin} style={sx('color:oklch(22% 0.035 258);cursor:pointer')}>Open Yuvlex</div>
                </div>
              </div>
              <div>
                <div style={sx('font:600 12px system-ui,sans-serif;text-transform:uppercase;letter-spacing:0.05em;color:var(--reas-muted);margin-bottom:14px')}>Contact</div>
                <div style={sx('display:flex;flex-direction:column;gap:10px;font:400 14px system-ui,sans-serif;color:oklch(22% 0.035 258)')}>
                  <div onClick={goToSupport} style={sx('cursor:pointer')}>support@yuvlex.com</div>
                </div>
              </div>
            </div>
            <div style={sx('border-top:1px solid var(--reas-border);padding-top:22px;display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center')}>
              <div style={sx('font:600 13px system-ui,sans-serif;color:var(--reas-muted)')}>Yuvlex · Advising record delivery</div>
              <div style={sx('font:400 13px system-ui,sans-serif;color:var(--reas-muted)')}>Files are never stored or logged after sending.</div>
            </div>
          </div>
        </div>
      </div>
      )}

      {isSupportPage && (
      <div style={sx('min-height:100vh;display:flex;flex-direction:column')}>
        <div style={sx('position:sticky;top:0;z-index:10;background:oklch(99% 0.004 258 / 0.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--reas-border);display:flex;align-items:center;justify-content:space-between;padding:16px clamp(16px,4vw,48px)')}>
          <div onClick={backToLanding} style={sx('display:flex;align-items:center;gap:10px;cursor:pointer')}>
            <img src="/assets/yuvlex-logo.jpeg" alt="Yuvlex" style={sx('height:30px;width:auto;object-fit:contain')} />
            <div style={sx("font:700 19px 'Lora',Georgia,serif;letter-spacing:-0.01em")}>Yuvlex</div>
          </div>
          <div style={sx('display:flex;align-items:center;gap:28px;font:600 14px system-ui,sans-serif')}>
            <div onClick={goToSupport} style={sx('color:oklch(42% 0.16 258);cursor:pointer;transition:color 0.15s ease')}>Support</div>
            <div onClick={goToFaqFromElsewhere} style={sx('color:oklch(22% 0.035 258);cursor:pointer;transition:color 0.15s ease')}>FAQ</div>
            <div onClick={goToPricingFromElsewhere} style={sx('color:oklch(22% 0.035 258);cursor:pointer;transition:color 0.15s ease')}>Pricing</div>
          </div>
          <div onClick={goToLogin} style={sx('background:oklch(42% 0.16 258);color:#fff;font:600 14px system-ui,sans-serif;padding:10px 20px;border-radius:7px;cursor:pointer;white-space:nowrap;flex-shrink:0')}>Open Yuvlex</div>
        </div>

        <div style={sx('flex:1')}>
          <div style={sx('max-width:1120px;margin:0 auto;padding:clamp(56px,10vw,84px) clamp(20px,5vw,48px) 60px;text-align:center')}>
            <div style={sx("font:700 clamp(32px,6vw,46px)/1.1 'Lora',Georgia,serif;margin-bottom:16px")}>We value you — and your feedback.</div>
            <div style={sx('font:400 17px/1.6 system-ui,sans-serif;color:var(--reas-muted);max-width:600px;margin:0 auto 44px')}>Whether it&apos;s a question, an issue, or an idea to make Yuvlex better for your office, we want to hear from you. Reach us directly below.</div>

            <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;max-width:820px;margin:0 auto 56px')}>
              <div style={sx('background:#fff;border:1px solid oklch(88% 0.02 258);border-radius:14px;padding:32px;text-align:left;cursor:pointer;transition:transform 0.15s ease,box-shadow 0.15s ease')}>
                <div style={sx('width:38px;height:38px;border-radius:9px;background:var(--reas-tablehead);display:flex;align-items:center;justify-content:center;margin-bottom:16px')}><IconMail w={18} color="oklch(42% 0.16 258)" /></div>
                <div style={sx('font:600 11px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px')}>Email</div>
                <div style={sx("font:700 22px 'Lora',Georgia,serif;color:oklch(42% 0.16 258);margin-bottom:20px")}>support@yuvlex.com</div>
                <a href="mailto:support@yuvlex.com" style={sx('display:block;background:oklch(42% 0.16 258);color:#fff;font:600 14.5px system-ui,sans-serif;padding:12px;border-radius:8px;cursor:pointer;text-decoration:none;text-align:center')}>Email us</a>
              </div>
              <div style={sx('background:#fff;border:1px solid oklch(88% 0.02 258);border-radius:14px;padding:32px;text-align:left;cursor:pointer;transition:transform 0.15s ease,box-shadow 0.15s ease')}>
                <div style={sx('width:38px;height:38px;border-radius:9px;background:var(--reas-tablehead);display:flex;align-items:center;justify-content:center;margin-bottom:16px')}><IconPhone w={18} color="oklch(42% 0.16 258)" /></div>
                <div style={sx('font:600 11px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px')}>Phone</div>
                <div style={sx("font:700 22px 'Lora',Georgia,serif;color:oklch(42% 0.16 258);margin-bottom:20px")}>+1 (800) 555-0139</div>
                <a href="tel:+18005550139" style={sx('display:block;background:transparent;color:oklch(22% 0.035 258);border:1px solid var(--reas-border);font:600 14.5px system-ui,sans-serif;padding:12px;border-radius:8px;cursor:pointer;text-decoration:none;text-align:center')}>Call us</a>
              </div>
            </div>

            <div style={sx('display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:16px')}>
              <IconClock w={15} color="oklch(45% 0.02 258)" />
              <div style={sx('font:600 12px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.06em')}>Support hours</div>
            </div>
            <div style={sx('display:flex;flex-wrap:wrap;gap:32px;justify-content:center;font:400 14.5px system-ui,sans-serif;color:var(--reas-muted);margin-bottom:8px')}>
              <div>Mon – Fri: 8am – 5pm</div><div>Saturday: 9am – 2pm</div><div>Sunday: Closed</div>
            </div>
          </div>
        </div>

        <Footer onFaq={goToFaqFromElsewhere} onPricing={goToPricingFromElsewhere} />
      </div>
      )}

      {isLoginPage && (
      <div style={sx('min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px')}>
        <div style={sx('width:380px;max-width:100%;background:#fff;border:1px solid oklch(88% 0.02 258);border-radius:14px;padding:36px')}>
          <div style={sx('display:flex;align-items:center;gap:10px;margin-bottom:26px')}>
            <img src="/assets/yuvlex-logo.jpeg" alt="Yuvlex" style={sx('height:30px;width:auto;object-fit:contain')} />
            <div style={sx("font:700 19px 'Lora',Georgia,serif")}>Yuvlex</div>
          </div>
          <div style={sx("font:700 20px 'Lora',Georgia,serif;margin-bottom:6px")}>Adviser sign in</div>
          <div style={sx('font:400 13.5px system-ui,sans-serif;color:oklch(45% 0.02 258);margin-bottom:22px')}>Only signed-in advisers can access student records and send tools.</div>
          <div style={sx('font:600 10.5px system-ui,sans-serif;color:oklch(45% 0.02 258);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:5px')}>Work email</div>
          <input value={s.loginEmail} onChange={onLoginEmailChange} placeholder="you@university.edu" style={sx('width:100%;font:400 14px system-ui,sans-serif;padding:10px 12px;border-radius:8px;border:1px solid oklch(85% 0.02 258);margin-bottom:14px')} />
          <div style={sx('font:600 10.5px system-ui,sans-serif;color:oklch(45% 0.02 258);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:5px')}>Password</div>
          <input type="password" value={s.loginPassword} onChange={onLoginPasswordChange} placeholder="••••••••" style={sx('width:100%;font:400 14px system-ui,sans-serif;padding:10px 12px;border-radius:8px;border:1px solid oklch(85% 0.02 258);margin-bottom:8px')} />
          {hasLoginError && (<div style={sx('font:400 12.5px system-ui,sans-serif;color:oklch(55% 0.19 25);margin-bottom:10px')}>{s.loginError}</div>)}
          <div onClick={handleLogin} style={sx('background:oklch(42% 0.16 258);color:#fff;font:600 14.5px system-ui,sans-serif;padding:12px;border-radius:8px;text-align:center;cursor:pointer;margin-top:8px')}>Sign in</div>
          <div style={sx('font:400 12px system-ui,sans-serif;color:oklch(45% 0.02 258);margin-top:16px;text-align:center')}>Demo access — any work email and a password of 4+ characters.</div>
          <div onClick={backToLanding} style={sx('font:600 13px system-ui,sans-serif;color:oklch(42% 0.16 258);cursor:pointer;text-align:center;margin-top:18px')}>Back to home</div>
        </div>
      </div>
      )}

      {isApp && (
      <div style={sx('display:flex;flex-direction:column;min-height:100vh')}>
        {isAppMobile && (
        <div style={sx('position:sticky;top:0;z-index:35;background:oklch(28% 0.09 258);color:#fff;display:flex;align-items:center;justify-content:space-between;padding:12px 16px;flex:none')}>
          <div onClick={toggleMobileNav} style={sx('width:36px;height:36px;border-radius:8px;background:rgba(255,255,255,0.14);display:flex;align-items:center;justify-content:center;cursor:pointer;font:600 16px system-ui,sans-serif;flex:none')}>☰</div>
          <div onClick={backToLanding} style={sx('display:flex;align-items:center;gap:8px;cursor:pointer')}>
            <img src="/assets/yuvlex-logo.jpeg" alt="Yuvlex" style={sx('height:22px;width:auto;object-fit:contain;flex:none')} />
            <div style={sx("font:700 15px 'Lora',Georgia,serif")}>Yuvlex</div>
          </div>
          <div onClick={toggleMobileRight} style={sx('width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.14);display:flex;align-items:center;justify-content:center;cursor:pointer;font:700 12px system-ui,sans-serif;flex:none')}>{advisorInitials}</div>
        </div>
        )}

        <div style={sx('display:flex;flex:1;min-height:0;position:relative')}>
          {s.mobileNavOpen && (<div onClick={toggleMobileNav} style={sx('position:fixed;inset:0;background:oklch(20% 0.02 258 / 0.45);z-index:38')}></div>)}
          {s.mobileRightOpen && (<div onClick={toggleMobileRight} style={sx('position:fixed;inset:0;background:oklch(20% 0.02 258 / 0.45);z-index:38')}></div>)}

          <div style={sx(sidebarStyle)}>
            <div onClick={backToLanding} style={sx('display:flex;align-items:center;gap:10px;padding:0 6px 28px;cursor:pointer')}>
              <div style={sx('width:30px;height:30px;border-radius:7px;background:#fff;display:flex;align-items:center;justify-content:center;flex:none;overflow:hidden')}><img src="/assets/yuvlex-logo.jpeg" alt="Yuvlex" style={sx('height:20px;width:auto;object-fit:contain')} /></div>
              <div style={sx("font:700 17px 'Lora',Georgia,serif;white-space:nowrap")}>Yuvlex</div>
            </div>

            {navItems.map((nav) => (
              <div key={nav.key} onClick={nav.onClick} style={sx(`display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:8px;cursor:pointer;margin-bottom:4px;background:${nav.bg}`)}>
                <span style={sx(`width:18px;height:18px;flex:none;color:${nav.dotColor};display:flex;align-items:center;justify-content:center`)}>{NAV_ICONS[nav.key]}</span>
                <span style={sx('font:600 14px system-ui,sans-serif;white-space:nowrap')}>{nav.label}</span>
              </div>
            ))}

            <div style={sx('flex:1')}></div>
            <SidebarIllustration />
            <div onClick={backToLanding} style={sx('background:#fff;color:oklch(28% 0.09 258);font:600 13.5px system-ui,sans-serif;text-align:center;padding:10px;border-radius:8px;cursor:pointer;white-space:nowrap;flex-shrink:0')}>Visit website</div>
          </div>

          <div style={sx('flex:1;min-width:0;background:var(--reas-bg);padding:clamp(16px,4vw,34px) clamp(16px,4vw,40px);overflow:auto')}>
            <div style={sx('display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;margin-bottom:28px;gap:16px')}>
              <div style={sx("font:700 24px 'Lora',Georgia,serif")}>{pageTitle}</div>
              <input placeholder="Search" style={sx('font:400 13.5px system-ui,sans-serif;padding:9px 14px;border-radius:8px;border:1px solid var(--reas-border);background:var(--reas-card);flex:1;min-width:140px;max-width:260px')} />
            </div>

            {isDashboardPage && (
            <div>
              <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:20px;margin-bottom:20px')}>
                <div style={sx('background:var(--reas-card);border:1px solid var(--reas-border);border-radius:12px;padding:22px')}>
                  <div style={sx('font:600 12px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px')}>Up to date</div>
                  <div style={sx("font:700 34px 'Lora',Georgia,serif;color:oklch(42% 0.16 258)")}>{upToDateCount}</div>
                  <div style={sx('font:400 12.5px system-ui,sans-serif;color:var(--reas-muted);margin-top:4px')}>Students with results sent</div>
                </div>
                <div style={sx('background:var(--reas-card);border:1px solid var(--reas-border);border-radius:12px;padding:22px')}>
                  <div style={sx('font:600 12px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px')}>Pending issues</div>
                  <div style={sx(`font:700 34px 'Lora',Georgia,serif;color:${pendingIssuesColor}`)}>{pendingIssuesCount}</div>
                  <div style={sx('font:400 12.5px system-ui,sans-serif;color:var(--reas-muted);margin-top:4px')}>Flagged or failed deliveries</div>
                </div>
                <div style={sx('background:var(--reas-card);border:1px solid var(--reas-border);border-radius:12px;padding:22px')}>
                  <div style={sx('font:600 12px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px')}>Records this session</div>
                  <div style={sx("font:700 34px 'Lora',Georgia,serif")}>{totalRecordsThisSession}</div>
                </div>
              </div>

              <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px')}>
                <div style={sx('background:var(--reas-card);border:1px solid var(--reas-border);border-radius:12px;padding:22px')}>
                  <div style={sx('font:600 12px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px')}>Students awaiting results</div>
                  {pendingRowsEmpty && (<div style={sx('font:400 13px system-ui,sans-serif;color:var(--reas-muted)')}>Nothing pending — all uploaded records were sent or resolved.</div>)}
                  {pendingRowVms.map((p) => (
                    <div key={p.id} style={sx('display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-top:1px solid var(--reas-divider)')}>
                      <div>
                        <div style={sx('font:600 13px system-ui,sans-serif')}>{p.name}</div>
                        <div style={sx('font:400 12px system-ui,sans-serif;color:var(--reas-muted)')}>{p.reason}</div>
                      </div>
                      <div style={sx(`background:${p.badgeBg};color:${p.badgeFg};font:600 11px system-ui,sans-serif;padding:4px 9px;border-radius:100px;white-space:nowrap`)}>{p.badgeLabel}</div>
                    </div>
                  ))}
                  <div onClick={openUploadModal} style={sx('margin-top:16px;background:oklch(42% 0.16 258);color:#fff;font:600 13.5px system-ui,sans-serif;padding:10px 20px;border-radius:8px;cursor:pointer;display:inline-block;white-space:nowrap')}>Upload sheet</div>
                </div>

                <div style={sx('background:var(--reas-card);border:1px solid var(--reas-border);border-radius:12px;padding:22px')}>
                  <div style={sx('font:600 12px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px')}>Sent Results</div>
                  {historyEmpty && (<div style={sx('font:400 13px system-ui,sans-serif;color:var(--reas-muted)')}>No sends yet this session — history builds as you send batches.</div>)}
                  {historyBars.map((h, i) => (
                    <div key={i} style={sx('display:flex;align-items:center;gap:10px;margin-bottom:12px')}>
                      <span style={sx('width:76px;font:600 12px system-ui,sans-serif;flex:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{h.label}</span>
                      <div style={sx('flex:1;height:6px;border-radius:100px;background:oklch(94% 0.015 258);overflow:hidden')}>
                        <div style={sx(`height:100%;border-radius:100px;background:${h.barColor};width:${h.pctLabel}`)}></div>
                      </div>
                      <span style={sx('font:600 12px system-ui,sans-serif;width:36px;text-align:right;flex:none')}>{h.pctLabel}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={sx('background:var(--reas-card);border:1px solid var(--reas-border);border-radius:12px;padding:22px;margin-top:20px')}>
                <div style={sx('display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:4px')}>
                  <div style={sx('font:600 12px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.05em')}>Pass Rate</div>
                  <div style={sx('display:flex;gap:14px;flex-wrap:wrap;align-items:center')}>
                    <div style={sx('display:flex;align-items:center;gap:6px;font:600 11.5px system-ui,sans-serif;color:var(--reas-muted)')}><span style={sx(`width:9px;height:9px;border-radius:50%;background:${passedColor};flex:none`)}></span>Passed</div>
                    <div style={sx('display:flex;align-items:center;gap:6px;font:600 11.5px system-ui,sans-serif;color:var(--reas-muted)')}><span style={sx(`width:9px;height:9px;border-radius:50%;background:${failedColor};flex:none`)}></span>Failed</div>
                    <div style={sx('display:flex;align-items:center;gap:6px;font:600 11.5px system-ui,sans-serif;color:var(--reas-muted)')}><span style={sx(`width:9px;height:9px;border-radius:50%;background:${pendingColor};flex:none`)}></span>Pending issues</div>
                    <div onClick={toggleColorEditor} style={sx('width:22px;height:22px;border-radius:50%;border:1px solid var(--reas-border);display:flex;align-items:center;justify-content:center;cursor:pointer;font:400 11px system-ui,sans-serif;color:var(--reas-muted);flex:none')}>✎</div>
                    {hasSentData && (<div onClick={downloadPassRateData} style={sx('font:600 11.5px system-ui,sans-serif;color:oklch(42% 0.16 258);cursor:pointer;border:1px solid var(--reas-border);border-radius:100px;padding:4px 12px;white-space:nowrap')}>Download data</div>)}
                  </div>
                </div>

                {s.colorEditorOpen && (
                <div style={sx('display:flex;gap:20px;flex-wrap:wrap;align-items:center;background:var(--reas-tablehead);border-radius:8px;padding:10px 14px;margin-bottom:16px')}>
                  <div style={sx('display:flex;align-items:center;gap:8px')}>
                    <span style={sx('font:600 12px system-ui,sans-serif;color:var(--reas-muted)')}>Passed</span>
                    <input type="color" value={passedColor} onChange={onPassedColorChange} style={sx('width:28px;height:28px;padding:0;border:none;border-radius:6px;cursor:pointer')} />
                  </div>
                  <div style={sx('display:flex;align-items:center;gap:8px')}>
                    <span style={sx('font:600 12px system-ui,sans-serif;color:var(--reas-muted)')}>Failed</span>
                    <input type="color" value={failedColor} onChange={onFailedColorChange} style={sx('width:28px;height:28px;padding:0;border:none;border-radius:6px;cursor:pointer')} />
                  </div>
                </div>
                )}

                {!hasSentData && (<div style={sx('font:400 13px system-ui,sans-serif;color:var(--reas-muted)')}>No batches sent yet — send a batch to see your pass/fail rate here.</div>)}

                {hasSentData && (
                <div>
                  {isPassRateYears && (<div style={sx('font:400 12.5px system-ui,sans-serif;color:var(--reas-muted);margin-bottom:16px')}>By year — based on each student&apos;s grade (D or above passes). Click a year to break down by course.</div>)}
                  {!isPassRateYears && (
                  <div style={sx('display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:16px')}>
                    <div onClick={backToPassRateYears} style={sx('display:flex;align-items:center;gap:5px;font:600 12.5px system-ui,sans-serif;color:oklch(42% 0.16 258);cursor:pointer;border:1px solid var(--reas-border);border-radius:100px;padding:5px 12px')}>← Back</div>
                    <span style={sx('font:600 12.5px system-ui,sans-serif;color:var(--reas-muted)')}>All years / {s.passRateYear}</span>
                  </div>
                  )}

                  {isPassRateYears && (
                  <div style={sx('display:flex;flex-wrap:wrap;gap:28px')}>
                    {passRateYears.map((py) => (
                      <div key={py.year} onClick={py.onClick} style={sx('display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer')}>
                        <div style={sx(`width:96px;height:96px;border-radius:50%;background:${py.pieBg};display:flex;align-items:center;justify-content:center`)}>
                          <div style={sx("width:66px;height:66px;border-radius:50%;background:var(--reas-card);display:flex;align-items:center;justify-content:center;font:700 15px 'Lora',Georgia,serif")}>{py.pctLabel}</div>
                        </div>
                        <div style={sx('font:600 13px system-ui,sans-serif')}>{py.year}</div>
                      </div>
                    ))}
                  </div>
                  )}

                  {isPassRateYears && !passRateYears.some((y) => y.hasData) && (
                    <div style={sx('font:400 12.5px system-ui,sans-serif;color:oklch(50% 0.15 60);margin-top:12px')}>Your sheet doesn&apos;t include a Grade, Score, or Pass/Fail column, so pass rate can&apos;t be calculated — the figures above default to pending. Add one of those columns (D or above passes) and re-send to see real results here.</div>
                  )}

                  {!isPassRateYears && yearHasCourseData && (
                  <div style={sx('display:flex;flex-wrap:wrap;gap:28px')}>
                    {passRateSemesters.map((ps, i) => (
                      <div key={i} style={sx('display:flex;flex-direction:column;align-items:center;gap:8px')}>
                        <div style={sx(`width:96px;height:96px;border-radius:50%;background:${ps.pieBg};display:flex;align-items:center;justify-content:center`)}>
                          <div style={sx("width:66px;height:66px;border-radius:50%;background:var(--reas-card);display:flex;align-items:center;justify-content:center;font:700 15px 'Lora',Georgia,serif")}>{ps.pctLabel}</div>
                        </div>
                        <div style={sx('font:600 12.5px system-ui,sans-serif;text-align:center;max-width:110px')}>{ps.semester}</div>
                      </div>
                    ))}
                  </div>
                  )}
                  {!isPassRateYears && !yearHasCourseData && (
                    <div style={sx('font:400 13px system-ui,sans-serif;color:var(--reas-muted)')}>No graded results for {s.passRateYear}. Add a Grade, Score, or Pass/Fail column to your sheet to see course breakdowns.</div>
                  )}
                </div>
                )}
              </div>
            </div>
            )}

            {isSendPage && (
            <div>
              {isUpload && (
              <div style={sx('max-width:560px;background:var(--reas-card);border:1px solid var(--reas-border);border-radius:14px;padding:32px;text-align:center')}>
                <div style={sx("font:700 18px 'Lora',Georgia,serif;margin-bottom:8px")}>No sheet uploaded yet</div>
                <div style={sx('font:400 14px system-ui,sans-serif;color:var(--reas-muted);margin-bottom:20px')}>Upload this session&apos;s advising sheet to send results to each student.</div>
                <div onClick={openUploadModal} style={sx('background:oklch(42% 0.16 258);color:#fff;font:600 14px system-ui,sans-serif;padding:11px 22px;border-radius:8px;cursor:pointer;display:inline-block;white-space:nowrap')}>Upload Excel File</div>
              </div>
              )}

              {isPreview && (
              <div style={sx('background:var(--reas-card);border:1px solid var(--reas-border);border-radius:14px;padding:32px')}>
                <div style={sx('display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:flex-start;margin-bottom:20px')}>
                  <div>
                    <div style={sx("font:700 22px 'Lora',Georgia,serif;margin-bottom:6px")}>Review before sending</div>
                    <div style={sx('font:400 14px system-ui,sans-serif;color:var(--reas-muted)')}>{batchLabel} · {rowCount} records</div>
                  </div>
                  <div onClick={backToUpload} style={sx('font:600 13.5px system-ui,sans-serif;color:var(--reas-muted);cursor:pointer;padding:9px 4px')}>Back</div>
                </div>
                <div style={sx('border:1px solid var(--reas-border);border-radius:10px;overflow-x:auto')}>
                  <div style={sx('min-width:760px')}>
                    <div style={sx('display:grid;grid-template-columns:1.3fr 1.8fr 1.3fr 1.8fr 1fr;background:var(--reas-tablehead);padding:11px 16px;font:600 11.5px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.04em;gap:12px')}>
                      <div>Name</div><div>Email</div><div>Document</div><div>Note</div><div>Status</div>
                    </div>
                    {rowVms.map((row) => (
                      <div key={row.id} style={sx('display:grid;grid-template-columns:1.3fr 1.8fr 1.3fr 1.8fr 1fr;padding:12px 16px;border-top:1px solid var(--reas-divider);align-items:center;gap:12px')}>
                        <div style={sx('font:600 13.5px system-ui,sans-serif')}>{row.name}</div>
                        {row.isMissingEmail && (<input value={row.email} onChange={row.onEmailChange} placeholder="Add email address" style={sx('font:400 13px system-ui,sans-serif;padding:6px 8px;border-radius:6px;border:1px solid oklch(65% 0.16 30);background:var(--reas-card);color:var(--reas-text);width:100%')} />)}
                        {row.hasEmail && (<div style={sx('font:400 13px system-ui,sans-serif;color:var(--reas-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{row.email}</div>)}
                        <div style={sx('font:400 13px system-ui,sans-serif;color:var(--reas-muted)')}>{row.document}</div>
                        <div style={sx('font:400 12.5px system-ui,sans-serif;color:var(--reas-muted)')}>{row.note}</div>
                        <div style={sx('display:flex;align-items:center;gap:6px')}>
                          <div style={sx(`background:${row.badgeBg};color:${row.badgeFg};font:600 11px system-ui,sans-serif;padding:4px 9px;border-radius:100px;white-space:nowrap`)}>{row.statusLabel}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={sx('display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center;margin-top:22px')}>
                  <div style={sx(`font:400 13px system-ui,sans-serif;color:${sendHintColor}`)}>{sendHintText}</div>
                  <div onClick={handleSend} style={sx(`background:${sendBtnBg};color:#fff;font:600 14.5px system-ui,sans-serif;padding:12px 24px;border-radius:8px;cursor:pointer;opacity:${sendBtnOpacity};white-space:nowrap;flex-shrink:0`)}>Send {rowCount} records</div>
                </div>
              </div>
              )}

              {isSending && (
              <div style={sx('max-width:560px;margin:40px auto;background:var(--reas-card);border:1px solid var(--reas-border);border-radius:14px;padding:44px;text-align:center')}>
                <div style={sx('width:40px;height:40px;border-radius:50%;border:3px solid oklch(90% 0.015 258);border-top-color:oklch(42% 0.16 258);margin:0 auto 22px;animation:reas-spin 0.9s linear infinite')}></div>
                <div style={sx("font:700 19px 'Lora',Georgia,serif;margin-bottom:10px")}>{sendingCountText}</div>
                <div style={sx('font:400 13.5px system-ui,sans-serif;color:var(--reas-muted);margin-bottom:22px')}>{batchLabel}</div>
                <div style={sx('height:8px;border-radius:100px;background:oklch(94% 0.015 258);overflow:hidden')}>
                  <div style={sx(`height:100%;border-radius:100px;background:oklch(42% 0.16 258);width:${sendProgressPct};transition:width 0.14s linear`)}></div>
                </div>
              </div>
              )}

              {isResult && (
              <div style={sx('max-width:640px;background:var(--reas-card);border:1px solid var(--reas-border);border-radius:14px;padding:36px')}>
                <div style={sx("font:700 22px 'Lora',Georgia,serif;margin-bottom:6px")}>Batch complete</div>
                <div style={sx('font:400 14px system-ui,sans-serif;color:var(--reas-muted);margin-bottom:24px')}>{batchLabel}</div>
                <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:16px;margin-bottom:26px')}>
                  <div style={sx('background:var(--reas-tablehead);border-radius:10px;padding:20px')}>
                    <div style={sx("font:700 32px 'Lora',Georgia,serif;color:oklch(42% 0.16 258)")}>{resultSentCount}</div>
                    <div style={sx('font:600 13px system-ui,sans-serif;color:var(--reas-muted)')}>Sent</div>
                  </div>
                  <div style={sx('background:oklch(97% 0.03 40);border-radius:10px;padding:20px')}>
                    <div style={sx("font:700 32px 'Lora',Georgia,serif;color:oklch(55% 0.19 25)")}>{resultFailedCount}</div>
                    <div style={sx('font:600 13px system-ui,sans-serif;color:var(--reas-muted)')}>Failed</div>
                  </div>
                </div>
                {hasFailed && (
                <div style={sx('margin-bottom:26px')}>
                  <div style={sx('font:600 13.5px system-ui,sans-serif;margin-bottom:10px')}>Failed deliveries</div>
                  {failedRowVms.map((fr) => (
                    <div key={fr.id} style={sx('display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border:1px solid var(--reas-border);border-radius:8px;margin-bottom:8px')}>
                      <div>
                        <div style={sx('font:600 13.5px system-ui,sans-serif')}>{fr.name}</div>
                        <div style={sx('font:400 12.5px system-ui,sans-serif;color:oklch(55% 0.19 25)')}>{fr.failReason}</div>
                      </div>
                      <div style={sx('font:400 12.5px system-ui,sans-serif;color:var(--reas-muted)')}>{fr.email}</div>
                    </div>
                  ))}
                </div>
                )}
                <div style={sx('display:flex;flex-wrap:wrap;justify-content:flex-end;gap:12px')}>
                  {hasFailed && (<div onClick={resendFailed} style={sx('font:600 14px system-ui,sans-serif;color:oklch(42% 0.16 258);padding:11px 20px;border-radius:8px;border:1px solid var(--reas-border);cursor:pointer;white-space:nowrap;flex-shrink:0')}>Resend failed ({resultFailedCount})</div>)}
                  <div onClick={startNewBatch} style={sx('background:oklch(42% 0.16 258);color:#fff;font:600 14px system-ui,sans-serif;padding:11px 20px;border-radius:8px;cursor:pointer;white-space:nowrap;flex-shrink:0')}>Start new batch</div>
                </div>
              </div>
              )}
            </div>
            )}

            {isLogPage && (
            <div style={sx('max-width:760px')}>
              <div style={sx('font:400 13.5px system-ui,sans-serif;color:var(--reas-muted);margin-bottom:20px')}>Batches sent this session. This clears when you leave — nothing is saved.</div>
              {sessionLogEmpty && (<div style={sx('border:1px dashed var(--reas-border);border-radius:12px;padding:44px;text-align:center;font:400 14px system-ui,sans-serif;color:var(--reas-muted)')}>No batches sent yet this session.</div>)}
              {sessionLogVms.map((entry) => (
                <div key={entry.id} style={sx('background:var(--reas-card);border:1px solid var(--reas-border);border-radius:10px;padding:18px 22px;margin-bottom:12px')}>
                  <div style={sx('display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center')}>
                    <div>
                      <div style={sx('font:600 14.5px system-ui,sans-serif;margin-bottom:4px')}>{entry.label}</div>
                      <div style={sx('font:400 12.5px system-ui,sans-serif;color:var(--reas-muted)')}>{entry.time} · {entry.total} records</div>
                    </div>
                    <div style={sx('display:flex;flex-wrap:wrap;gap:20px')}>
                      <div style={sx('text-align:right')}>
                        <div style={sx("font:700 18px 'Lora',Georgia,serif;color:oklch(42% 0.16 258)")}>{entry.sent}</div>
                        <div style={sx('font:600 10.5px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase')}>Sent</div>
                      </div>
                      <div style={sx('text-align:right')}>
                        <div style={sx("font:700 18px 'Lora',Georgia,serif;color:oklch(55% 0.19 25)")}>{entry.failed}</div>
                        <div style={sx('font:600 10.5px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase')}>Failed</div>
                      </div>
                    </div>
                  </div>
                  {entry.hasSignOff && (<div style={sx('margin-top:10px;padding-top:10px;border-top:1px solid var(--reas-divider);font:400 12.5px system-ui,sans-serif;color:var(--reas-muted)')}>{entry.signOffText}</div>)}
                </div>
              ))}
            </div>
            )}

            {isFeedbackPage && (
            <div style={sx('max-width:560px;background:var(--reas-card);border:1px solid var(--reas-border);border-radius:12px;padding:28px')}>
              <div style={sx("font:700 18px 'Lora',Georgia,serif;margin-bottom:8px")}>Send feedback</div>
              <div style={sx('font:400 13.5px system-ui,sans-serif;color:var(--reas-muted);margin-bottom:18px')}>Tell us what would make Yuvlex more useful for your office.</div>
              {s.feedbackSubmitted && (<div style={sx('padding:16px;background:var(--reas-tablehead);border-radius:8px;font:600 13.5px system-ui,sans-serif;color:oklch(42% 0.16 258)')}>Thanks — your feedback has been noted for this session.</div>)}
              {feedbackNotSubmitted && (
                <div>
                  <textarea value={s.feedbackText} onChange={onFeedbackChange} rows={4} placeholder="Your feedback" style={sx('width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--reas-border);background:var(--reas-card);color:var(--reas-text);margin-bottom:14px;font:400 13.5px system-ui,sans-serif;resize:vertical')}></textarea>
                  <div onClick={submitFeedback} style={sx('background:oklch(42% 0.16 258);color:#fff;padding:11px 20px;border-radius:8px;display:inline-block;cursor:pointer;font:600 14px system-ui,sans-serif;white-space:nowrap')}>Submit</div>
                </div>
              )}
            </div>
            )}

            {isHelpPage && (
            <div style={sx('max-width:680px')}>
              <div style={sx('background:var(--reas-card);border:1px solid var(--reas-border);border-radius:12px;padding:26px;margin-bottom:14px')}>
                <div style={sx('font:600 15px system-ui,sans-serif;margin-bottom:8px')}>What file formats can I upload?</div>
                <div style={sx('font:400 13.5px/1.6 system-ui,sans-serif;color:var(--reas-muted)')}>.xlsx, .xls, and .csv, with columns for Name, Email, Document, and Note.</div>
              </div>
              <div style={sx('background:var(--reas-card);border:1px solid var(--reas-border);border-radius:12px;padding:26px;margin-bottom:14px')}>
                <div style={sx('font:600 15px system-ui,sans-serif;margin-bottom:8px')}>Is the sheet stored anywhere?</div>
                <div style={sx('font:400 13.5px/1.6 system-ui,sans-serif;color:var(--reas-muted)')}>No. It&apos;s read in memory to send the emails, then discarded. The session log only keeps counts, not student data.</div>
              </div>
              <div style={sx('background:var(--reas-card);border:1px solid var(--reas-border);border-radius:12px;padding:26px;margin-bottom:14px')}>
                <div style={sx('font:600 15px system-ui,sans-serif;margin-bottom:8px')}>A delivery failed — what do I do?</div>
                <div style={sx('font:400 13.5px/1.6 system-ui,sans-serif;color:var(--reas-muted)')}>Open the batch result and use &quot;Resend failed&quot; to retry just those records.</div>
              </div>
              <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-bottom:14px')}>
                <div style={sx('background:var(--reas-card);border:1px solid var(--reas-border);border-radius:12px;padding:22px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:transform 0.15s ease,box-shadow 0.15s ease')}>
                  <div style={sx('width:36px;height:36px;border-radius:9px;background:var(--reas-tablehead);display:flex;align-items:center;justify-content:center;flex:none')}><IconMail w={17} color="oklch(42% 0.16 258)" /></div>
                  <div>
                    <div style={sx('font:600 11px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px')}>Email</div>
                    <a href="mailto:support@yuvlex.com" style={sx("font:600 14.5px system-ui,sans-serif;color:oklch(42% 0.16 258);text-decoration:none")}>support@yuvlex.com</a>
                  </div>
                </div>
                <div style={sx('background:var(--reas-card);border:1px solid var(--reas-border);border-radius:12px;padding:22px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:transform 0.15s ease,box-shadow 0.15s ease')}>
                  <div style={sx('width:36px;height:36px;border-radius:9px;background:var(--reas-tablehead);display:flex;align-items:center;justify-content:center;flex:none')}><IconPhone w={17} color="oklch(42% 0.16 258)" /></div>
                  <div>
                    <div style={sx('font:600 11px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px')}>Phone</div>
                    <a href="tel:+18005550139" style={sx("font:600 14.5px system-ui,sans-serif;color:oklch(42% 0.16 258);text-decoration:none")}>+1 (800) 555-0139</a>
                  </div>
                </div>
              </div>
              <div style={sx('font:600 11px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px')}>Support hours</div>
              <div style={sx('display:flex;align-items:center;gap:8px;font:400 13.5px system-ui,sans-serif;color:var(--reas-muted)')}>
                <IconClock w={14} color="oklch(45% 0.02 258)" />
                Mon – Fri: 8am – 5pm · Saturday: 9am – 2pm · Sunday: Closed
              </div>
            </div>
            )}

          </div>

          <div style={sx(rightPanelStyle)}>
            <div style={sx('display:flex;justify-content:flex-end;gap:10px;margin-bottom:22px')}>
              <div onClick={goToHelp} style={sx('width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,0.14);display:flex;align-items:center;justify-content:center;cursor:pointer;font:600 13px system-ui,sans-serif;flex:none')}>?</div>
              <div onClick={openSettings} style={sx('width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,0.14);display:flex;align-items:center;justify-content:center;font:600 13px system-ui,sans-serif;flex:none;cursor:pointer')}>⚙</div>
            </div>
            <div style={sx('text-align:center;padding-top:4px')}>
              <div style={sx("width:84px;height:84px;margin:0 auto 14px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px dashed rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;font:400 10px system-ui,sans-serif;color:rgba(255,255,255,0.6);text-align:center")}>Photo</div>
              <div style={sx("font:700 16px 'Lora',Georgia,serif")}>{s.advisorName}</div>
              <div style={sx('font:400 12.5px system-ui,sans-serif;opacity:0.85;margin-top:2px')}>Course Adviser</div>
              <div style={sx('font:400 12px system-ui,sans-serif;opacity:0.7;margin-top:6px')}>{s.advisorDepartment} · {s.advisorSchool}</div>
            </div>
            <div style={sx('height:1px;background:rgba(255,255,255,0.18);margin:24px 0')}></div>
            <div style={sx("font:700 15px 'Lora',Georgia,serif;margin-bottom:14px")}>Notifications</div>
            {notificationsDisabled && (<div style={sx('font:400 13px system-ui,sans-serif;opacity:0.6')}>Notifications are turned off.</div>)}
            {s.notificationsEnabled && (
            <div>
              {notificationsEmpty && (<div style={sx('font:400 13px system-ui,sans-serif;opacity:0.75')}>No notifications yet.</div>)}
              {notifications.map((note) => (
                <div key={note.id} style={sx('background:rgba(255,255,255,0.08);border-radius:8px;padding:12px 14px;margin-bottom:10px')}>
                  <div style={sx('font:600 13px system-ui,sans-serif;margin-bottom:3px')}>{note.title}</div>
                  <div style={sx('font:400 11.5px system-ui,sans-serif;opacity:0.7')}>{note.time}</div>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>

        {s.modalOpen && (
        <div onClick={closeModal} style={sx('position:fixed;inset:0;background:oklch(20% 0.02 258 / 0.45);display:flex;align-items:center;justify-content:center;z-index:50;padding:24px')}>
          <div onClick={stopPropagation} style={sx('background:var(--reas-card);color:var(--reas-text);border-radius:14px;padding:30px;width:560px;max-width:100%;max-height:90vh;overflow:auto')}>
            <div style={sx('display:flex;justify-content:space-between;align-items:center;margin-bottom:18px')}>
              <div style={sx("font:700 19px 'Lora',Georgia,serif")}>Upload Excel File</div>
              <div onClick={closeModal} style={sx('cursor:pointer;font:600 16px system-ui,sans-serif;color:var(--reas-muted);padding:4px 8px')}>✕</div>
            </div>
            <div style={sx('display:flex;gap:10px;background:var(--reas-tablehead);border:1px solid var(--reas-border);border-radius:9px;padding:12px 14px;margin-bottom:20px')}>
              <span style={sx('width:7px;height:7px;border-radius:50%;background:oklch(42% 0.16 258);flex:none;margin-top:6px')}></span>
              <div style={sx("font:400 13px/1.5 system-ui,sans-serif;color:oklch(35% 0.03 258)")}>We don&apos;t store your data. This file is read in memory and discarded once sending finishes.</div>
            </div>
            <div onClick={triggerFileDialog} style={sx(`border:1px solid var(--reas-border);border-radius:8px;padding:11px 14px;cursor:pointer;font:400 13.5px system-ui,sans-serif;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:${fileNameColor}`)}>{fileNameDisplay}</div>
            <input type="file" accept=".xlsx,.xls,.csv" ref={fileInputRef} onChange={onFileChosen} style={sx('display:none')} />
            {isParsing && (<div style={sx('font:400 12px system-ui,sans-serif;color:var(--reas-muted);margin-bottom:18px')}>Reading sheet…</div>)}
            {!!s.parseError && (<div style={sx('font:400 12px system-ui,sans-serif;color:oklch(55% 0.19 25);margin-bottom:18px')}>{s.parseError}</div>)}
            {!!s.parsedRows && s.parsedRows.length > 0 && (<div style={sx('font:400 12px system-ui,sans-serif;color:oklch(42% 0.16 258);margin-bottom:18px')}>{s.parsedRows.length} rows found.</div>)}
            {showUploadHint && (<div style={sx('font:400 12px system-ui,sans-serif;color:var(--reas-muted);margin-bottom:18px')}>Please upload Excel files only — .xlsx, .xls, or .csv.</div>)}

            <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin-bottom:14px')}>
              <div>
                <div style={sx('font:600 10.5px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:5px')}>Session</div>
                <select value={s.session} onChange={onSessionChange} style={sx('width:100%;font:600 13px system-ui,sans-serif;padding:8px 10px;border-radius:6px;border:1px solid var(--reas-border);background:var(--reas-card);color:var(--reas-text)')}>
                  <option value="Session 1">Session 1</option><option value="Session 2">Session 2</option><option value="Full Term">Full Term</option>
                </select>
              </div>
              <div>
                <div style={sx('font:600 10.5px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:5px')}>Year</div>
                <select value={s.year} onChange={onYearChange} style={sx('width:100%;font:600 13px system-ui,sans-serif;padding:8px 10px;border-radius:6px;border:1px solid var(--reas-border);background:var(--reas-card);color:var(--reas-text)')}>
                  <option value="2024">2024</option><option value="2025">2025</option><option value="2026">2026</option><option value="2027">2027</option>
                </select>
              </div>
              {isUniversitySchool && (
              <div>
                <div style={sx('font:600 10.5px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:5px')}>Semester</div>
                <select value={s.semester} onChange={onSemesterChange} style={sx('width:100%;font:600 13px system-ui,sans-serif;padding:8px 10px;border-radius:6px;border:1px solid var(--reas-border);background:var(--reas-card);color:var(--reas-text)')}>
                  <option value="Fall">Fall</option><option value="Spring">Spring</option><option value="Summer">Summer</option>
                </select>
              </div>
              )}
              {isUniversitySchool && (
              <div>
                <div style={sx('font:600 10.5px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:5px')}>Level</div>
                <select value={s.level} onChange={onLevelChange} style={sx('width:100%;font:600 13px system-ui,sans-serif;padding:8px 10px;border-radius:6px;border:1px solid var(--reas-border);background:var(--reas-card);color:var(--reas-text)')}>
                  <option value="100">100</option><option value="200">200</option><option value="300">300</option><option value="400">400</option><option value="Graduate">Graduate</option>
                </select>
              </div>
              )}
              {isK12School && (
              <div>
                <div style={sx('font:600 10.5px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:5px')}>Term</div>
                <select value={s.term} onChange={onTermChange} style={sx('width:100%;font:600 13px system-ui,sans-serif;padding:8px 10px;border-radius:6px;border:1px solid var(--reas-border);background:var(--reas-card);color:var(--reas-text)')}>
                  <option value="1st Term">1st Term</option><option value="2nd Term">2nd Term</option><option value="3rd Term">3rd Term</option>
                </select>
              </div>
              )}
              {isK12School && (
              <div>
                <div style={sx('font:600 10.5px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:5px')}>Class</div>
                <select value={s.schoolClass} onChange={onSchoolClassChange} style={sx('width:100%;font:600 13px system-ui,sans-serif;padding:8px 10px;border-radius:6px;border:1px solid var(--reas-border);background:var(--reas-card);color:var(--reas-text)')}>
                  {advisorDepartmentOptions.map((cls) => (<option key={cls} value={cls}>{cls}</option>))}
                </select>
              </div>
              )}
            </div>

            <div style={sx('font:600 10.5px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:5px')}>Comment</div>
            <textarea value={s.comment} onChange={onCommentChange} rows={3} placeholder="Optional note for this batch" style={sx('width:100%;font:400 13.5px system-ui,sans-serif;padding:10px 12px;border-radius:8px;border:1px solid var(--reas-border);background:var(--reas-card);color:var(--reas-text);resize:vertical;margin-bottom:16px')}></textarea>

            <div style={sx('font:600 10.5px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:5px')}>Signature</div>
            <input value={s.signature} onChange={onSignatureChange} placeholder="Type your full name to sign off" style={sx('width:100%;font:400 13.5px system-ui,sans-serif;padding:10px 12px;border-radius:8px;border:1px solid var(--reas-border);background:var(--reas-card);color:var(--reas-text);margin-bottom:20px')} />

            <div onClick={submitUpload} style={sx(`background:${uploadBtnBg};color:#fff;font:600 14.5px system-ui,sans-serif;padding:12px;border-radius:8px;text-align:center;cursor:pointer;opacity:${uploadBtnOpacity}`)}>Upload</div>
          </div>
        </div>
        )}

        {s.settingsOpen && (
        <div onClick={closeSettings} style={sx('position:fixed;inset:0;background:oklch(20% 0.02 258 / 0.45);display:flex;align-items:center;justify-content:center;z-index:50;padding:24px')}>
          <div onClick={stopPropagation} style={sx('background:var(--reas-card);color:var(--reas-text);border-radius:14px;padding:30px;width:420px;max-width:100%')}>
            <div style={sx('display:flex;justify-content:space-between;align-items:center;margin-bottom:18px')}>
              <div style={sx("font:700 19px 'Lora',Georgia,serif")}>Settings</div>
              <div onClick={closeSettings} style={sx('cursor:pointer;font:600 16px system-ui,sans-serif;color:var(--reas-muted);padding:4px 8px')}>✕</div>
            </div>
            <div style={sx('padding-bottom:16px;border-bottom:1px solid var(--reas-divider);margin-bottom:6px')}>
              <div style={sx('font:600 12px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px')}>Profile</div>
              <div style={sx('font:600 10.5px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:5px')}>Name</div>
              <input value={s.advisorName} onChange={onAdvisorNameChange} style={sx('width:100%;font:400 13.5px system-ui,sans-serif;padding:9px 12px;border-radius:8px;border:1px solid var(--reas-border);background:var(--reas-card);color:var(--reas-text);margin-bottom:14px')} />
              <div style={sx('font:600 10.5px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:5px')}>School</div>
              <input value={schoolInputValue} onChange={onSchoolQueryChange} placeholder="Search your school" style={sx('width:100%;font:400 13.5px system-ui,sans-serif;padding:9px 12px;border-radius:8px;border:1px solid var(--reas-border);background:var(--reas-card);color:var(--reas-text);margin-bottom:6px')} />
              {showSchoolResults && (
              <div style={sx('border:1px solid var(--reas-border);border-radius:8px;margin-bottom:10px;overflow:hidden')}>
                {schoolMatches.map((sc) => (<div key={sc.name} onClick={sc.onSelect} style={sx('padding:9px 12px;font:400 13px system-ui,sans-serif;cursor:pointer')}>{sc.name}</div>))}
              </div>
              )}
              {showNoSchoolFound && (<div style={sx('font:400 12.5px system-ui,sans-serif;color:oklch(55% 0.19 25);margin-bottom:10px')}>No school matching &quot;{s.advisorSchoolQuery}&quot; in our database.</div>)}
              <div style={sx('font:600 10.5px system-ui,sans-serif;color:var(--reas-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:5px')}>{profileDeptLabel}</div>
              <select value={s.advisorDepartment} onChange={onAdvisorDepartmentChange} style={sx('width:100%;font:600 13px system-ui,sans-serif;padding:8px 10px;border-radius:6px;border:1px solid var(--reas-border);background:var(--reas-card);color:var(--reas-text)')}>
                {noSchoolSelected && (<option value="">Select a school first</option>)}
                {advisorDepartmentOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
              </select>
            </div>
            <div style={sx('display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-top:1px solid var(--reas-divider)')}>
              <div>
                <div style={sx('font:600 14px system-ui,sans-serif')}>Notifications</div>
                <div style={sx('font:400 12.5px system-ui,sans-serif;color:var(--reas-muted);margin-top:2px')}>Show batch-send alerts in the side panel</div>
              </div>
              <div onClick={toggleNotifications} style={sx(`width:42px;height:24px;border-radius:100px;background:${notifToggleBg};position:relative;cursor:pointer;flex:none`)}>
                <div style={sx(`width:18px;height:18px;border-radius:50%;background:#fff;position:absolute;top:3px;left:${notifToggleLeft};transition:left 0.15s`)}></div>
              </div>
            </div>
            <div style={sx('display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-top:1px solid var(--reas-divider)')}>
              <div>
                <div style={sx('font:600 14px system-ui,sans-serif')}>Dark mode</div>
                <div style={sx('font:400 12.5px system-ui,sans-serif;color:var(--reas-muted);margin-top:2px')}>Switch the workspace to a dark theme</div>
              </div>
              <div onClick={toggleDarkMode} style={sx(`width:42px;height:24px;border-radius:100px;background:${darkToggleBg};position:relative;cursor:pointer;flex:none`)}>
                <div style={sx(`width:18px;height:18px;border-radius:50%;background:#fff;position:absolute;top:3px;left:${darkToggleLeft};transition:left 0.15s`)}></div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
      )}
    </div>
  );
}
