// Client-side matching: required 60, nice 15, interest/role 15, location/type 10.
import { JOBS } from '../data/jobs.js';
import { COURSES } from '../data/courses.js';

const LEVELS = { Stajyer: 0, Junior: 1, Orta: 2, Kıdemli: 3 };
export const FIELDS = ['Yazılım', 'Veri', 'Pazarlama', 'İK', 'Finans', 'Tasarım', 'Satış', 'Üretim', 'Lojistik'];
export const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Kocaeli', 'Uzaktan'];

export const norm = (s) => String(s).toLowerCase().replace(/̇/g, '');
const tokens = (s) => norm(s).split(/[^a-zçğıöşü0-9]+/).filter((w) => w.length > 3);

function levelFit(job, profile) {
  const diff = (LEVELS[job.level] ?? 1) - (LEVELS[profile.level] ?? 1);
  if (diff === 0) return 1;
  if (diff < 0) return diff === -1 ? 0.85 : 0.7;
  return diff === 1 ? 0.55 : 0.25;
}

export function scoreJob(job, profile, extra = []) {
  const have = new Set([...(profile.skills || []), ...extra]);
  const matched = job.requiredSkills.filter((s) => have.has(s));
  const missing = job.requiredSkills.filter((s) => !have.has(s));
  const niceMatched = job.niceSkills.filter((s) => have.has(s));
  const rReq = job.requiredSkills.length ? matched.length / job.requiredSkills.length : 1;
  const rNice = job.niceSkills.length ? niceMatched.length / job.niceSkills.length : 0;

  const interests = profile.interests || [];
  let interest = interests.length ? 0 : 0.4;
  const roleHit = (profile.targetRoles || []).some((r) => tokens(r).some((t) => tokens(job.title).includes(t)));
  if (interests.includes(job.field)) interest = 1;
  else if (roleHit) interest = 0.6;

  const cities = profile.cities || [];
  const cityOk = !cities.length || cities.includes(job.city) || (job.workMode === 'Uzaktan' && profile.remoteOk) ? 1 : 0.2;
  const types = profile.jobTypes || [];
  const typeOk = !types.length || types.includes(job.type) ? 1 : 0;
  const loc = 0.5 * cityOk + 0.5 * typeOk;

  const total = Math.round(60 * rReq + 15 * rNice + 15 * interest + 10 * loc);
  const reasons = [];
  if (matched.length) reasons.push(`${matched.length}/${job.requiredSkills.length} zorunlu beceri sende var: ${matched.slice(0, 3).join(', ')}`);
  if (interests.includes(job.field)) reasons.push(`İlgi alanın: ${job.field}`);
  else if (roleHit) reasons.push('Hedef rollerinle örtüşüyor');
  if (cityOk === 1 && typeOk === 1) reasons.push(job.workMode === 'Uzaktan' ? 'Uzaktan çalışma tercihine uygun' : `${job.city} tercihine uygun`);
  if (niceMatched.length) reasons.push(`Tercih edilen becerilerden ${niceMatched.length} tanesi sende`);
  return {
    total: Math.max(0, Math.min(100, total)), matched, missing, niceMatched,
    parts: { skill: Math.round(rReq * 100), level: Math.round(levelFit(job, profile) * 100), location: Math.round(loc * 100) },
    reasons: reasons.slice(0, 2),
  };
}

export function rankJobs(profile, { type, city, remote, field } = {}) {
  return JOBS
    .filter((j) => (!type || type === 'Tümü' || j.type === type) && (!city || city === 'Tümü' || j.city === city)
      && (!remote || j.workMode === 'Uzaktan') && (!field || field === 'Tümü' || j.field === field))
    .map((job) => ({ job, m: scoreJob(job, profile) }))
    .sort((a, b) => b.m.total - a.m.total || a.job.postedDaysAgo - b.job.postedDaysAgo);
}

// Best before/after score gain a course offers for this profile.
export function courseGain(course, profile) {
  const have = new Set(profile.skills || []);
  const adds = course.skills.filter((s) => !have.has(s));
  if (!adds.length) return null;
  let best = null;
  for (const job of JOBS) {
    const inReq = adds.some((s) => job.requiredSkills.includes(s));
    const inNice = adds.some((s) => job.niceSkills.includes(s));
    if (!inReq && !inNice) continue;
    const before = scoreJob(job, profile);
    const after = scoreJob(job, profile, adds);
    const rank = before.total + (inReq ? 60 : 0);
    if (!best || rank > best.rank) best = { rank, job, before: before.total, after: after.total };
  }
  return best && { job: best.job, before: best.before, after: best.after };
}

export function recommendCourses(profile, n = 4) {
  const ranked = rankJobs(profile).slice(0, 10);
  const wanted = new Set(profile.missingSkills || []);
  ranked.forEach((r) => r.m.missing.forEach((s) => wanted.add(s)));
  return COURSES
    .map((course) => ({
      course, gain: courseGain(course, profile),
      hit: course.skills.filter((s) => wanted.has(s)).length,
      prio: course.skills.filter((s) => (profile.missingSkills || []).includes(s)).length,
    }))
    .filter((x) => x.hit && x.gain)
    .sort((a, b) => b.prio - a.prio || b.hit - a.hit || (b.gain.after - b.gain.before) - (a.gain.after - a.gain.before) || a.course.skills.length - b.course.skills.length)
    .slice(0, n);
}

export const coursesFor = (skill) => COURSES.filter((c) => c.skills.includes(skill));

export function profileStrength(state) {
  const p = state.profile || {};
  let s = 0;
  if (state.cv) s += 25;
  if ((p.skills || []).length >= 5) s += 20;
  if ((p.targetRoles || []).length) s += 15;
  if ((p.interests || []).length) s += 10;
  if ((p.summary || '').length > 20) s += 10;
  if ((p.cities || []).length || p.remoteOk) s += 10;
  if (state.applications.length) s += 10;
  return s;
}
