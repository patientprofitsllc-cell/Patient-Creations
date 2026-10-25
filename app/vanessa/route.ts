// A private page for customers to talk with Vanessa, the discovery-call agent (ElevenLabs). It is not linked from the site
// and is kept out of search: the owner shares the link (for example in the Calendly invite) and each call is transcribed
// and summarised into notes (pain points, interests, perspective) in the agent's Conversations tab in ElevenLabs.
// The agent only accepts patientcreations.com, www.patientcreations.com and localhost. The conversation costs credits, so
// the page only opens with a valid signed link (made by the homepage fit form, or by hand with scripts/vanessa-link.ts);
// without one it shows a short page pointing to the form.
import { CALENDLY_URL } from "@/lib/config/calendly";
import { CONTACT_PHONE_DIGITS, CONTACT_PHONE_DISPLAY } from "@/lib/config/site";
import { verifyVanessaToken } from "@/lib/site/vanessaAccess";

export const dynamic = "force-dynamic";

const AGENT_ID = "agent_0001m5gqd0krfpzt77s16hngzhj2";
const SDK_URL = "https://cdn.jsdelivr.net/npm/@elevenlabs/client@1.26.0/dist/lib.iife.js";

// The page's script is plain ES5 with no backticks or dollar-brace sequences, so it can sit inside this template unescaped.
// Backslashes are doubled because this is a template literal.
const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Talk with Vanessa | Patient Creations</title>
<meta name="robots" content="noindex, nofollow, noai, noimageai" />
<meta name="theme-color" content="#172015" />
<link rel="icon" href="/icon.png" type="image/png" />
<link rel="preload" href="/assets/experience/inter-latin-400-normal.dd05e326cf.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/assets/experience/instrument-serif-latin-400-italic.1d6e1bd7bc.woff2" as="font" type="font/woff2" crossorigin />
<link rel="stylesheet" href="/assets/experience/styles.4e579c4b3c.css" />
<style>
#vanessa{background:#f7f6f1;padding-top:150px;padding-bottom:90px;text-align:center;min-height:calc(100vh - 80px)}
#vanessa h2{margin:0 auto 14px;max-width:16ch;text-wrap:balance}
#vanessa .lede{color:#4f5546;max-width:46ch;margin:0 auto 34px}
.orb{--lvl:0;display:block;margin:0 auto 14px;width:clamp(170px,38vw,230px);aspect-ratio:1;border:0;padding:0;border-radius:50%;cursor:pointer;position:relative;background:transparent;color:#1a1206;font:600 15px var(--font-body);letter-spacing:.02em;transform:scale(calc(.94 + var(--lvl)*.12));transition:transform .12s ease-out}
.orb::before{content:"";position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 34% 28%,#fff3d4 0%,var(--pc-sand) 34%,#8a6a35 70%,#120c03 100%);box-shadow:0 0 calc(30px + var(--lvl)*70px) rgba(239,203,140,.45),inset 0 -18px 40px rgba(0,0,0,.35)}
.orb span{position:relative;z-index:1}
.state{min-height:1.5em;margin:0 0 22px;color:#666b5b;font-size:14px}
.log{display:flex;flex-direction:column;gap:8px;text-align:left;max-width:620px;margin:0 auto 18px;max-height:340px;overflow-y:auto;padding:2px}
.log:empty{display:none}
.msg{max-width:86%;padding:10px 14px;border-radius:18px;line-height:1.45;overflow-wrap:anywhere}
.msg.ava{background:rgba(44,56,34,.05);border:1px solid var(--line);align-self:flex-start;border-bottom-left-radius:6px}
.msg.you{background:var(--pc-ink);color:#f7f6f1;align-self:flex-end;border-bottom-right-radius:6px}
.msg a{color:var(--gold-ink);font-weight:600;text-underline-offset:3px}
#vanessa form{display:flex;gap:8px;align-items:center;max-width:620px;margin:0 auto 10px}
#vanessa input{flex:1;min-width:0;background:rgba(44,56,34,.05);border:1px solid var(--line);color:inherit;font:inherit;border-radius:999px;padding:12px 18px;min-height:48px}
#vanessa input:focus-visible{border-color:var(--gold-ink)}
#vanessa .pill{height:44px;padding:0 8px 0 20px;border:0;font-family:inherit;font-size:14px;cursor:pointer}
#vanessa .pill i{width:28px;height:28px}
.pill[hidden]{display:none}
.fine{margin:28px auto 0;max-width:54ch;color:#666b5b;font-size:12.5px}
.fine a{color:inherit}
.sr{position:absolute;left:-999px}
@media (prefers-reduced-motion:reduce){.orb{transition:none;transform:none}}
</style>
</head>
<body>
  <header class="topbar">
    <a class="brand" href="/" aria-label="Patient Creations home">
      <img src="/assets/experience/logo-mark.3db18278b5.webp" alt="" width="28" height="28" />
      <span>patient<br />creations.</span>
    </a>
  </header>
  <main>
    <section id="vanessa" aria-labelledby="title">
      <p class="kicker">Discovery conversation</p>
      <h2 id="title">Talk with <em>Vanessa.</em></h2>
      <p class="lede">A calm, no-pressure conversation about your business. Vanessa listens, asks a few questions, and takes notes so our team knows exactly how to help. Talk or type, whichever is easier.</p>
      <button class="orb" type="button" aria-label="Talk to Vanessa by voice"><span class="orb-label">Talk to Vanessa</span></button>
      <p class="state" aria-live="polite">Tap Vanessa to talk, or type below.</p>
      <div class="log" role="log" aria-live="polite" aria-label="Conversation with Vanessa"></div>
      <form autocomplete="off">
        <label class="sr" for="v-input">Message Vanessa</label>
        <input id="v-input" type="text" maxlength="500" placeholder="Type to Vanessa…" />
        <button class="pill" type="submit">Send <i aria-hidden="true">›</i></button>
        <button class="pill pill-line v-end" type="button" hidden>End <i aria-hidden="true">×</i></button>
      </form>
      <div class="cta-row center" style="margin-top:26px">
        <a class="pill pill-line" href="__CALENDLY__" target="_blank" rel="noopener">Book a time with the team <i aria-hidden="true">›</i></a>
      </div>
      <p class="fine">Vanessa is an AI assistant. This conversation is recorded and transcribed so our team can follow up with you; please don't share card numbers or passwords. Prefer a person? Call or text <a href="tel:__PHONE_DIGITS__">__PHONE__</a>.</p>
    </section>
  </main>
  <footer class="footer">
    <div class="footer-base">
      <span>© Patient Profits LLC. Patient Creations™ is a trademark of Patient Profits LLC.</span>
      <nav aria-label="Legal"><a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="/refunds">Refunds</a><a href="/copyright">Copyright</a></nav>
    </div>
  </footer>
<script>
(function(){
  var AGENT_ID = '__AGENT_ID__';
  var SDK_URL = '__SDK_URL__';
  var PHONE = '__PHONE__';
  var LINK_HOSTS = /^https:\\/\\/((www\\.)?patientcreations\\.com|calendly\\.com)(\\/|$)/i;
  var root = document.getElementById('vanessa'); if (root.dataset.ready) return; root.dataset.ready = '1';
  var $ = function(s){ return root.querySelector(s); };
  var orb = $('.orb'), label = $('.orb-label'), stateEl = $('.state'), log = $('.log'), form = $('form'), input = $('input'), endBtn = $('.v-end');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var conv = null, mode = null, starting = null, raf = 0, queued = [], typed = [], speaking = false;
  function cleanText(t){ return String(t || '').replace(/\\[(?:warm|curious|empathetic|thoughtful|reassuring|excited|confident|playful|laughs softly|laughs|sighs)\\]\\s*/gi, '').replace(/\\[[a-z ]{2,24}\\](?!\\()\\s*/gi, '').trim(); }
  var norm = function(t){ return cleanText(t).toLowerCase().replace(/[^a-z]/g, ''); };
  function setState(t){ stateEl.textContent = t; }
  function render(el, text){
    var re = /\\[([^\\]]{1,80})\\]\\((https?:\\/\\/[^\\s)]+)\\)/g, last = 0, m;
    while ((m = re.exec(text))) {
      el.appendChild(document.createTextNode(text.slice(last, m.index)));
      if (LINK_HOSTS.test(m[2])) { var a = document.createElement('a'); a.href = m[2]; a.textContent = m[1]; if (!/patientcreations\\.com/i.test(m[2])) { a.target = '_blank'; a.rel = 'noopener'; } el.appendChild(a); }
      else el.appendChild(document.createTextNode(m[1]));
      last = re.lastIndex;
    }
    el.appendChild(document.createTextNode(text.slice(last)));
  }
  function add(who, text){
    text = who === 'ava' ? cleanText(text) : String(text || '').trim(); if (!text) return;
    var d = document.createElement('div'); d.className = 'msg ' + who;
    if (who === 'you') d.textContent = text; else render(d, text);
    log.appendChild(d); log.scrollTop = log.scrollHeight;
  }
  function loadSdk(){
    if (window.ElevenLabsClient && window.ElevenLabsClient.Conversation) return Promise.resolve(window.ElevenLabsClient);
    return new Promise(function(res, rej){
      var s = document.createElement('script'); s.src = SDK_URL; s.async = true;
      s.onload = function(){ window.ElevenLabsClient ? res(window.ElevenLabsClient) : rej(new Error('sdk')); };
      s.onerror = function(){ rej(new Error('sdk')); }; document.head.appendChild(s);
    });
  }
  function meter(){
    cancelAnimationFrame(raf);
    (function tick(){
      if (!conv) { orb.style.setProperty('--lvl', 0); return; }
      var v = 0; try { v = speaking ? conv.getOutputVolume() : (mode === 'voice' ? conv.getInputVolume() * .6 : 0); } catch(e){}
      orb.style.setProperty('--lvl', reduce ? 0 : Math.min(1, v * 1.6).toFixed(3));
      raf = requestAnimationFrame(tick);
    })();
  }
  function setUi(on){
    endBtn.hidden = !on; label.textContent = on ? (mode === 'voice' ? 'Listening' : 'Vanessa') : 'Talk to Vanessa';
    orb.setAttribute('aria-label', on ? 'End the conversation with Vanessa' : 'Talk to Vanessa by voice');
    if (!on) speaking = false;
  }
  function start(kind, note){
    if (conv && mode === kind) return Promise.resolve(conv);
    if (starting) return starting;
    setState(note || (kind === 'voice' ? 'Connecting to Vanessa… allow the microphone if asked.' : 'Connecting to Vanessa…'));
    starting = loadSdk().then(function(SDK){
      var opts = {
        agentId: AGENT_ID,
        onConnect: function(){ setState(kind === 'voice' ? 'Vanessa is listening. Go ahead and talk.' : (note || 'Vanessa is here. Type whenever you like.')); },
        onDisconnect: function(){ conv = null; mode = null; setUi(false); setState('Conversation ended. Tap Vanessa to start again.'); },
        onError: function(){ setState('Something went wrong. Try again, or call ' + PHONE + '.'); },
        onMessage: function(p){
          var who = (p.role || p.source) === 'user' || p.source === 'user' ? 'you' : 'ava';
          if (!norm(p.message)) return;
          if (who === 'you') { var i = typed.indexOf(norm(p.message)); if (i > -1) { typed.splice(i, 1); return; } if (kind === 'text') return; }
          add(who, p.message);
        },
        onModeChange: function(p){ speaking = p.mode === 'speaking'; if (mode === 'voice') { label.textContent = speaking ? 'Speaking' : 'Listening'; setState(speaking ? 'Vanessa is talking. You can cut in anytime.' : 'Your turn. Take your time.'); } }
      };
      if (kind === 'text') opts.textOnly = true; else opts.connectionType = 'webrtc';
      return SDK.Conversation.startSession(opts);
    }).then(function(c){
      conv = c; mode = kind; starting = null; setUi(true); meter();
      while (queued.length) { try { conv.sendUserMessage(queued.shift()); } catch(e){} }
      return conv;
    }, function(err){
      starting = null;
      var denied = err && /permission|notallowed|denied/i.test(String(err.name || '') + String(err.message || err));
      if (kind === 'voice' && denied) return start('text', 'No microphone access, so let’s chat by text instead.');
      setState('Vanessa couldn’t connect right now. Try again, or call ' + PHONE + '.');
      throw err;
    });
    return starting;
  }
  function end(){ if (conv) { try { conv.endSession(); } catch(e){} } conv = null; mode = null; setUi(false); }
  function ask(text){
    text = String(text || '').trim(); if (!text) return;
    add('you', text); input.value = ''; typed.push(norm(text));
    if (conv) { try { conv.sendUserMessage(text); } catch(e){} return; }
    queued.push(text); start('text').catch(function(){});
  }
  orb.addEventListener('click', function(){
    if (conv && mode === 'voice') { end(); return; }
    if (conv && mode === 'text') { end(); }
    start('voice').catch(function(){});
  });
  endBtn.addEventListener('click', end);
  form.addEventListener('submit', function(e){ e.preventDefault(); ask(input.value); });
  window.addEventListener('pagehide', end);
  loadSdk().catch(function(){});
})();
</script>
</body>
</html>`;

const html = PAGE.replaceAll("__CALENDLY__", CALENDLY_URL)
  .replaceAll("__PHONE_DIGITS__", CONTACT_PHONE_DIGITS)
  .replaceAll("__PHONE__", CONTACT_PHONE_DISPLAY)
  .replaceAll("__AGENT_ID__", AGENT_ID)
  .replaceAll("__SDK_URL__", SDK_URL);

const invite = (expired: boolean) => `<section id="vanessa" aria-labelledby="title">
      <p class="kicker">Private conversation</p>
      <h2 id="title">${expired ? "This link has" : "This link is for"} <em>${expired ? "expired." : "invited customers."}</em></h2>
      <p class="lede">Vanessa, our AI assistant, has private conversations with customers who are ready to move. Tell us a little about your business and, if we're a good fit, you'll get your own link in seconds.</p>
      <div class="cta-row center">
        <a class="pill" href="/#fit">See if we're a fit <i aria-hidden="true">›</i></a>
        <a class="pill pill-line" href="/audit">Get a Growth Audit <i aria-hidden="true">›</i></a>
      </div>
      <p class="fine">Prefer a person? Call or text <a href="tel:${CONTACT_PHONE_DIGITS}">${CONTACT_PHONE_DISPLAY}</a>.</p>
    </section>`;

/** The page with its conversation section swapped for the invitation, and the AI's script removed. Plain string slicing. */
function withoutConversation(page: string, replacement: string): string {
  const from = page.indexOf('<section id="vanessa"');
  const to = page.indexOf("</section>", from);
  const scriptFrom = page.indexOf("<script>");
  const scriptTo = page.indexOf("</script>", scriptFrom);
  if (from < 0 || to < 0 || scriptFrom < 0 || scriptTo < 0) return replacement; // never expose the conversation by mistake
  const noSection = page.slice(0, from) + replacement + page.slice(to + "</section>".length);
  const a = noSection.indexOf("<script>");
  return noSection.slice(0, a) + noSection.slice(noSection.indexOf("</script>", a) + "</script>".length);
}

export async function GET(req: Request) {
  const k = new URL(req.url).searchParams.get("k");
  const open = verifyVanessaToken(k).ok;
  // No valid link: the same page shell, with the invitation in place of the conversation and without the AI's script.
  const body = open ? html : withoutConversation(html, invite(Boolean(k)));
  return new Response(body, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow, noai, noimageai",
      "Cache-Control": "no-store",
    },
  });
}
