/* Shared prototype behavior: signal actions, modals, toasts, review-trail updates. */

const SIGNALS = {
  '8k': {
    short: 'SEC 8-K: material cybersecurity incident',
    vendorContact: 'security@meridianpayroll.com (Trust and Compliance inbox)',
    owner: 'Dana Whitfield (People Operations)',
    inquiryQuestions: [
      'Your 8-K filed on Aug 18, 2026 reports unauthorized access to production systems. Was any Vellamont employee data (SSNs, bank account numbers, compensation records) within the affected environment?',
      'Per clause 9.3 of our DPA you are required to notify us within 72 hours of a confirmed incident affecting our data. Please confirm whether that notification obligation has been triggered, and if so, when we should expect formal notice.',
      'What containment and forensic steps are complete, which are in progress, and who is your engaged incident response firm?'
    ],
    inquiryContext: 'Questions drafted by Watchtower from the 8-K filing, your questionnaire answers (Q4.2), and DPA clause 9.3. Edit freely before sending.',
    notifyDraft: 'Hi Dana, flagging a developing situation with Meridian Payroll Systems (your vendor for payroll processing). They filed an SEC 8-K this morning reporting a material cybersecurity incident. We have sent them a formal inquiry about whether our employee data is affected and will keep you updated here. No action needed from you yet; please hold off on escalating to them directly so we keep one channel.',
    issueTitle: 'Meridian Payroll: reported cybersecurity incident (SEC 8-K, Aug 18 2026)',
    issueDesc: 'Meridian Payroll Systems filed an 8-K (Item 1.05) on Aug 18, 2026 disclosing a material cybersecurity incident. Meridian is Tier 1 and processes payroll for 4,200 employees, holding SSNs, bank account numbers, and compensation data (Questionnaire 2026, Q4.2). A related leak-site listing was observed on Aug 11. Awaiting vendor response to ad hoc inquiry.'
  },
  'leak': {
    short: 'Leak-site listing referencing meridianpayroll.com',
    vendorContact: 'security@meridianpayroll.com (Trust and Compliance inbox)',
    owner: 'Dana Whitfield (People Operations)',
    inquiryQuestions: [
      'A listing on a known extortion leak site references meridianpayroll.com with a claimed 2.1 TB of exfiltrated data. Are you aware of this listing, and does it relate to the incident disclosed in your Aug 18 8-K?',
      'Has any data belonging to your customers appeared in the published sample set?'
    ],
    inquiryContext: 'Questions drafted by Watchtower from the leak-site observation and the related 8-K filing. Edit freely before sending.',
    notifyDraft: 'Hi Dana, heads up that a leak-site listing referencing Meridian Payroll appeared last week and now appears connected to the incident in their SEC filing today. We are handling the vendor outreach; will update you here.',
    issueTitle: 'Meridian Payroll: leak-site listing claiming exfiltrated data',
    issueDesc: 'A listing on the cl0p leak site dated Aug 11, 2026 references meridianpayroll.com with a claimed 2.1 TB of data. Corroborated by the vendor 8-K filed Aug 18, 2026.'
  }
};

/* Correlated signals: outbound actions (inquiry, notify, issue) can cover the related
   signal in one motion. Judgment actions (accept, dismiss) stay strictly per-signal. */
const RELATED = { '8k': 'leak', 'leak': '8k' };

let CURRENT = { action: null, signal: null };

function relatedCheckboxHTML(signalId) {
  const rel = RELATED[signalId];
  if (!rel || !SIGNALS[rel]) return '';
  return `<div class="radio-row" style="margin-top:0.25rem"><input type="checkbox" checked id="also-related">
    <label for="also-related" style="margin:0;font-weight:400">Also covers the related signal: ${SIGNALS[rel].short} <span class="muted">(logged on both review records)</span></label></div>`;
}
function alsoRelatedChecked() {
  const box = document.getElementById('also-related');
  return box ? box.checked : false;
}

