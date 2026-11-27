import { jobs, skillVocab } from './data/jobs.js';
import { courses } from './data/courses.js';
import { sampleCvs } from './data/sample-cvs.js';

const $ = selector => document.querySelector(selector);
const state = { screen: 'register', form: {}, cvText: '', skills: [], history: [], answers: [], question: 0, profile: null, filters: {}, ai: false, busy: false, applied: new Set(), ranked: [] };
const fields = ['Yazılım','Veri / Analitik','Pazarlama','İnsan Kaynakları','Finans','UI/UX Tasarım','Satış','Üretim / Makine','Lojistik'];
const fieldMap = { Yazılım:'yazılım','Veri / Analitik':'veri/analitik',Pazarlama:'pazarlama/dijital','İnsan Kaynakları':'insan kaynakları',Finans:'finans/muhasebe','UI/UX Tasarım':'UI/UX tasarım',Satış:'satış','Üretim / Makine':'üretim/makine',Lojistik:'lojistik' };
const cities = ['İstanbul','Ankara','İzmir','Bursa','Kocaeli'];
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const formatTL = value => new Intl.NumberFormat('tr-TR').format(value) + ' TL';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function setScreen(screen) {
  state.screen = screen;
  document.querySelectorAll('.screen').forEach(el => el.classList.toggle('active', el.id === screen));
  const order = ['register','cv','coach','matches'];
  document.querySelectorAll('.steps span').forEach(el => { const index = order.indexOf(el.dataset.step); el.classList.toggle('active',index === order.indexOf(screen)); el.classList.toggle('done',index < order.indexOf(screen)); });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setBadge(ai, model) {
  state.ai = ai;
  const label = model?.replace(/^gemini-/, 'Gemini ').replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
  $('#aiBadge').textContent = ai ? label : 'Demo modu';
}

async function status() {
  try { const response = await fetch('/api/status'); const data = await response.json(); setBadge(data.ai, data.model); }
  catch { setBadge(false); }
}

function initForm() {
  $('#fieldOptions').innerHTML = fields.map(field => `<button type="button" class="chip" data-value="${escapeHtml(field)}" aria-pressed="false">${escapeHtml(field)}</button>`).join('');
  $('#statusOptions').addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button) return;
    $('#statusOptions').querySelectorAll('button').forEach(item => { item.classList.toggle('selected', item === button); item.setAttribute('aria-pressed', item === button); });
  });
  $('#fieldOptions').addEventListener('click', event => { const button = event.target.closest('button'); if (!button) return; button.classList.toggle('selected'); button.setAttribute('aria-pressed', button.classList.contains('selected')); });
  $('#registerForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const status = $('#statusOptions .selected')?.dataset.value;
    const selectedFields = [...$('#fieldOptions .selected')].map(item => item.dataset.value);
    if (!status || !selectedFields.length) { window.alert('Lütfen durumunu ve en az bir ilgi alanını seç.'); return; }
    state.form = { name: form.elements.name.value.trim(), email: form.elements.email.value.trim(), city: form.elements.city.value, status, fields: selectedFields };
    setScreen('cv');
  });
}

