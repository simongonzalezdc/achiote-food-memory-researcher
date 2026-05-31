/* Achiote: conversational food-memory researcher.
   External, CSP-safe (script-src 'self'); no inline handlers.
   Restores: threaded conversation (asks questions, you reply), one continuous
   Memory Receipt, live progress trace, well-formatted results, and voice-to-TEXT
   input (transcription only, no talk-back). */
(function () {
  'use strict';

  var ASK = '/ask';
  function $(id) { return document.getElementById(id); }

  var thread   = $('thread');
  var welcome  = $('welcome');
  var input    = $('composer-input');
  var sendBtn  = $('send-btn');
  var micBtn   = $('mic-btn');
  var vstatus  = $('voice-status');

  var history = [];            // full conversation, sent on every /ask  -> continuity
  var busy = false;
  var recorder = null, chunks = [], voiceReady = false;

  /* ----------------------------- helpers ----------------------------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  // Inline markdown (escape first, then format), XSS-safe.
  function inlineMd(t) {
    return esc(t)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^\*])\*([^\*\n]+)\*/g, '$1<em>$2</em>');
  }
  function shapeAssistantText(s) {
    return String(s == null ? '' : s)
      .replace(/\r\n/g, '\n')
      .replace(/:\s+(1[.)]\s+)/g, ':\n\n$1')
      .replace(/([.!?])\s+(1[.)]\s+)/g, '$1\n\n$2')
      .replace(/(\S)\s+([2-9][.)]\s+)/g, '$1\n$2');
  }
  // Block-level markdown -> proper <p>/<ul>/<ol>/<h3>/<h4> so prose reads as typographic blocks.
  function md(s) {
    var blocks = shapeAssistantText(s).split(/\n{2,}/);
    var out = '';
    blocks.forEach(function (b) {
      var t = b.trim();
      if (!t) return;
      var lines = b.split('\n');
      if (/^###\s+/.test(t)) { out += '<h4>' + inlineMd(t.replace(/^###\s+/, '')) + '</h4>'; return; }
      if (/^##\s+/.test(t))  { out += '<h3>' + inlineMd(t.replace(/^##\s+/, '')) + '</h3>'; return; }
      if (lines.every(function (l) { return !l.trim() || /^\s*[-•*]\s+/.test(l); })) {
        out += '<ul>' + lines.filter(function (l) { return l.trim(); })
          .map(function (l) { return '<li>' + inlineMd(l.replace(/^\s*[-•*]\s+/, '')) + '</li>'; }).join('') + '</ul>';
        return;
      }
      if (lines.every(function (l) { return !l.trim() || /^\s*\d+[.)]\s+/.test(l); })) {
        out += '<ol>' + lines.filter(function (l) { return l.trim(); })
          .map(function (l) { return '<li>' + inlineMd(l.replace(/^\s*\d+[.)]\s+/, '')) + '</li>'; }).join('') + '</ol>';
        return;
      }
      out += '<p>' + inlineMd(t).replace(/\n/g, '<br>') + '</p>';
    });
    return out;
  }
  // Detect the dominant non-Latin script so the chat can render the assistant's reply
  // in the right font (and RTL) when it answers in the user's language.
  function detectLang(s) {
    if (/[一-鿿]/.test(s)) return 'zh';
    if (/[぀-ヿ]/.test(s)) return 'ja';
    if (/[가-힯]/.test(s)) return 'ko';
    if (/[؀-ۿ]/.test(s)) return 'ar';
    if (/[֐-׿]/.test(s)) return 'he';
    if (/[ऀ-ॿ]/.test(s)) return 'hi';
    if (/[ঀ-৿]/.test(s)) return 'bn';
    if (/[฀-๿]/.test(s)) return 'th';
    if (/[஀-௿]/.test(s)) return 'ta';
    if (/[Ѐ-ӿ]/.test(s)) return 'ru';
    return null;
  }
  function scrollDown() {
    if (!thread) return;
    var target = thread.lastElementChild || thread;
    if (target && target.scrollIntoView) target.scrollIntoView({ block: 'end', inline: 'nearest' });
  }

  /* --------------------------- chat messages ------------------------- */
  function addUser(text) {
    var el = document.createElement('div');
    el.className = 'msg user';
    el.textContent = text;          // user content is never HTML
    thread.appendChild(el);
    return el;
  }
  function addAI() {
    var el = document.createElement('div');
    el.className = 'msg ai';
    el.innerHTML = '<div class="typing" aria-label="Achiote is thinking"><span></span><span></span><span></span></div>';
    thread.appendChild(el);
    return el;
  }
  function clearTyping(aiEl) {
    var t = aiEl.querySelector('.typing');
    if (t) t.remove();
  }

  /* ------------------------------ trace ------------------------------ */
  function phaseLabel(d) {
    var tools = Array.isArray(d.tools) ? d.tools : [];
    function has(t) { return tools.indexOf(t) >= 0; }
    if (d.stage === 'thinking') return 'Weighing the evidence';
    if (has('collect_food_memory')) return 'Reading your memory';
    if (has('resolve_dish_name')) return 'Correcting the likely name';
    if (has('search_web') || has('build_research_record') || has('extract_research_findings')) return 'Researching sources';
    if (has('build_reconstruction_dossier')) return 'Separating evidence from inference';
    if (has('generate_minimum_viable_nostalgia')) return 'Building your first taste';
    if (d.stage === 'model') return d.retry ? 'Retrying the model' : 'Thinking';
    if (d.stage === 'calling_tools') return 'Checking which tools to use';
    return 'Working';
  }
  function ensureTrace(aiEl) {
    var trace = aiEl.querySelector('.trace');
    if (!trace) {
      clearTyping(aiEl);
      trace = document.createElement('div');
      trace.className = 'trace';
      var head = document.createElement('div');
      head.className = 'trace-head';
      head.textContent = 'What Achiote is doing';
      var list = document.createElement('div');
      list.className = 'trace-list';
      trace.appendChild(head);
      trace.appendChild(list);
      aiEl.appendChild(trace);
    }
    return trace.querySelector('.trace-list');
  }
  function addTrace(list, type, d) {
    var item = document.createElement('div');
    item.className = 'trace-item ' + type;
    var label;
    if (type === 'status') label = phaseLabel(d);
    else if (type === 'tool_call') label = 'Calling ' + (d.name || 'tool');
    else if (type === 'tool_result') label = 'Finished ' + (d.name || 'tool');
    else label = 'Note: ' + (d.message || d.error || 'issue');
    item.textContent = label;
    list.appendChild(item);
    list.scrollTop = list.scrollHeight;
  }

  /* --------------------------- the receipt --------------------------- */
  function group(label, items) {
    if (!Array.isArray(items) || !items.length) return '';
    return '<div class="r-group"><span class="r-label">' + esc(label) + '</span><ul>' +
      items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul></div>';
  }
  function renderReceipt(aiEl, r, hasText) {
    if (!r) return;
    var ev = r.evidence || {};
    var qs = Array.isArray(r.nextBestQuestions) ? r.nextBestQuestions : [];
    var taste = r.firstTinyTasteTest;
    // A real reconstruction has researched/inferred facts or a first taste, NOT just a
    // userSaid echo. A clarifying turn only echoes userSaid + asks questions.
    var hasReconstruction = (Array.isArray(ev.researched) && ev.researched.length) ||
      (Array.isArray(ev.inferred) && ev.inferred.length) ||
      !!(taste && (taste.cue || taste.title));
    // Pure clarifying turn: don't show a half-empty "Memory Receipt"; the prose already asked.
    if (/needs_more|clarif/i.test(String(r.status || '')) && !hasReconstruction) {
      if (hasText || !qs.length) return;
      var b = document.createElement('div');
      b.className = 'ai-text';
      b.innerHTML = '<strong>A few quick things and I can get started:</strong><br>• ' +
        qs.map(function (q) { return esc(q); }).join('<br>• ');
      aiEl.appendChild(b);
      return;
    }
    var html = '<div class="receipt-paper" role="group" aria-label="Memory Receipt">';
    html += '<h3>Memory Receipt</h3>';
    html += '<p class="r-meta">' + esc(r.status ? String(r.status) : 'Generated from your memory') + '</p>';
    html += group('You said', ev.userSaid);
    html += group('Researched', ev.researched);
    html += group('Inferred', ev.inferred);
    html += group('Still unknown', ev.unknown);
    if (qs.length) {
      html += '<div class="r-questions"><span class="r-label">A few questions to get this right</span><ol>' +
        qs.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ol>' +
        '<p class="r-hint">Answer any of these below, and I’ll keep building this same receipt.</p></div>';
    }
    if (taste && (taste.cue || taste.title)) {
      html += '<div class="r-taste"><span class="r-label">First taste' +
        (taste.estimatedTime ? ' · ' + esc(taste.estimatedTime) : '') + '</span>' +
        '<p class="cue">' + esc(taste.cue || taste.title) + '</p></div>';
    }
    html += '</div>';
    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    aiEl.appendChild(wrap.firstChild);
  }

  /* ------------------------- SSE stream parse ------------------------ */
  function parseBlock(block) {
    var type = 'message', dataLines = [];
    var lines = block.split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (line.indexOf(':') === 0) continue;                 // comment
      if (line.indexOf('event:') === 0) type = line.slice(6).trim();
      else if (line.indexOf('data:') === 0) dataLines.push(line.slice(5).replace(/^ /, ''));
    }
    return { type: type, data: dataLines.join('\n') };
  }

  function streamInto(res, aiEl, userText) {
    var reader = res.body.getReader();
    var dec = new TextDecoder();
    var buf = '', text = '', receipt = null, contentEl = null;

    function content() {
      if (!contentEl) {
        clearTyping(aiEl);
        contentEl = document.createElement('div');
        contentEl.className = 'ai-text';
        aiEl.appendChild(contentEl);   // prose sits after the live trace (trace -> text -> receipt)
      }
      return contentEl;
    }
    function handle(block) {
      if (!block.trim()) return;
      var ev = parseBlock(block);
      if (!ev.data) return;
      var d;
      try { d = JSON.parse(ev.data); } catch (_) { return; }
      if (ev.type === 'status' || ev.type === 'tool_call' || ev.type === 'tool_result') {
        addTrace(ensureTrace(aiEl), ev.type, d);
      } else if (ev.type === 'text') {
        text += (typeof d === 'string') ? d : (d.message || d.text || '');
        content().innerHTML = md(text);
      } else if (ev.type === 'receipt') {
        receipt = d;
      } else if (ev.type === 'error') {
        addTrace(ensureTrace(aiEl), 'error', d);
      }
    }

    return (function pump() {
      return reader.read().then(function (r) {
        if (r.done) {
          if (buf.trim()) handle(buf);
          clearTyping(aiEl);
          aiEl.classList.add('complete');
          // App meets you in your language: tag the reply's script so it gets the right font + RTL.
          var lg = detectLang(text);
          if (lg) { aiEl.setAttribute('lang', lg); if (lg === 'ar' || lg === 'he') aiEl.setAttribute('dir', 'rtl'); }
          if (receipt) renderReceipt(aiEl, receipt, !!text);
          if (!text && !receipt) {
            content().textContent = 'No response came back. Try rephrasing the memory.';
          }
          // continuity: extend the single ongoing conversation
          history = history.concat([
            { role: 'user', content: userText },
            { role: 'assistant', content: text || '(memory receipt)' }
          ]).slice(-20);
          scrollDown();
          return;
        }
        buf += dec.decode(r.value, { stream: true });
        var parts = buf.split(/\r?\n\r?\n/);
        buf = parts.pop();
        for (var i = 0; i < parts.length; i++) handle(parts[i]);
        scrollDown();
        return pump();
      });
    })();
  }

  /* ------------------------------ auth ------------------------------- */
  function headers() {
    return { 'Content-Type': 'application/json' };
  }

  /* --------------------------- send / run ---------------------------- */
  function run(aiEl, message) {
    busy = true; sendBtn.disabled = true;
    return fetch(ASK, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ message: message, history: history, consent: { qualitySignals: false } })
    }).then(function (res) {
      if (!res.ok) throw new Error('status ' + res.status);
      return streamInto(res, aiEl, message);
    }).catch(function (err) {
      clearTyping(aiEl);
      var e = document.createElement('div');
      e.className = 'ai-text err';
      e.textContent = 'Something interrupted the researcher. Give it another try in a moment.';
      aiEl.appendChild(e);
    }).then(function () {
      busy = false; sendBtn.disabled = false; input.focus();
    });
  }

  function send(text) {
    var val = (text != null ? text : input.value).trim();
    if (!val || busy) return;
    input.value = '';
    if (welcome) welcome.classList.add('hide');
    thread.classList.add('active');
    addUser(val);
    var aiEl = addAI();
    scrollDown();
    run(aiEl, val);
  }

  /* --------------------------- voice (STT) --------------------------- */
  function initVoice() {
    if (!micBtn) return;
    micBtn.hidden = true;
    fetch('/voice/status').then(function (r) { return r.ok ? r.json() : null; }).then(function (cfg) {
      var ready = cfg && cfg.stt && cfg.stt.ready;
      var canRecord = navigator.mediaDevices && navigator.mediaDevices.getUserMedia && typeof MediaRecorder !== 'undefined';
      if (!ready || !canRecord) return;            // progressive enhancement
      voiceReady = true;
      micBtn.hidden = false;
    }).catch(function () { /* mic stays hidden; chat works */ });
  }
  function b64(blob) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () { resolve(String(fr.result || '').split(',')[1] || ''); };
      fr.onerror = function () { reject(new Error('read')); };
      fr.readAsDataURL(blob);
    });
  }
  function toggleMic() {
    if (!voiceReady) return;
    if (recorder && recorder.state === 'recording') { recorder.stop(); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      chunks = [];
      recorder = new MediaRecorder(stream);
      recorder.addEventListener('dataavailable', function (e) { if (e.data.size > 0) chunks.push(e.data); });
      recorder.addEventListener('stop', function () {
        stream.getTracks().forEach(function (t) { t.stop(); });
        micBtn.classList.remove('recording');
        micBtn.setAttribute('aria-pressed', 'false');
        transcribe(new Blob(chunks, { type: (recorder && recorder.mimeType) || 'audio/webm' }));
      });
      micBtn.classList.add('recording');
      micBtn.setAttribute('aria-pressed', 'true');
      if (vstatus) vstatus.textContent = 'Listening… tap the mic again to stop.';
      recorder.start();
    }).catch(function () {
      if (vstatus) vstatus.textContent = 'Microphone permission is needed for voice input.';
    });
  }
  function transcribe(blob) {
    if (vstatus) vstatus.textContent = 'Transcribing…';
    b64(blob).then(function (audioBase64) {
      return fetch('/voice/transcribe', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ audioBase64: audioBase64, mediaType: blob.type || 'audio/webm', language: 'auto' })
      });
    }).then(function (r) { if (!r.ok) throw new Error('stt'); return r.json(); })
      .then(function (body) {
        input.value = (input.value ? input.value + ' ' : '') + (body.text || '');
        input.focus();
        if (vstatus) vstatus.textContent = 'Transcript ready. Fix any names or spelling, then send.';
      })
      .catch(function () { if (vstatus) vstatus.textContent = 'Could not transcribe that. Try typing instead.'; });
  }

  /* ----------------------------- wire up ----------------------------- */
  sendBtn.addEventListener('click', function () { send(); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey && !busy) { e.preventDefault(); send(); }
  });
  if (micBtn) micBtn.addEventListener('click', toggleMic);
  Array.prototype.forEach.call(document.querySelectorAll('.suggestion'), function (b) {
    b.addEventListener('click', function () { send(b.getAttribute('data-fill') || b.textContent); });
  });

  initVoice();
})();