/* ---------- modal plumbing ---------- */
function ensureShell() {
  if (document.getElementById('proto-modal')) return;
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="modal-backdrop" id="proto-modal">
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-head">
          <div>
            <h3 id="pm-title"></h3>
            <div class="modal-sub" id="pm-sub"></div>
          </div>
          <button class="modal-close" onclick="closeModal()" aria-label="Close">✕</button>
        </div>
        <div class="modal-body" id="pm-body"></div>
        <div class="modal-foot" id="pm-foot"></div>
      </div>
    </div>
    <div class="toast-wrap" id="proto-toasts"></div>`;
  document.body.appendChild(wrap);
  document.getElementById('proto-modal').addEventListener('click', (e) => {
    if (e.target.id === 'proto-modal') closeModal();
  });
}

function openModal(title, sub, bodyHTML, footHTML) {
  ensureShell();
  document.getElementById('pm-title').textContent = title;
  document.getElementById('pm-sub').textContent = sub || '';
  document.getElementById('pm-body').innerHTML = bodyHTML;
  document.getElementById('pm-foot').innerHTML = footHTML;
  document.getElementById('proto-modal').classList.add('open');
}
function closeModal() {
  const m = document.getElementById('proto-modal');
  if (m) m.classList.remove('open');
}
function toast(msg) {
  ensureShell();
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span class="tick">✓</span><span>${msg}</span>`;
  document.getElementById('proto-toasts').appendChild(t);
  setTimeout(() => t.remove(), 5200);
}

/* ---------- state updates ---------- */
function setStatus(signalId, cls, label) {
  document.querySelectorAll(`[data-status="${signalId}"]`).forEach((el) => {
    el.className = `badge ${cls}`;
    el.textContent = label;
  });
}
function addTrail(signalId, html) {
  document.querySelectorAll(`[data-trail="${signalId}"]`).forEach((el) => {
    const li = document.createElement('li');
    li.innerHTML = html;
    el.appendChild(li);
  });
}
function requireText(inputId, buttonId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(buttonId);
  const check = () => { btn.disabled = input.value.trim().length < 4; };
  input.addEventListener('input', check);
  check();
}
function today() { return 'Aug 18, 2026'; }