function initCv() {
  $('#sampleCards').innerHTML = sampleCvs.map(person => `<button class="sample-card" type="button" data-id="${person.id}"><span class="initials">${person.name.split(' ').map(part => part[0]).join('')}</span><strong>${person.name}</strong><span>${person.subtitle}</span></button>`).join('');
  $('#sampleCards').addEventListener('click', event => { const card = event.target.closest('.sample-card'); if (card) useCv(sampleCvs.find(person => person.id === card.dataset.id)); });
  const zone = $('#dropzone');
  zone.addEventListener('keydown', event => { if (['Enter',' '].includes(event.key)) { event.preventDefault(); $('#cvFile').click(); } });
  zone.addEventListener('dragover', event => { event.preventDefault(); zone.classList.add('dragging'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragging'));
  zone.addEventListener('drop', event => { event.preventDefault(); zone.classList.remove('dragging'); if (event.dataTransfer.files[0]) readCv(event.dataTransfer.files[0]); });
  $('#cvFile').addEventListener('change', event => { if (event.target.files[0]) readCv(event.target.files[0]); });
  $('#toCoach').addEventListener('click', () => { setScreen('coach'); beginInterview(); });
}

async function readCv(file) {
  const error = $('#cvError'); error.textContent = '';
  if (file.size > 5 * 1024 * 1024) { error.textContent = 'Dosya en fazla 5 MB olabilir.'; return; }
  try {
    let text;
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      const pdfjs = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs');
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
      const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const pages = await Promise.all(Array.from({ length: Math.min(pdf.numPages, 12) }, async (_, index) => (await (await pdf.getPage(index + 1)).getTextContent()).items.map(item => item.str).join(' ')));
      text = pages.join('\n');
    } else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) text = await file.text();
    else throw new Error('Lütfen PDF veya TXT dosyası seç.');
    if (!text.trim()) throw new Error('CV metni okunamadı. TXT dosyası veya örnek CV deneyebilirsin.');
    useCv({ text, name: file.name });
  } catch (cause) { error.textContent = cause.message || 'CV okunamadı. Örnek CV ile devam edebilirsin.'; }
}

function useCv(person) {
  state.cvText = person.text;
  if (person.fields) {
    state.form.city = person.city;
    state.form.status = person.status;
    state.form.fields = person.fields;
    state.form.name = person.name;
  }
  state.skills = extractSkills(person.text);
  const card = $('#scanCard'); card.classList.add('scanning');
  card.querySelector('h3').textContent = 'CV okunuyor...';
  card.querySelector('p').textContent = `${person.name} için beceriler çıkarılıyor.`;
  $('#foundSkills').innerHTML = '';
  $('#toCoach').hidden = true;
  state.skills.slice(0, 8).forEach((skill, index) => setTimeout(() => { if (state.cvText === person.text) $('#foundSkills').insertAdjacentHTML('beforeend', `<span class="skill-chip">✓ ${escapeHtml(skill)}</span>`); }, 350 + index * 180));
  setTimeout(() => { if (state.cvText !== person.text) return; card.classList.remove('scanning'); card.querySelector('h3').textContent = 'CV hazır!'; card.querySelector('p').textContent = `${state.skills.length} beceri bulundu. Şimdi Ece ile tanışabilirsin.`; $('#toCoach').hidden = false; }, 900 + Math.min(8,state.skills.length) * 180);
}

function extractSkills(text) {
  const normalized = text.toLocaleLowerCase('tr-TR');
  return skillVocab.filter(skill => normalized.includes(skill.toLocaleLowerCase('tr-TR')));
}

async function askAi(mode, history) {
  if (!state.ai) return null;
  try {
    const response = await fetch('/api/coach', { method:'POST', headers:{ 'content-type':'application/json' }, body: JSON.stringify({ mode, form: state.form, cvText: state.cvText, skillVocab, history }) });
    if (!response.ok) throw new Error('AI isteği başarısız');
    const data = await response.json();
    await status();
    return data;
  } catch { setBadge(false); return null; }
}

function localInterview() {
  const first = state.form.name?.split(' ')[0] || 'Merhaba';
  const skill = state.skills[0] || 'deneyimlerin';
  if (state.question === 0) return { reply:`Merhaba ${first}! CV’ndeki ${skill} deneyimin dikkatimi çekti. Öncelikle nasıl bir fırsat arıyorsun?`, quickReplies:['Staj arıyorum','Tam zamanlı iş','İkisine de açığım'], done:false };
  if (state.question === 1) return { reply:'Güzel. Peki seni en çok hangi rolde görmek isteriz?', quickReplies: state.form.fields?.includes('Pazarlama') ? ['Dijital pazarlama','İçerik üretimi','İkisi de'] : ['Yazılım geliştirme','Veri analizi','İkisi de'], done:false };
  if (state.question === 2) return { reply:'Son bir şey: çalışma şekli ve şehir konusunda tercihin ne?', quickReplies:[`${state.form.city} · hibrit`, 'Uzaktan da olur', 'Farklı şehirlere açığım'], done:false };
  return { reply:'Harika, profilini çıkardım. Sana uygun ilanları sıralıyorum…', quickReplies:[], done:true, profile:buildProfile() };
}

function buildProfile() {
  const answerText = state.answers.join(' ').toLocaleLowerCase('tr-TR');
  const targetFields = (state.form.fields || []).map(field => fieldMap[field]).filter(Boolean);
  const jobTypes = answerText.includes('staj') && !answerText.includes('ikisi') ? ['Staj'] : answerText.includes('tam zamanlı') && !answerText.includes('ikisi') ? ['Tam zamanlı'] : state.form.status === 'Öğrenci' ? ['Staj','Yarı zamanlı'] : ['Tam zamanlı','Staj'];
  const remoteOk = /uzaktan|farklı şehir|açığım/.test(answerText) || /uzaktan/i.test(state.cvText);
  const preferredJobs = jobs.filter(job => targetFields.includes(job.field));
  const missing = [...new Set(preferredJobs.flatMap(job => job.requiredSkills))].filter(skill => !state.skills.includes(skill) && courses.some(course => course.skills.includes(skill))).slice(0,4);
  return { targetRoles: targetFields.length ? targetFields : ['yazılım'], skills: state.skills, missingSkills: missing, level: ({Öğrenci:'öğrenci','Yeni mezun':'yeni mezun',Deneyimli:'deneyimli'})[state.form.status] || 'junior', cities:[state.form.city], remoteOk, jobTypes, summary:`${state.skills.slice(0,2).join(' ve ') || 'Gelişime açık becerileri'} ile ${targetFields[0] || 'seçtiğin alanda'} güçlü bir başlangıç yapabilirsin.` };
}

function normalizeProfile(profile) {
  const fallback = buildProfile();
  if (!profile || typeof profile !== 'object') return fallback;
  return { ...fallback, ...profile, skills: (profile.skills || fallback.skills).filter(skill => skillVocab.includes(skill)), missingSkills:(profile.missingSkills || fallback.missingSkills).filter(skill => skillVocab.includes(skill)), targetRoles: Array.isArray(profile.targetRoles) ? profile.targetRoles : fallback.targetRoles, cities:Array.isArray(profile.cities) ? profile.cities : fallback.cities, jobTypes:Array.isArray(profile.jobTypes) ? profile.jobTypes : fallback.jobTypes };
}

async function beginInterview() {
  if (state.history.length) return;
  state.busy = true; avatar('thinking');
  await wait(600);
  const message = localInterview(); // onboarding interview is scripted; Gemini is used after matching
  await coachMessage(message.reply);
  state.history.push({role:'model',text:message.reply});
  renderQuick('#quickReplies',message.quickReplies?.length ? message.quickReplies : localInterview().quickReplies,sendInterview);
  state.busy = false; avatar('');
}

function avatar(mode) { $('#coachAvatar').classList.remove('thinking','speaking','listening'); if(mode) $('#coachAvatar').classList.add(mode); }
function addMessage(container, role, text) { const element = document.createElement('div'); element.className = `message ${role}`; element.textContent = text; $(container).append(element); $(container).scrollTop = $(container).scrollHeight; return element; }
async function coachMessage(text) {
  avatar('speaking');
  const element = addMessage('#chatMessages','model','');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) element.textContent = text;
  else for (let index=0; index<text.length; index+=3) { element.textContent = text.slice(0,index+3); $('#chatMessages').scrollTop = $('#chatMessages').scrollHeight; await wait(12); }
  avatar('');
}
function renderQuick(container, options, handler) { $(container).innerHTML = (options || []).slice(0,3).map(option => `<button type="button">${escapeHtml(option)}</button>`).join(''); $(container).querySelectorAll('button').forEach(button => button.addEventListener('click', () => handler(button.textContent))); }

