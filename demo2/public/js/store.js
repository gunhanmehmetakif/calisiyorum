// Persistent user state (localStorage), cleared on logout.
import { SAMPLE_CVS } from '../data/sample-cvs.js';

const KEY = 'calisiyorum.demo2.v1';
const DAY = 86400000;
const empty = () => ({ user: null, cv: null, profile: null, onboarded: false, applications: [], enrolled: [], chat: [], filters: {}, coachOpen: true });

function load() {
  try { return { ...empty(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return empty(); }
}
let state = load();
const subs = new Set();

export const get = () => state;
export const subscribe = (fn) => { subs.add(fn); return () => subs.delete(fn); };
export function set(patch) {
  state = { ...state, ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage blocked */ }
  subs.forEach((fn) => fn(state));
}
export function patchProfile(patch) { set({ profile: { ...state.profile, ...patch } }); }
export function reset() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  state = empty();
}

export function loginDemo() {
  const p = SAMPLE_CVS.elif;
  set({
    ...empty(),
    user: { ...p.form },
    cv: { name: 'elif-kaya-cv.pdf', text: p.text, skills: p.skills, sampleId: 'elif' },
    profile: structuredClone(p.profile),
    onboarded: true,
    applications: [
      { jobId: 'j01', at: Date.now() - 6 * DAY, status: 'İnceleniyor' },
      { jobId: 'j06', at: Date.now() - 12 * DAY, status: 'Mülakat' },
    ],
  });
}

export const hasApplied = (jobId) => state.applications.some((a) => a.jobId === jobId);