/* ---------- actions ---------- */
function act(action, signalId) {
  CURRENT = { action, signal: signalId };
  const s = SIGNALS[signalId] || SIGNALS['8k'];
  if (action === 'inquiry') {
    const qs = s.inquiryQuestions.map((q, i) => `
      <div class="field">
        <label>Question ${i + 1}</label>
        <textarea rows="3" id="inq-q${i}">${q}</textarea>
      </div>`).join('');
    openModal('Send ad hoc inquiry', `To: ${s.vendorContact}`, `
      <div class="ai-note"><span>✦</span><span>${s.inquiryContext}</span></div>
      ${qs}
      <div class="field">
        <label>Response due <span class="hint">(vendor sees this deadline)</span></label>
        <select><option>5 business days (Aug 25, 2026)</option><option>3 business days (Aug 21, 2026)</option><option>10 business days</option></select>
      </div>
      ${relatedCheckboxHTML(signalId)}`, `
      <span class="foot-note">Creates inquiry INQ-1042 on this vendor. Nothing is sent until you approve.</span>
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="finishInquiry()">Approve and send</button>`);
  }
  if (action === 'notify') {
    openModal('Notify business owner', `To: ${s.owner}`, `
      <div class="ai-note"><span>✦</span><span>Note drafted by Watchtower from this signal. Edit before sending.</span></div>
      <div class="field"><label>Message</label><textarea rows="6" id="notify-msg">${s.notifyDraft}</textarea></div>
      ${relatedCheckboxHTML(signalId)}`, `
      <span class="foot-note">Logged on this signal and on the vendor record.</span>
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="finishNotify()">Send notification</button>`);
  }
  if (action === 'issue') {
    openModal('Open issue', 'Creates a record in Issues on this vendor', `
      <div class="field"><label>Title</label><input type="text" value="${s.issueTitle}"></div>
      <div class="field"><label>Severity</label><select><option>High</option><option>Critical</option><option>Medium</option></select></div>
      <div class="field"><label>Description <span class="hint">(drafted from signal, editable)</span></label>
        <textarea rows="5">${s.issueDesc}</textarea></div>
      ${relatedCheckboxHTML(signalId)}`, `
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="finishIssue()">Create issue</button>`);
  }
  if (action === 'accept') {
    openModal('Accept risk', 'Requires a documented rationale', `
      <div class="field"><label>Rationale <span class="hint">(required, kept on the review record)</span></label>
        <textarea rows="4" id="accept-reason" placeholder="Why is this risk acceptable for this vendor, in this context?"></textarea></div>
      <div class="field"><label>Re-evaluate</label>
        <select><option>On any new related signal</option><option>In 90 days</option><option>At next scheduled review</option></select></div>`, `
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" id="accept-btn" onclick="finishAccept()">Accept risk</button>`);
    requireText('accept-reason', 'accept-btn');
  }
  if (action === 'watch') {
    openModal('Watch this signal', 'Auto-resurfaces, never silently expires', `
      <div class="field"><label>Resurface</label>
        <div class="radio-row"><input type="radio" name="snz" checked id="snz1"><label for="snz1" style="margin:0;font-weight:400">On any new related signal</label></div>
        <div class="radio-row"><input type="radio" name="snz" id="snz2"><label for="snz2" style="margin:0;font-weight:400">In 7 days (Aug 25, 2026)</label></div>
        <div class="radio-row"><input type="radio" name="snz" id="snz3"><label for="snz3" style="margin:0;font-weight:400">In 14 days (Sep 1, 2026)</label></div>
      </div>
      <div class="field"><label>Note <span class="hint">(optional)</span></label>
        <textarea rows="2" placeholder="What are you waiting for?"></textarea></div>`, `
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="finishWatch()">Watch</button>`);
  }
  if (action === 'dismiss') {
    openModal('Dismiss as not relevant', 'Requires a reason, kept on the review record', `
      <div class="field"><label>Reason <span class="hint">(required)</span></label>
        <textarea rows="3" id="dismiss-reason" placeholder="Why does this signal not matter for this vendor?"></textarea></div>
      <div class="radio-row"><input type="checkbox" checked id="train-check">
        <label for="train-check" style="margin:0;font-weight:400">Use this to tune future grading for this vendor</label></div>`, `
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" id="dismiss-btn" onclick="finishDismiss()">Dismiss signal</button>`);
    requireText('dismiss-reason', 'dismiss-btn');
  }
}