async function sendInterview(text) {
  if (state.busy || !text?.trim()) return;
  state.busy = true; $('#chatText').value = ''; $('#quickReplies').innerHTML = '';
  addMessage('#chatMessages','user',text.trim()); avatar('listening');
  state.answers.push(text.trim()); state.history.push({role:'user',text:text.trim()}); state.question++;
  $('#questionCount').textContent = `Soru ${Math.min(state.question+1,3)}/3`;
  avatar('thinking');
  await wait(700);
  const result = localInterview();
  await coachMessage(result.reply);
  state.history.push({role:'model',text:result.reply});
  if (result.done || state.question >= 3) {
    state.profile = normalizeProfile(result.profile);
    await wait(700);
    showMatches();
  } else renderQuick('#quickReplies',result.quickReplies?.length ? result.quickReplies : localInterview().quickReplies,sendInterview);
  state.busy = false;
}

function isEligible(job) {
  const filters = state.filters;
  if (filters.jobTypes?.length && !filters.jobTypes.includes(job.type)) return false;
  if (filters.cities?.length && !filters.cities.includes(job.city) && !(filters.remoteOk && job.workMode === 'Uzaktan')) return false;
  if (filters.remoteOnly && job.workMode !== 'Uzaktan') return false;
  return true;
}
function score(job, extraSkills = []) {
  const profile = state.profile;
  const skills = new Set([...profile.skills, ...extraSkills, ...(state.filters.addSkills || [])]);
  const required = job.requiredSkills.filter(skill => skills.has(skill)).length / Math.max(1,job.requiredSkills.length);
  const nice = job.niceSkills.filter(skill => skills.has(skill)).length / Math.max(1,job.niceSkills.length);
  const target = profile.targetRoles.some(role => role.toLocaleLowerCase('tr-TR').includes(job.field) || job.field.includes(role.toLocaleLowerCase('tr-TR'))) ? 1 : 0;
  const location = job.city === 'Uzaktan' ? (profile.remoteOk ? 1 : .5) : (profile.cities.includes(job.city) ? 1 : .25);
  const type = profile.jobTypes.includes(job.type) ? 1 : .2;
  return Math.min(100,Math.round(required*60 + nice*15 + target*15 + ((location+type)/2)*10));
}
function rankJobs() { return jobs.filter(isEligible).map(job => ({job,score:score(job)})).sort((a,b) => b.score-a.score || a.job.postedDaysAgo-b.job.postedDaysAgo); }
function reasons(job) {
  const shared = job.requiredSkills.filter(skill => state.profile.skills.includes(skill));
  const list = shared.slice(0,2).map(skill => `${skill} becerin eşleşiyor`);
  if (job.city === state.form.city || job.workMode === 'Uzaktan') list.push(job.workMode === 'Uzaktan' ? 'Uzaktan çalışma seçeneği' : `${job.city} konumunda`);
  if (list.length < 2) list.push('Kariyer hedefinle uyumlu');
  return list.slice(0,3);
}
function relevantCourses() {
  const gaps = state.ranked.slice(0,3).flatMap(({job}) => job.requiredSkills.filter(skill => !state.profile.skills.includes(skill)));
  const unique = [...new Set(gaps)];
  return courses.map(course => ({course,skill:course.skills.find(skill => unique.includes(skill))})).filter(item => item.skill).sort((a,b) => unique.indexOf(a.skill)-unique.indexOf(b.skill)).slice(0,3);
}
function renderProfile() {
  const p = state.profile;
  $('#profileCard').innerHTML = `<div class="profile-top"><div><span class="eyebrow">PROFİL ÖZETİN</span><h2>${escapeHtml(state.form.name || 'Senin profilin')}</h2><p>${escapeHtml(p.summary)}</p></div><span class="result-count">${escapeHtml(p.level)}</span></div><div class="profile-grid"><div><strong>HEDEF ALANLAR</strong><div class="chips">${p.targetRoles.map(role => `<span class="skill-chip">${escapeHtml(role)}</span>`).join('')}</div></div><div><strong>GÜÇLÜ BECERİLER</strong><div class="chips">${p.skills.slice(0,5).map(skill => `<span class="skill-chip">${escapeHtml(skill)}</span>`).join('')}</div></div><div><strong>GELİŞİM ALANLARI</strong><div class="chips">${p.missingSkills.slice(0,4).map(skill => `<span class="missing-chip">${escapeHtml(skill)}</span>`).join('')}</div></div></div>`;
}
function renderJob({job,score:match},index) {
  const missing = job.requiredSkills.filter(skill => !state.profile.skills.includes(skill));
  const course = courses.find(item => item.skills.some(skill => missing.includes(skill)));
  return `<article class="job-card" data-job="${job.id}"><div class="job-top"><div class="monogram" style="background:${job.companyColor}">${escapeHtml(job.company[0])}</div><div class="job-title"><h3>${escapeHtml(job.title)}</h3><span>${escapeHtml(job.company)} · ${escapeHtml(job.city)}</span></div><div class="match-ring" data-score="${match}" aria-label="Yüzde ${match} uyum"><span>0%</span></div></div><div class="job-meta"><span>${escapeHtml(job.type)}</span><span>${escapeHtml(job.workMode)}</span><span>${escapeHtml(job.salaryRange || 'Maaş görüşmede')}</span></div><div class="why-list">${reasons(job).map(reason => `<span>${escapeHtml(reason)}</span>`).join('')}</div><div class="job-bottom">${course ? `<button class="missing-link" data-course="${course.id}">Eksik: ${escapeHtml(missing.find(skill => course.skills.includes(skill)))} → Eğitime bak</button>` : '<span></span>'}<div class="job-actions"><button class="secondary" data-detail="${job.id}">Detay</button><button class="primary" data-apply="${job.id}" ${state.applied.has(job.id) ? 'disabled' : ''}>${state.applied.has(job.id) ? 'Başvuruldu ✓' : 'Başvur'}</button></div></div></article>`;
}
function animateScores() {
  document.querySelectorAll('.match-ring').forEach(ring => {
    const target = Number(ring.dataset.score);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { ring.style.setProperty('--score',target); ring.querySelector('span').textContent = `${target}%`; return; }
    const start = performance.now();
    function frame(now) { const fraction = Math.min(1,(now-start)/850); const value = Math.round(target*(1-Math.pow(1-fraction,3))); ring.style.setProperty('--score',value); ring.querySelector('span').textContent = `${value}%`; if(fraction<1) requestAnimationFrame(frame); }
    requestAnimationFrame(frame);
  });
}
function renderResults() {
  state.ranked = rankJobs();
  $('#resultCount').textContent = `${state.ranked.length} uygun ilan`;
  renderProfile();
  $('#topJobs').innerHTML = state.ranked.length ? state.ranked.slice(0,3).map(renderJob).join('') : '<div class="job-card"><h3>Bu filtrelerle ilan bulunamadı.</h3><p>Koçuna farklı şehir veya iş türü söyleyebilirsin.</p></div>';
  animateScores();
  $('#courseCards').innerHTML = relevantCourses().map(({course,skill}) => {
    const relevant = state.ranked.find(({job}) => job.requiredSkills.includes(skill));
    const before = relevant?.score || 0; const after = relevant ? score(relevant.job,course.skills) : before;
    return `<article class="course-card" id="${course.id}"><div class="course-icon">✦</div><h3>${escapeHtml(course.title)}</h3><p>${escapeHtml(course.provider)} · ${course.hours} saat · ★ ${course.rating}</p>${course.sponsored ? `<span class="sponsored">Sponsorlu burs</span>` : ''}<div class="improvement">Bu eğitimle uyumun %${before} → %${after}</div><div class="course-bottom"><strong>${formatTL(course.priceTL)}</strong><span>${escapeHtml(skill)}</span></div></article>`;
  }).join('') || '<p class="section-note">Şu anda önerilecek ek eğitim bulunmuyor.</p>';
  $('#otherJobs').innerHTML = state.ranked.slice(3,9).map(({job,score:match}) => `<div class="other-row"><span class="monogram" style="background:${job.companyColor};width:28px;height:28px;border-radius:7px">${escapeHtml(job.company[0])}</span><strong>${escapeHtml(job.title)}</strong><span>${escapeHtml(job.company)}</span><span>${escapeHtml(job.city)}</span><button data-detail="${job.id}">%${match} · Detay</button></div>`).join('') || '<div class="other-row">Diğer ilanlar için koçuna filtreleri genişletmesini söyleyebilirsin.</div>';
}
function showMatches() {
  const source = $('#coachAvatar').getBoundingClientRect();
  const clone = $('#coachAvatar').cloneNode(true);
  clone.removeAttribute('id');
  clone.style.cssText = `position:fixed;z-index:60;left:${source.left}px;top:${source.top}px;width:${source.width}px;height:${source.height}px;margin:0;pointer-events:none`;
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.body.append(clone);
  setScreen('matches');
  if (clone.isConnected) {
    const target = $('.mini-avatar').getBoundingClientRect();
    clone.animate([{ transform:'translate(0,0) scale(1)',opacity:1 },{ transform:`translate(${target.left-source.left}px,${target.top-source.top}px) scale(${target.width/source.width})`,opacity:.7 }],{duration:600,easing:'cubic-bezier(.2,.8,.2,1)'}).finished.finally(() => clone.remove());
  }
  renderResults();
  addMessage('#panelMessages','model','Profilini tamamladım. En uygun ilanları senin için sıraladım. İstersen “sadece staj göster” veya “uzaktan da olur” diyebilirsin.');
  renderQuick('#panelQuick',['Sadece staj göster','Uzaktan da olur','Ankara’yı da ekle'],sendRefine);
}
function localRefine(text) {
  const normalized = text.toLocaleLowerCase('tr-TR');
  const filters = {};
  if (normalized.includes('staj')) filters.jobTypes = ['Staj'];
  if (normalized.includes('tam zamanlı')) filters.jobTypes = ['Tam zamanlı'];
  if (normalized.includes('tüm ilan') || normalized.includes('hepsi')) filters.jobTypes = [];
  if (normalized.includes('uzaktan')) { filters.remoteOk = true; if (/sadece|yalnız/.test(normalized)) filters.remoteOnly = true; }
  if (normalized.includes('yerinde')) filters.remoteOnly = false;
  const mentioned = cities.filter(city => normalized.includes(city.toLocaleLowerCase('tr-TR')));
  if (mentioned.length) filters.cities = /ekle|da|de/.test(normalized) ? [...new Set([...(state.filters.cities || state.profile.cities),...mentioned])] : mentioned;
  const addSkills = skillVocab.filter(skill => normalized.includes(skill.toLocaleLowerCase('tr-TR')));
  if (addSkills.length) filters.addSkills = [...new Set([...(state.filters.addSkills || []),...addSkills])];
  return { reply: Object.keys(filters).length ? 'Tabii, tercihlerini güncelledim. İlanları yeniden sıralıyorum.' : 'Elbette. Staj, çalışma şekli veya şehir tercihlerini yazarak sonuçları daraltabilirsin.', filters };
}
// Gemini may answer with English or loose labels; map them to the values used in jobs.js.
const JOB_TYPE_MAP = { internship:'Staj', intern:'Staj', staj:'Staj', 'full-time':'Tam zamanlı', fulltime:'Tam zamanlı', 'full time':'Tam zamanlı', 'tam zamanlı':'Tam zamanlı', 'part-time':'Yarı zamanlı', 'part time':'Yarı zamanlı', 'yarı zamanlı':'Yarı zamanlı' };
function normalizeAiFilters(filters, localFilters) {
  const out = { ...filters };
  if (Array.isArray(out.jobTypes)) {
    const mapped = out.jobTypes.map(type => JOB_TYPE_MAP[String(type).toLocaleLowerCase('tr').trim()]).filter(Boolean);
    out.jobTypes = mapped.length ? [...new Set(mapped)] : localFilters.jobTypes;
    if (!out.jobTypes) delete out.jobTypes;
  }
  if (Array.isArray(out.cities)) {
    const known = new Set(jobs.map(job => job.city));
    out.cities = out.cities.filter(city => known.has(city));
    if (!out.cities.length) delete out.cities;
  }
  return out;
}
async function sendRefine(text) {
  if (state.busy || !text?.trim()) return;
  state.busy = true; $('#panelText').value = ''; $('#panelQuick').innerHTML = '';
  addMessage('#panelMessages','user',text.trim());
  const local = localRefine(text);
  const result = await askAi('refine',[...state.history,{role:'user',text:text.trim()}]);
  const chosen = result?.filters && Object.keys(result.filters).length ? result : local;
  if (chosen !== local) chosen.filters = normalizeAiFilters(chosen.filters, local.filters);
  state.filters = { ...state.filters, ...chosen.filters };
  if (chosen.filters.remoteOk) state.profile.remoteOk = true;
  if (chosen.filters.cities) state.profile.cities = chosen.filters.cities;
  addMessage('#panelMessages','model',chosen.reply || local.reply);
  renderResults();
  renderQuick('#panelQuick',['Sadece staj göster','Uzaktan da olur','Tüm ilanlar'],sendRefine);
  state.busy = false;
}
function detail(job) {
  const missing = job.requiredSkills.filter(skill => !state.profile.skills.includes(skill));
  const matching = job.requiredSkills.filter(skill => state.profile.skills.includes(skill));
  $('#jobDrawer').innerHTML = `<button class="drawer-close" aria-label="Detayı kapat">×</button><span class="eyebrow">İLAN DETAYI</span><h2>${escapeHtml(job.title)}</h2><p>${escapeHtml(job.company)} · ${escapeHtml(job.city)} · ${escapeHtml(job.workMode)}</p><div class="job-meta"><span>${escapeHtml(job.type)}</span><span>${escapeHtml(job.salaryRange)}</span></div><h3>Bu rolde seni neler bekliyor?</h3><p>${escapeHtml(job.description)}</p><h3>Aranan beceriler</h3><div class="chips">${job.requiredSkills.map(skill => `<span class="${matching.includes(skill) ? 'skill-chip' : 'missing-chip'}">${escapeHtml(skill)}</span>`).join('')}</div><h3>Seninle eşleşenler</h3><p>${matching.length ? escapeHtml(matching.join(', ')) : 'Bu rolde gelişim fırsatı var.'}</p>${missing.length ? `<p>Geliştirebileceğin beceriler: ${escapeHtml(missing.join(', '))}</p>` : ''}<button class="primary wide" data-apply="${job.id}" ${state.applied.has(job.id) ? 'disabled' : ''}>${state.applied.has(job.id) ? 'Başvuruldu ✓' : 'Başvur →'}</button>`;
  $('#jobDrawer').hidden = false; $('#drawerBackdrop').hidden = false; $('#jobDrawer .drawer-close').focus();
}
function closeDrawer() { $('#jobDrawer').hidden = true; $('#drawerBackdrop').hidden = true; }
function apply(jobId) { state.applied.add(jobId); closeDrawer(); renderResults(); $('#applyModal').hidden = false; $('#closeModal').focus(); }

