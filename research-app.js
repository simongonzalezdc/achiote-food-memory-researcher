    (function () {
      var ASK = '/ask';                 // same-origin (served from achiote.kyanitelabs.tech)
      var input = document.getElementById('memory');
      var send = document.getElementById('send');
      var output = document.getElementById('output');
      var authRow = document.getElementById('authRow');
      var demoPw = document.getElementById('demoPw');
      var retry = document.getElementById('retry');
      var body = document.body;
      var history = [];

      var CHIP_MAP = {
        "A leaf-wrapped savory bite I can't name": "My Puerto Rican grandma made something that sounded like 'pass-teh-lay.' Savory, pork maybe, wrapped in a leaf. I don't speak Spanish. I live near Orlando.",
        "A cold, cinnamon rice drink over ice": "A cold rice drink from childhood. Cinnamon smell, thin but a little starchy, served over ice. My family is from Mexico but I don't know the name. I'm in Minneapolis.",
        "A sweet white thing my aunt made": "My aunt made a sweet white thing. I think from India. Soft, milky, maybe cardamom. I miss it."
      };
      document.querySelectorAll('.chip').forEach(function (c) {
        c.addEventListener('click', function () { input.value = CHIP_MAP[c.textContent] || c.textContent; input.focus(); });
      });

      function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
      function md(s){ return esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>'); }

      // Parse one COMPLETE SSE event block (delimited by a blank line) into {type, data}.
      // Buffering whole blocks avoids losing the event type when a chunk boundary
      // falls between the `event:` and `data:` lines.
      function parseBlock(block) {
        var type = 'message', dataLines = [];
        var lines = block.split(/\r?\n/);
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          if (line.indexOf(':') === 0) continue;            // SSE comment line
          if (line.indexOf('event:') === 0) type = line.slice(6).trim();
          else if (line.indexOf('data:') === 0) dataLines.push(line.slice(5).replace(/^ /, ''));
        }
        return { type: type, data: dataLines.join('\n') };
      }

      function authHeaders() {
        var h = { 'Content-Type': 'application/json' };
        var key = localStorage.getItem('achiote-api-key');
        var pw = (demoPw.value || localStorage.getItem('achiote-demo-password') || '').trim();
        if (key) h['x-api-key'] = key;
        else if (pw) { h['x-demo-password'] = pw; localStorage.setItem('achiote-demo-password', pw); }
        return h;
      }

      function list(items) {
        if (!Array.isArray(items) || !items.length) return '';
        return '<ul>' + items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul>';
      }

      function group(label, items, extraClass) {
        if (!Array.isArray(items) || !items.length) return '';
        return '<div class="receipt-group ' + (extraClass || '') + '"><span class="label">' + esc(label) + '</span>' + list(items) + '</div>';
      }

      function receiptHTML(r, demo) {
        var ev = r.evidence || {};
        var taste = r.firstTinyTasteTest;
        var html = '<div class="receipt-paper"><h3>Memory Receipt</h3><p class="receipt-meta">' +
          (demo ? 'Sample preview' : 'Generated from your memory') + '</p>';
        html += group('You said', ev.userSaid);
        html += group('Researched', ev.researched);
        html += group('Inferred', ev.inferred);
        html += group('Still unknown', ev.unknown);
        if (taste && (taste.cue || taste.title)) {
          html += '<div class="first-taste"><span class="label">First taste' + (taste.estimatedTime ? ' · ' + esc(taste.estimatedTime) : '') + '</span>' +
            '<p class="cue">' + esc(taste.cue || taste.title) + '</p></div>';
        }
        html += '</div>';
        return html;
      }

      function renderFinal(text, receipt, demo) {
        var html = '';
        if (receipt) html += receiptHTML(receipt, demo);
        if (text) html += '<div class="app-answer">' + md(text) + '</div>';
        if (demo) html += '<span class="demo-flag">Showing a sample — couldn’t reach the live researcher. Tap Reconstruct to retry.</span>';
        output.innerHTML = html || '<div class="app-answer">No result returned. Try rephrasing.</div>';
      }

      var SAMPLE_TEXT = "What I am hearing: a leaf-wrapped, savory, green-starch dish from a Puerto Rican kitchen — \"pass-teh-lay\" is a clue worth keeping, not a spelling to correct.\n\n**Before any specialty shopping**, the first taste below tests whether the memory lives in the pasteles family. If it lands, the next step is to compare regional masa (green banana vs. yautía) and ask family whether it was steamed or boiled.";
      var SAMPLE_RECEIPT = {
        evidence: {
          userSaid: ['Puerto Rican grandma', 'sounded like "pass-teh-lay"', 'savory, possibly pork', 'wrapped in a leaf', 'near Orlando'],
          researched: ['Puerto Rican pasteles use a green-banana/root masa', 'leaf wrappers trap steam and aroma', 'pork is a common filling'],
          inferred: ['Likely a leaf-wrapped masa family dish', 'pork is probably the filling, not the body'],
          unknown: ['Exact masa (green banana vs. yautía)', 'spice profile', 'steamed vs. boiled']
        },
        firstTinyTasteTest: {
          title: 'Green-starch + pork + wrapped aroma',
          estimatedTime: '10 min',
          cue: 'Mash boiled green plantain with salt, oil, and garlic. Warm it beside a spoon of browned pork. Wrap one bite in parchment for a minute so the aroma is trapped — this tests savory green-starch, pork aroma, and the wrapped-food ritual at once.'
        }
      };

      function setLoading(on) {
        if (on) { body.classList.add('is-loading'); send.textContent = 'Researching…'; }
        else { body.classList.remove('is-loading'); send.innerHTML = 'Reconstruct the memory <span class="arrow" aria-hidden="true">&rarr;</span>'; }
      }

      async function ask() {
        var message = input.value.trim();
        if (!message) { input.focus(); return; }
        setLoading(true);
        output.innerHTML = '<div class="placeholder-receipt"><p class="mark">Investigating your memory…</p><p>Weighing sources, separating evidence from inference.</p></div>';
        try {
          var res = await fetch(ASK, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ message: message, history: history, consent: { qualitySignals: false } })
          });
          if (res.status === 401) { authRow.classList.add('show'); output.innerHTML = '<div class="placeholder-receipt"><p class="mark">This server is gated.</p><p>Enter the demo password above, then run it again.</p></div>'; setLoading(false); return; }
          if (!res.ok) throw new Error('status ' + res.status);

          var reader = res.body.getReader();
          var dec = new TextDecoder();
          var buf = '', text = '', receipt = null;

          function dispatch(block) {
            if (!block.trim()) return;
            var e = parseBlock(block);
            if (!e.data) return;
            var d;
            try { d = JSON.parse(e.data); } catch (_) { return; }
            if (e.type === 'text') { text += (typeof d === 'string' ? d : (d.message || d.text || '')); output.innerHTML = '<div class="app-answer">' + md(text) + '</div>'; }
            else if (e.type === 'receipt') { receipt = d; }
            else if (e.type === 'error') { throw new Error(d.message || d.error || 'stream error'); }
          }

          while (true) {
            var r = await reader.read();
            if (r.done) break;
            buf += dec.decode(r.value, { stream: true });
            // Split on the blank-line delimiter, tolerant of LF or CRLF even when a
            // chunk boundary lands inside the delimiter. The trailing element is the
            // (possibly incomplete) next event and stays buffered.
            var parts = buf.split(/\r?\n\r?\n/);
            buf = parts.pop();
            for (var i = 0; i < parts.length; i++) dispatch(parts[i]);
          }
          if (buf.trim()) dispatch(buf);                      // flush a trailing event with no blank line
          history = (history || []).concat([{ role: 'user', content: message }, { role: 'assistant', content: text }]).slice(-20);
          renderFinal(text, receipt, false);
        } catch (err) {
          // Graceful fallback so the page is never broken (local preview / unreachable API)
          renderFinal(SAMPLE_TEXT, SAMPLE_RECEIPT, true);
        } finally {
          setLoading(false);
        }
      }

      send.addEventListener('click', ask);
      retry.addEventListener('click', ask);
      input.addEventListener('keydown', function (e) { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') ask(); });
    })();