function finishInquiry() {
  const coverRelated = alsoRelatedChecked();
  closeModal();
  setStatus(CURRENT.signal, 'teal', 'Inquiry sent · awaiting vendor');
  addTrail(CURRENT.signal, `<strong>Inquiry INQ-1042 approved and sent</strong> to vendor security contact by you · ${today()}, 9:14 AM`);
  const rel = RELATED[CURRENT.signal];
  if (coverRelated && rel) {
    setStatus(rel, 'teal', 'Covered by INQ-1042');
    addTrail(rel, `<strong>Covered by inquiry INQ-1042</strong>, sent on the related signal by you · ${today()}, 9:14 AM`);
    toast('Inquiry INQ-1042 sent. It covers both related signals; Watchtower will evaluate the response.');
  } else {
    toast('Inquiry INQ-1042 sent. Watchtower will evaluate the response when it arrives.');
  }
}
function finishNotify() {
  const coverRelated = alsoRelatedChecked();
  closeModal();
  addTrail(CURRENT.signal, `<strong>Business owner notified</strong> (Dana Whitfield) by you · ${today()}, 9:14 AM`);
  const rel = RELATED[CURRENT.signal];
  if (coverRelated && rel) addTrail(rel, `<strong>Business owner notified</strong> via the related signal · ${today()}, 9:14 AM`);
  toast('Notification sent to Dana Whitfield and logged on this signal.');
}
function finishIssue() {
  const coverRelated = alsoRelatedChecked();
  closeModal();
  addTrail(CURRENT.signal, `<strong>Issue ISS-2087 opened</strong> from this signal by you · ${today()}, 9:14 AM`);
  const rel = RELATED[CURRENT.signal];
  if (coverRelated && rel) addTrail(rel, `<strong>Issue ISS-2087 also covers this signal</strong>, opened from the related signal · ${today()}, 9:14 AM`);
  toast('Issue ISS-2087 created. It appears in this vendor’s Issues tab.');
}
function finishAccept() {
  closeModal();
  setStatus(CURRENT.signal, 'green', 'Risk accepted');
  addTrail(CURRENT.signal, `<strong>Risk accepted</strong> by you, rationale on record · ${today()}, 9:14 AM`);
  toast('Risk accepted. Rationale saved to the review record.');
}
function finishWatch() {
  closeModal();
  setStatus(CURRENT.signal, 'yellow', 'Watching');
  addTrail(CURRENT.signal, `<strong>Watching</strong> set by you, resurfaces on any new related signal · ${today()}, 9:14 AM`);
  toast('Watching. This signal auto-resurfaces; it cannot silently expire.');
}
function finishDismiss() {
  closeModal();
  setStatus(CURRENT.signal, 'gray', 'Dismissed');
  addTrail(CURRENT.signal, `<strong>Dismissed</strong> by you, reason on record, grading tuned · ${today()}, 9:14 AM`);
  document.querySelectorAll(`[data-signal-card="${CURRENT.signal}"]`).forEach((el) => el.classList.add('dimmed'));
  toast('Dismissed with reason. Watchtower will grade similar signals lower for this vendor.');
}

/* quarantine */
function quarantineConfirm() {
  setStatus('quar', 'green', 'Confirmed ours');
  toast('Match confirmed. Signal moved into the queue and graded against this vendor.');
}
function quarantineReject() {
  openModal('Not our vendor', 'Trains entity matching for Meridian Payroll Systems', `
    <div class="field"><label>What gave it away? <span class="hint">(one click, improves matching)</span></label>
      <div class="radio-row"><input type="radio" name="qr" checked id="qr1"><label for="qr1" style="margin:0;font-weight:400">Different company, similar name</label></div>
      <div class="radio-row"><input type="radio" name="qr" id="qr2"><label for="qr2" style="margin:0;font-weight:400">Wrong jurisdiction or domain</label></div>
      <div class="radio-row"><input type="radio" name="qr" id="qr3"><label for="qr3" style="margin:0;font-weight:400">Other</label></div>
    </div>`, `
    <button class="btn" onclick="closeModal()">Cancel</button>
    <button class="btn primary" onclick="finishQuarantineReject()">Release match</button>`);
}
function finishQuarantineReject() {
  closeModal();
  setStatus('quar', 'gray', 'Released · matcher updated');
  document.querySelectorAll('[data-signal-card="quar"]').forEach((el) => el.classList.add('dimmed'));
  toast('Released. Watchtower will not re-link this entity to Meridian Payroll Systems.');
}

/* cadence proposal */
function cadenceConfirm() {
  setStatus('cadence', 'green', 'Review moved to Sep 15, 2026');
  addTrail('cadence', `<strong>Next review moved</strong> to Sep 15, 2026 by you · ${today()}, 9:14 AM`);
  document.querySelectorAll('[data-cadence-actions]').forEach((el) => el.remove());
  toast('Next scheduled review moved to Sep 15, 2026 on the Lifecycle schedule.');
}
function cadenceKeep() {
  setStatus('cadence', 'gray', 'Kept Feb 12, 2027');
  addTrail('cadence', `<strong>Proposal declined</strong>, next review kept at Feb 12, 2027, by you · ${today()}, 9:14 AM`);
  document.querySelectorAll('[data-cadence-actions]').forEach((el) => el.remove());
  toast('Keeping Feb 12, 2027. The proposal and your decision are logged.');
}

/* expanding cards */
function toggleExpand(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('open');
}

/* citation stub */
function openCite(label) {
  toast(`Opens source: ${label} (new tab in the real product).`);
  return false;
}