$('#chatForm').addEventListener('submit', event => { event.preventDefault(); sendInterview($('#chatText').value); });
$('#panelForm').addEventListener('submit', event => { event.preventDefault(); sendRefine($('#panelText').value); });
$('#matches').addEventListener('click', event => {
  const detailId = event.target.closest('[data-detail]')?.dataset.detail;
  const applyId = event.target.closest('[data-apply]')?.dataset.apply;
  const courseId = event.target.closest('[data-course]')?.dataset.course;
  if (detailId) detail(jobs.find(job => job.id === detailId));
  if (applyId) apply(applyId);
  if (courseId) document.getElementById(courseId)?.scrollIntoView({behavior:'smooth',block:'center'});
});
$('#jobDrawer').addEventListener('click', event => { if (event.target.closest('.drawer-close')) closeDrawer(); const id = event.target.closest('[data-apply]')?.dataset.apply; if(id) apply(id); });
$('#drawerBackdrop').addEventListener('click', closeDrawer);
$('#closeModal').addEventListener('click', () => { $('#applyModal').hidden = true; });
$('#applyModal').addEventListener('click', event => { if (event.target.id === 'applyModal') $('#applyModal').hidden = true; });
document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeDrawer(); $('#applyModal').hidden = true; $('#coachPanel').classList.remove('open'); } });
$('#openPanel').addEventListener('click', () => $('#coachPanel').classList.add('open'));
$('#closePanel').addEventListener('click', () => $('#coachPanel').classList.remove('open'));
initForm(); initCv(); status();
