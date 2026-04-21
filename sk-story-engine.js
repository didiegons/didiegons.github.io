/*
╔══════════════════════════════════════════════════════════════╗
║      SECURITY KNIGHTS — STORY ENGINE v2.0                   ║
║      Self-installing. One line. Zero configuration.         ║
║                                                              ║
║  HOW TO USE:                                                 ║
║  1. Put this file in the SAME folder as your HTML game       ║
║  2. Add ONE line before </body> in your HTML:                ║
║     <script src="sk-story-engine.js"></script>               ║
║  That's it. The story system self-installs on page load.    ║
╚══════════════════════════════════════════════════════════════╝
*/

(function() {
'use strict';

// ══════════════════════════════════════════════
// SELF-INSTALLING CSS INJECTION
// ══════════════════════════════════════════════
var CSS = `
/* ── STORY DIALOGUE ── */
#story-dlg{
  position:fixed;bottom:0;left:0;right:0;z-index:300;
  padding:0 16px 16px;
  transform:translateY(110%);
  transition:transform .45s cubic-bezier(.34,1.1,.64,1);
  pointer-events:none;display:flex;justify-content:center;
}
#story-dlg.open{transform:translateY(0);pointer-events:all;}
.sdlg-card{
  background:linear-gradient(135deg,rgba(6,8,20,.98),rgba(10,12,30,.99));
  border:1px solid rgba(232,168,32,.45);border-radius:16px;
  padding:16px 20px;max-width:720px;width:100%;
  display:flex;gap:14px;align-items:flex-start;
  box-shadow:0 -4px 40px rgba(0,0,0,.7),0 0 60px rgba(232,168,32,.06);
  cursor:pointer;
}
#story-dlg.open .sdlg-card:hover{border-color:rgba(232,168,32,.7);}
.sdlg-portrait{
  width:52px;height:52px;flex-shrink:0;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:1.55rem;border:2px solid;transition:all .3s;
}
.sdlg-body{flex:1;min-width:0;}
.sdlg-name{
  font-family:'Cinzel',serif;font-size:.68rem;font-weight:700;
  letter-spacing:.14em;text-transform:uppercase;margin-bottom:5px;
}
.sdlg-text{
  font-family:'Lato',sans-serif;font-size:.88rem;line-height:1.75;
  color:#C8D8E8;min-height:1.3rem;
}
.sdlg-hint{
  font-family:'JetBrains Mono',monospace;font-size:.6rem;
  color:rgba(232,168,32,.45);margin-top:5px;display:none;
  animation:sdlg-pulse 1.8s ease-in-out infinite;
}
@keyframes sdlg-pulse{0%,100%{opacity:.3}50%{opacity:1}}

/* ── ZONE TRANSITION ── */
#zone-trans{
  position:fixed;inset:0;z-index:700;
  background:#000;display:none;
  flex-direction:column;align-items:center;justify-content:center;
  overflow:hidden;
}
#zone-trans.open{display:flex;}
#zt-canvas{position:absolute;inset:0;width:100%;height:100%;}
.zt-wrap{
  position:relative;z-index:2;
  text-align:center;max-width:660px;padding:30px 24px;width:100%;
}
.zt-eyebrow{
  font-family:'Cinzel',serif;font-size:.7rem;letter-spacing:.32em;
  text-transform:uppercase;color:rgba(232,168,32,.5);margin-bottom:6px;
}
.zt-headline{
  font-family:'Uncial Antiqua',serif;
  font-size:clamp(1.8rem,4.5vw,3rem);color:#E8A820;
  text-shadow:0 0 50px rgba(232,168,32,.55);
  margin-bottom:26px;line-height:1.18;
}
#zt-lines{display:flex;flex-direction:column;gap:10px;}
.zt-line{
  background:rgba(6,8,20,.94);border:1px solid rgba(232,168,32,.28);
  border-radius:14px;padding:14px 18px;
  display:flex;gap:12px;align-items:flex-start;
  text-align:left;
  opacity:0;transform:translateY(18px);
  transition:opacity .55s ease,transform .55s ease;
}
.zt-line.show{opacity:1;transform:translateY(0);}
.zt-lp{
  width:42px;height:42px;flex-shrink:0;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:1.3rem;border:1px solid;
}
.zt-lbody{flex:1;min-width:0;}
.zt-lname{
  font-family:'Cinzel',serif;font-size:.67rem;font-weight:700;
  letter-spacing:.1em;margin-bottom:4px;
}
.zt-ltext{font-size:.84rem;line-height:1.68;color:#C8D8E8;}
.zt-btn{
  display:none;margin-top:22px;
  padding:12px 36px;
  background:linear-gradient(135deg,#C48A10,#E8A820,#FFD700);
  border:none;border-radius:10px;font-family:'Cinzel',serif;
  font-size:.9rem;font-weight:700;color:#000;cursor:pointer;
  box-shadow:0 0 30px rgba(232,168,32,.45);letter-spacing:.07em;
  transition:all .2s;
}
.zt-btn.show{display:inline-block;}
.zt-btn:hover{transform:translateY(-3px);box-shadow:0 0 55px rgba(232,168,32,.8);}

/* ── BOSS ENCOUNTER ── */
#boss-enc{
  position:fixed;inset:0;z-index:750;
  background:rgba(0,0,0,.97);display:none;
  flex-direction:column;align-items:center;justify-content:center;
}
#boss-enc.open{display:flex;}
#boss-canvas{position:absolute;inset:0;width:100%;height:100%;}
.boss-wrap{
  position:relative;z-index:2;text-align:center;
  max-width:640px;padding:16px;width:100%;
}
.boss-phase-lbl{
  font-family:'JetBrains Mono',monospace;font-size:.62rem;
  color:rgba(232,100,100,.45);letter-spacing:.1em;margin-bottom:6px;
}
.boss-name{
  font-family:'Uncial Antiqua',serif;
  font-size:clamp(1.5rem,3.5vw,2.4rem);
  color:#E84040;text-shadow:0 0 30px rgba(232,64,64,.65);
  margin-bottom:4px;
}
.boss-title-lbl{
  font-family:'Cinzel',serif;font-size:.72rem;
  color:rgba(220,100,100,.6);letter-spacing:.18em;margin-bottom:16px;
}
.boss-hp-wrap{max-width:400px;margin:0 auto 10px;}
.boss-hp-header{
  font-family:'JetBrains Mono',monospace;font-size:.67rem;
  color:rgba(232,100,100,.6);
  display:flex;justify-content:space-between;margin-bottom:4px;
}
.boss-hp-track{
  height:14px;background:rgba(232,64,64,.1);
  border:1px solid rgba(232,64,64,.32);border-radius:100px;overflow:hidden;
}
.boss-hp-fill{
  height:100%;
  background:linear-gradient(90deg,#8B0000,#E84040,#FF6060);
  border-radius:100px;transition:width 1s ease;
}
.boss-taunt{
  font-family:'Cinzel',serif;font-size:.86rem;
  color:rgba(230,160,160,.82);font-style:italic;
  margin:14px auto 16px;min-height:2.8rem;line-height:1.65;
  max-width:500px;
}
.boss-fight-btn{
  display:none;padding:13px 42px;
  background:linear-gradient(135deg,#8B0000,#C82020,#E84040);
  border:none;border-radius:10px;font-family:'Cinzel',serif;
  font-size:.95rem;font-weight:700;color:#fff;cursor:pointer;
  letter-spacing:.07em;box-shadow:0 0 30px rgba(232,64,64,.5);
  transition:all .2s;
}
.boss-fight-btn:hover{transform:translateY(-3px);box-shadow:0 0 55px rgba(232,64,64,.9);}
.boss-warning{
  font-family:'JetBrains Mono',monospace;font-size:.65rem;
  color:rgba(232,100,100,.45);margin-top:10px;
}
`;

// ══════════════════════════════════════════════
// HTML OVERLAYS
// ══════════════════════════════════════════════
var HTML = `
<div id="story-dlg">
  <div class="sdlg-card" onclick="SK.closeNarrative()">
    <div class="sdlg-portrait" id="sdlg-portrait">🧙</div>
    <div class="sdlg-body">
      <div class="sdlg-name" id="sdlg-name">Merlin the Wizard</div>
      <div class="sdlg-text" id="sdlg-text"></div>
      <div class="sdlg-hint" id="sdlg-hint">▶ Click to continue</div>
    </div>
  </div>
</div>

<div id="zone-trans">
  <canvas id="zt-canvas"></canvas>
  <div class="zt-wrap">
    <div class="zt-eyebrow" id="zt-eyebrow">Entering Zone 2</div>
    <div class="zt-headline" id="zt-headline">The Dark Forest</div>
    <div id="zt-lines"></div>
    <button class="zt-btn" id="zt-btn" onclick="SK.closeZoneTransition()">⚔️ Enter the Zone →</button>
  </div>
</div>

<div id="boss-enc">
  <canvas id="boss-canvas"></canvas>
  <div class="boss-wrap">
    <div class="boss-phase-lbl">⚔️ BOSS ENCOUNTER</div>
    <div class="boss-name" id="boss-name">Thornback</div>
    <div class="boss-title-lbl" id="boss-title">Orc Warlord of the Green Fields</div>
    <div class="boss-hp-wrap">
      <div class="boss-hp-header"><span>💀 BOSS HP</span><span id="boss-hp-val">100 / 100</span></div>
      <div class="boss-hp-track"><div class="boss-hp-fill" id="boss-hp-fill" style="width:100%"></div></div>
    </div>
    <div class="boss-taunt" id="boss-taunt"></div>
    <button class="boss-fight-btn" id="boss-fight-btn" onclick="SK.startBossFight()">⚔️ Face the Challenge!</button>
    <div class="boss-warning">Answer correctly to defeat the boss — answer wrong and feel their wrath</div>
  </div>
</div>
`;

// ══════════════════════════════════════════════
// MAIN SK NAMESPACE
// ══════════════════════════════════════════════
window.SK = {

// ─── Characters ───────────────────────────────
CHARS: {
  merlin:    { name:'Merlin the Wizard',      icon:'🧙', color:'#E8A820', bg:'rgba(232,168,32,.15)',  border:'rgba(232,168,32,.5)' },
  vera:      { name:'Princess Vera',           icon:'👸', color:'#FF85A1', bg:'rgba(255,133,161,.15)', border:'rgba(255,133,161,.5)' },
  aldric:    { name:'Sir Aldric',              icon:'⚔️', color:'#7BA7D4', bg:'rgba(123,167,212,.15)', border:'rgba(123,167,212,.5)' },
  shadow:    { name:'Shadow Sorcerer',         icon:'💀', color:'#9B59B6', bg:'rgba(155,89,182,.15)',  border:'rgba(155,89,182,.5)' },
  thornback: { name:'Thornback the Warlord',   icon:'👹', color:'#E84040', bg:'rgba(232,64,64,.15)',   border:'rgba(232,64,64,.5)' },
  grimfang:  { name:'Grimfang the Chieftain',  icon:'🧌', color:'#2ECC8A', bg:'rgba(46,204,138,.15)',  border:'rgba(46,204,138,.5)' },
  malachar:  { name:'Malachar the Dragon',     icon:'🐉', color:'#FF4400', bg:'rgba(255,68,0,.15)',    border:'rgba(255,68,0,.5)' }
},

// ─── Story Data: pre/post for each stone ───────
STORY: {
  1:{pre:{c:'merlin',t:'Welcome, young knight. I am Merlin, your guide through Codehaven. Our first trial: dark sorcerers have poisoned the Great Library\'s search scrolls with SQL magic. Identify their trick!'},correct:{c:'merlin',t:'SQL Injection defeated! The library scrolls are safe. I sense Thornback the Orc Warlord watching from the tree line... your quest has only just begun.'},wrong:{c:'shadow',t:'Ha! The sorcery worked. SQL Injection — the oldest trick in the dark arts. Study the explanation carefully. You must not fail again, little knight.'}},
  2:{pre:{c:'aldric',t:'Knight! Orc scouts spread cursed messages through the village boards. Each carries hidden spell-code that runs in every visitor\'s eyes. Identify the dark magic before the poison spreads!'},correct:{c:'merlin',t:'The cursed board is cleansed! But Thornback\'s forces grow bolder — they adapt and find new attack vectors. Stay vigilant.'},wrong:{c:'shadow',t:'Your eyes missed the curse! XSS hidden in plain sight — the village is poisoned. The explanation holds your salvation.'}},
  3:{pre:{c:'vera',t:'⚡ Encrypted signal: "Young knight — this is Princess Vera. The castle vault has been breached! Passwords stored in plain sight. Identify the weakness. Please hurry. —V" ⚡'},correct:{c:'vera',t:'⚡ "The vault\'s flaw is exposed! Plain text passwords are a cardinal sin — you now know why. Your knowledge grows stronger. —V" ⚡'},wrong:{c:'vera',t:'⚡ "The thieves escaped with the passwords! Study bcrypt and Argon2id — the only true shields. —V" ⚡'}},
  4:{pre:{c:'merlin',t:'Thornback\'s scouts found an open gate! A careless developer hardcoded the castle password directly into the spell-code. Anyone who reads it walks right in. Find the flaw, Knight!'},correct:{c:'aldric',t:'Gate secured! The hardcoded password is moved to a sealed vault. Thornback\'s advance is slowed... but he still marches.'},wrong:{c:'shadow',t:'The gate swings open! Hardcoded credentials — the most embarrassing of vulnerabilities. Thornback\'s orcs pour through.'}},
  5:{pre:{c:'merlin',t:'The king\'s messenger carries vital secrets — but is he using the encrypted road? An unencrypted message can be read by any spy in the forest. Answer quickly... I sense Thornback is VERY close now.'},correct:{c:'merlin',t:'The messenger road is secured with HTTPS! But Knight — THORNBACK HIMSELF STANDS BEFORE YOU! The Green Fields\' final guardian demands battle!'},wrong:{c:'thornback',t:'The message is intercepted! Hahaha! The road is unguarded. And now, little knight... I come for you.'}},
  6:{pre:{c:'aldric',t:'A forged royal decree — sent in the King\'s name, but he never wrote it! The CSRF sorcery stole the King\'s seal through the browser\'s own loyalty. Find the flaw in how it was authenticated!'},correct:{c:'merlin',t:'The forged decree exposed! CSRF tokens are the true unforgeable royal seal, bound to the session. Grimfang\'s forgers are furious.'},wrong:{c:'shadow',t:'The false decree is obeyed! CSRF works because the kingdom trusts any request bearing the right cookies. The explanation reveals the remedy.'}},
  7:{pre:{c:'vera',t:'⚡ "Knight — someone accesses my private documents! I am authenticated, but they see everything. The server does not check WHO should see WHAT, only WHO is logged in. This is IDOR — stop them!" ⚡'},correct:{c:'vera',t:'⚡ "Access control restored! Authorization — not just authentication — is the true guardian. Thank you, knight." ⚡'},wrong:{c:'shadow',t:'Vera\'s private scrolls are plundered! Authentication proves WHO you are. Authorization proves what you\'re ALLOWED to see.'}},
  8:{pre:{c:'merlin',t:'The Royal Vault Keeper must choose a cipher for the kingdom\'s most precious secrets. Some ciphers are ancient and weak — GPUs crack them in milliseconds. Others are forged for the modern age. Choose wisely!'},correct:{c:'aldric',t:'Excellent judgment! The vault is sealed with a strong cipher — deliberately slow to compute. Grimfang\'s crackers weep!'},wrong:{c:'shadow',t:'MD5! I crack your hash in milliseconds with a single GPU. A FAST cipher is a WEAK password cipher. Speed is the enemy of security.'}},
  9:{pre:{c:'merlin',t:'A villager brought a scroll to the castle library — but it is CURSED! It claims to be harmless, but its true nature is spell-code. The librarian almost stored it in the sacred chambers. What is the correct defense?'},correct:{c:'merlin',t:'The cursed scroll rejected at the gate! Magic bytes examined, extension whitelist enforced, file renamed. The library stands safe.'},wrong:{c:'shadow',t:'The cursed scroll is stored in the sacred chambers! It executes its payload. Checking only file extensions is trivially bypassed.'}},
  10:{pre:{c:'aldric',t:'The castle gates stand without their shields! Security response headers — the CSP, the HSTS — are missing from our walls. This is the final Dark Forest trial... and I fear Grimfang stirs.'},correct:{c:'merlin',t:'The shields are raised! But Knight — GRIMFANG THE TROLL CHIEFTAIN BLOCKS YOUR PATH! He guards the entrance to the Shadow Castle!'},wrong:{c:'grimfang',t:'The gates remain unshielded! XSS pours through freely. And now, knight... I grow tired of waiting. Come and face me.'}},
  11:{pre:{c:'aldric',t:'A dark portal has opened in the castle walls! Any visitor can make the server fetch any URL — including our own secret internal chambers. Cloud credentials sit unprotected. Identify this SSRF vulnerability!'},correct:{c:'merlin',t:'SSRF portal sealed! The URL allowlist is in place. Malachar cannot reach our cloud credentials through this dark portal.'},wrong:{c:'shadow',t:'The portal opens to the cloud metadata server! Malachar has the credentials. SSRF weaponizes the server against itself.'}},
  12:{pre:{c:'vera',t:'⚡ "A cursed object was sent to the King! The server deserializes it on arrival — but hidden within is code that will execute with server privileges. Stop it before it reaches the throne room!" ⚡'},correct:{c:'vera',t:'⚡ "The cursed object is neutralized! HMAC authentication prevents tampering. Malachar\'s gift is refused. Well done, knight." ⚡'},wrong:{c:'shadow',t:'The cursed object executes! Insecure deserialization — the server trusted tampered data. Never deserialize unsigned data.'}},
  13:{pre:{c:'merlin',t:'Malachar forges JWT tokens — walks our halls as an administrator! He changed three characters in the token header: the algorithm. Suddenly, he needs no signature at all. The "none" algorithm vulnerability is ancient but deadly.'},correct:{c:'merlin',t:'The JWT forgery exposed! The server must pin its expected algorithm and reject "none" absolutely. Malachar grows desperate... and dangerous.'},wrong:{c:'shadow',t:'Malachar walks as administrator! The alg:none vulnerability — the server accepted an unsigned token. Pin it server-side!'}},
  14:{pre:{c:'aldric',t:'Two shadow knights simultaneously demand the castle treasury! Both arrive at the same instant — both pass the balance check — but together they demand more than exists. This race condition could bankrupt the realm!'},correct:{c:'aldric',t:'Database row-level locking deployed! SELECT FOR UPDATE ensures atomicity — two requests cannot both read and modify simultaneously. The treasury is safe!'},wrong:{c:'shadow',t:'The treasury is drained TWICE! Time Of Check to Time Of Use — the gap between reading a value and modifying it. Transactions shield you.'}},
  15:{pre:{c:'merlin',t:'Knight... this is the final trial. Malachar has been inside the castle for THREE DAYS. Logs show 500 failed logins at 3AM — yet no alert triggered. This OWASP failure allowed the dragon to spread undetected. Answer, then face him!'},correct:{c:'merlin',t:'Security Logging and Monitoring Failures! The watchtower was silent when it should have screamed. And now — MALACHAR REVEALS HIMSELF. THE SHADOW DRAGON STANDS BEFORE YOU!'},wrong:{c:'malachar',t:'Logging and Monitoring Failures — the beautiful silence that lets me dwell in your systems for months. Your watchtower slept. I am everywhere. Come, knight...'}}
},

// ─── Zone Transitions ──────────────────────────
ZONES: {
  2:{eyebrow:'Entering Zone 2',title:'The Dark Forest',theme:'forest',
    lines:[
      {c:'aldric',t:'You have defeated Thornback and secured the Green Fields, young knight. But the Dark Forest is Grimfang\'s domain — his trolls are craftier than any orc. Their sorcery works through trust and trickery.'},
      {c:'vera',  t:'⚡ "Knight — I can see the forest from my tower. The trolls forge royal decrees in the king\'s name, steal identity tokens, and smuggle cursed files through the castle gates. Watch everything. Trust nothing. —V" ⚡'},
      {c:'merlin',t:'You enter the realm of CSRF, stolen keys, and forbidden objects. Five more trials await. Your rank rises to Squire. The real darkness begins now.'}
    ]
  },
  3:{eyebrow:'Entering Zone 3',title:'The Shadow Castle',theme:'castle',
    lines:[
      {c:'merlin',t:'The Shadow Castle. Malachar the Shadow Dragon has corrupted every system within these walls. Only the most advanced security knowledge can reach Princess Vera and restore the realm.'},
      {c:'vera',  t:'⚡ "Knight — I can hear Malachar breathing. He has been inside our systems for days without detection. Race conditions drain our treasury. Forged tokens walk our halls. Please... hurry. Five trials remain. —V" ⚡'},
      {c:'aldric',t:'You are now a Knight of the realm. These final challenges will test everything you know. Malachar has been watching, undetected, for three days. Expose him. End this.'}
    ]
  }
},

// ─── Bosses ────────────────────────────────────
BOSSES: {
  thornback:{name:'Thornback',title:'Orc Warlord of the Green Fields',hp:100,color:'#E84040',type:'orc',
    taunts:['"Enough games, little knight! Your "secure coding" means nothing against my brute strength!"','"I have breached a thousand applications with nothing but patience and a stolen password list!"','"Face me — or watch the Green Fields burn!"']},
  grimfang:{name:'Grimfang',title:'Troll Chieftain of the Dark Forest',hp:150,color:'#2ECC8A',type:'troll',
    taunts:['"You call yourself a Security Knight? My trolls bypass your headers with a single SSRF request!"','"Your CORS headers are wide open! I\'ll help myself to your authenticated APIs."','"The Dark Forest is MINE, knight. And soon — so will your kingdom be."']},
  malachar:{name:'Malachar',title:'Shadow Dragon — Final Boss',hp:300,color:'#FF4400',type:'dragon',
    taunts:['"I have lived inside your systems for THREE DAYS. While your watchtowers slept, I read every secret."','"Your JWT tokens? Forged. Your race conditions? Exploited. Your SSRF portals? Already used. I am everywhere."','"Princess Vera begs for rescue. Answer — if you can."']}
},

// ─── Internal state ────────────────────────────
_narrativeCb: null, _narrativeTimer: null, _narrativeOpen: false,
_ztCb: null, _ztData: null, _ztAF: null,
_bossCb: null, _bossData: null, _bossOpen: false, _bossAF: null, _bossT: 0,
_bossHp: 0, _bossMaxHp: 0,

// ──────────────────────────────────────────────
// NARRATIVE SYSTEM
// ──────────────────────────────────────────────
showNarrative: function(charKey, text, cb) {
  var ch = this.CHARS[charKey] || this.CHARS.merlin;
  this._narrativeCb = cb;
  this._narrativeOpen = true;
  var dlg = document.getElementById('story-dlg');
  var portrait = document.getElementById('sdlg-portrait');
  var nameEl = document.getElementById('sdlg-name');
  var textEl = document.getElementById('sdlg-text');
  portrait.textContent = ch.icon;
  portrait.style.background = ch.bg;
  portrait.style.borderColor = ch.border;
  nameEl.textContent = ch.name;
  nameEl.style.color = ch.color;
  textEl.textContent = '';
  document.getElementById('sdlg-hint').style.display = 'none';
  dlg.classList.add('open');
  if (this._narrativeTimer) clearInterval(this._narrativeTimer);
  var i = 0;
  var speed = text.length > 120 ? 18 : 22;
  var self = this;
  this._narrativeTimer = setInterval(function() {
    if (i < text.length) { textEl.textContent += text[i]; i++; }
    else {
      clearInterval(self._narrativeTimer);
      self._narrativeTimer = null;
      document.getElementById('sdlg-hint').style.display = 'block';
    }
  }, 1000 / speed);
},

closeNarrative: function() {
  if (!this._narrativeOpen) return;
  this._narrativeOpen = false;
  if (this._narrativeTimer) { clearInterval(this._narrativeTimer); this._narrativeTimer = null; }
  document.getElementById('story-dlg').classList.remove('open');
  document.getElementById('sdlg-hint').style.display = 'none';
  if (this._narrativeCb) {
    var cb = this._narrativeCb;
    this._narrativeCb = null;
    setTimeout(cb, 300);
  }
},

_runPre: function(idx, cb) {
  var s = this.STORY[idx];
  if (s && s.pre) { this.showNarrative(s.pre.c, s.pre.t, cb); }
  else { if (cb) cb(); }
},

_runPost: function(idx, isCorrect) {
  var s = this.STORY[idx];
  if (!s) return;
  var d = isCorrect ? s.correct : s.wrong;
  if (d) {
    var self = this;
    setTimeout(function() { self.showNarrative(d.c, d.t, null); }, isCorrect ? 700 : 600);
  }
},

// ──────────────────────────────────────────────
// ZONE TRANSITION SYSTEM
// ──────────────────────────────────────────────
showZoneTransition: function(zoneNum, cb) {
  var data = this.ZONES[zoneNum];
  if (!data) { if (cb) cb(); return; }
  this._ztData = data;
  this._ztCb = cb;
  var el = document.getElementById('zone-trans');
  document.getElementById('zt-eyebrow').textContent = data.eyebrow;
  document.getElementById('zt-headline').textContent = data.title;
  document.getElementById('zt-lines').innerHTML = '';
  document.getElementById('zt-btn').classList.remove('show');
  var linesEl = document.getElementById('zt-lines');
  var self = this;
  data.lines.forEach(function(line, i) {
    var ch = self.CHARS[line.c] || self.CHARS.merlin;
    var div = document.createElement('div');
    div.className = 'zt-line';
    div.id = 'ztl-' + i;
    div.innerHTML = '<div class="zt-lp" style="background:'+ch.bg+';border-color:'+ch.border+'">'+ch.icon+'</div>' +
      '<div class="zt-lbody"><div class="zt-lname" style="color:'+ch.color+'">'+ch.name+'</div>' +
      '<div class="zt-ltext">'+line.t.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</div></div>';
    linesEl.appendChild(div);
  });
  el.classList.add('open');
  if (typeof gameState !== 'undefined') gameState = 'MODAL';
  this._drawZoneBg(data.theme);
  var showLine = function(idx) {
    var el2 = document.getElementById('ztl-' + idx);
    if (el2) el2.classList.add('show');
    if (idx >= data.lines.length - 1) {
      setTimeout(function() { document.getElementById('zt-btn').classList.add('show'); }, 800);
    } else {
      setTimeout(function() { showLine(idx + 1); }, 1400);
    }
  };
  setTimeout(function() { showLine(0); }, 400);
},

closeZoneTransition: function() {
  document.getElementById('zone-trans').classList.remove('open');
  if (this._ztAF) { cancelAnimationFrame(this._ztAF); this._ztAF = null; }
  if (typeof gameState !== 'undefined') gameState = 'WALKING';
  if (this._ztCb) { var cb = this._ztCb; this._ztCb = null; setTimeout(cb, 300); }
},

_drawZoneBg: function(theme) {
  var canvas = document.getElementById('zt-canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var ctx = canvas.getContext('2d');
  var t = 0;
  var self = this;
  var frame = function() {
    self._ztAF = requestAnimationFrame(frame);
    t += 0.01;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var W = canvas.width, H = canvas.height;
    if (theme === 'forest') {
      var bg = ctx.createLinearGradient(0,0,0,H);
      bg.addColorStop(0,'#030A04'); bg.addColorStop(1,'#061208');
      ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);
      for (var i=0;i<30;i++) {
        var fx=(Math.sin(t*.4+i*2.1)*.5+.5)*W,fy=(Math.cos(t*.3+i*1.7)*.5+.5)*H*.7;
        var fo=.3+Math.sin(t*3+i)*.3;
        ctx.fillStyle='rgba(100,200,80,'+fo+')';
        ctx.beginPath();ctx.arc(fx,fy,2,0,Math.PI*2);ctx.fill();
      }
      ctx.fillStyle='#020802';
      for (var i=0;i<20;i++) {
        var tx=(i/20)*W*1.1-W*.05,th=150+(i%5)*60,tw=60+(i%4)*30;
        ctx.beginPath();ctx.moveTo(tx,H*.9);
        ctx.lineTo(tx-tw/2,H*.9-th*.4);ctx.lineTo(tx-tw/3,H*.9-th*.4);
        ctx.lineTo(tx-tw/2.5,H*.9-th*.65);ctx.lineTo(tx-tw/4,H*.9-th*.65);
        ctx.lineTo(tx,H*.9-th);
        ctx.lineTo(tx+tw/4,H*.9-th*.65);ctx.lineTo(tx+tw/2.5,H*.9-th*.65);
        ctx.lineTo(tx+tw/3,H*.9-th*.4);ctx.lineTo(tx+tw/2,H*.9-th*.4);
        ctx.closePath();ctx.fill();
      }
      var glow=ctx.createRadialGradient(W/2,H,0,W/2,H,H*.4);
      glow.addColorStop(0,'rgba(46,204,138,0.12)');glow.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
    } else {
      var bg2=ctx.createLinearGradient(0,0,0,H);
      bg2.addColorStop(0,'#050008');bg2.addColorStop(1,'#0A0014');
      ctx.fillStyle=bg2;ctx.fillRect(0,0,W,H);
      for (var i=0;i<100;i++) {
        var sx=(i*137.5)%W,sy=(i*97.3)%(H*.6);
        ctx.globalAlpha=.3+Math.sin(t*2+i)*.3;
        ctx.fillStyle='rgba(200,180,255,0.7)';
        ctx.beginPath();ctx.arc(sx,sy,1,0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=1;
      var cx2=W/2;
      ctx.fillStyle='#050005';
      ctx.fillRect(cx2-100,H*.3,200,H*.7);
      ctx.fillRect(cx2-160,H*.2,70,H*.7);
      ctx.fillRect(cx2+90,H*.2,70,H*.7);
      var winGlow=ctx.createRadialGradient(cx2,H*.45,0,cx2,H*.45,80);
      winGlow.addColorStop(0,'rgba(155,89,182,'+(.3+Math.sin(t*2)*.15)+')');
      winGlow.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=winGlow;ctx.fillRect(0,0,W,H);
      var redGlow=ctx.createLinearGradient(0,H,0,H*.6);
      redGlow.addColorStop(0,'rgba(80,0,0,0.4)');redGlow.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=redGlow;ctx.fillRect(0,0,W,H);
    }
  };
  frame();
},

// ──────────────────────────────────────────────
// BOSS ENCOUNTER SYSTEM
// ──────────────────────────────────────────────
showBossEncounter: function(bossKey, cb) {
  var boss = this.BOSSES[bossKey];
  if (!boss) { if (cb) cb(); return; }
  this._bossData = boss;
  this._bossCb = cb;
  this._bossOpen = true;
  this._bossHp = boss.hp;
  this._bossMaxHp = boss.hp;
  this._bossT = 0;
  document.getElementById('boss-name').textContent = boss.name;
  document.getElementById('boss-title').textContent = boss.title;
  document.getElementById('boss-hp-fill').style.width = '100%';
  document.getElementById('boss-hp-fill').style.background = 'linear-gradient(90deg,#8B0000,' + boss.color + ')';
  document.getElementById('boss-hp-val').textContent = boss.hp + ' / ' + boss.hp;
  document.getElementById('boss-taunt').textContent = '';
  document.getElementById('boss-fight-btn').style.display = 'none';
  var bc = document.getElementById('boss-canvas');
  bc.width = window.innerWidth; bc.height = window.innerHeight;
  document.getElementById('boss-enc').classList.add('open');
  if (typeof gameState !== 'undefined') gameState = 'MODAL';
  this._bossT = 0;
  this._runBossLoop();
  var self = this;
  var showTaunt = function(idx) {
    if (!self._bossOpen) return;
    if (idx >= boss.taunts.length) {
      document.getElementById('boss-fight-btn').style.display = 'inline-block';
      return;
    }
    document.getElementById('boss-taunt').textContent = boss.taunts[idx];
    setTimeout(function() { showTaunt(idx + 1); }, 2200);
  };
  setTimeout(function() { showTaunt(0); }, 600);
},

startBossFight: function() {
  document.getElementById('boss-enc').classList.remove('open');
  this._bossOpen = false;
  if (this._bossAF) { cancelAnimationFrame(this._bossAF); this._bossAF = null; }
  if (typeof gameState !== 'undefined') gameState = 'WALKING';
  if (this._bossCb) { var cb = this._bossCb; this._bossCb = null; setTimeout(cb, 200); }
},

_runBossLoop: function() {
  if (!this._bossOpen) return;
  var self = this;
  this._bossAF = requestAnimationFrame(function() { self._runBossLoop(); });
  this._bossT += 0.02;
  var bc = document.getElementById('boss-canvas');
  var bctx = bc.getContext('2d');
  var W = bc.width, H = bc.height;
  bctx.clearRect(0,0,W,H);
  var bg = bctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*.7);
  bg.addColorStop(0,'rgba(20,0,0,0.85)'); bg.addColorStop(1,'rgba(0,0,0,0.98)');
  bctx.fillStyle = bg; bctx.fillRect(0,0,W,H);
  var bx = W*.5, by = H*.38;
  var sc = Math.min(W,H)/600;
  var boss = this._bossData;
  if (boss) {
    if (boss.type === 'orc') this._drawOrc(bctx, bx, by, this._bossT, sc);
    else if (boss.type === 'troll') this._drawTroll(bctx, bx, by, this._bossT, sc * 1.2);
    else this._drawOrc(bctx, bx, by, this._bossT, sc); // dragon fallback
  }
},

_drawOrc: function(ctx, cx, cy, t, sc) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc);
  var bob = Math.sin(t*2)*6, sway = Math.sin(t*1.2)*4;
  ctx.globalAlpha=.25; ctx.fillStyle='#000';
  ctx.beginPath(); ctx.ellipse(0,200,90,25,0,0,Math.PI*2); ctx.fill();
  ctx.globalAlpha=1;
  ctx.fillStyle='#1A3A10'; ctx.fillRect(-45,100+bob,38,90); ctx.fillRect(7,100+bob,38,90);
  ctx.fillStyle='#0A1A08'; ctx.fillRect(-50,185+bob,48,20); ctx.fillRect(2,185+bob,48,20);
  ctx.fillStyle='#8B1010'; ctx.fillRect(-42,140+bob,36,14); ctx.fillRect(6,140+bob,36,14);
  var bg2=ctx.createLinearGradient(-60,-50,60,80);
  bg2.addColorStop(0,'#2A5A18'); bg2.addColorStop(1,'#1A3A10'); ctx.fillStyle=bg2;
  ctx.beginPath(); ctx.ellipse(0,30+bob,72,80,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#3A1A1A';
  ctx.beginPath(); ctx.moveTo(-55,-20+bob); ctx.lineTo(55,-20+bob);
  ctx.lineTo(45,80+bob); ctx.lineTo(-45,80+bob); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#C8C8C8';
  for (var s=-1;s<=1;s+=2) {
    for (var si=0;si<3;si++) {
      ctx.beginPath();ctx.moveTo(s*(68+si*10),-30+bob+si*8);
      ctx.lineTo(s*(60+si*10),-50+bob+si*8);ctx.lineTo(s*(76+si*10),-50+bob+si*8);
      ctx.closePath();ctx.fill();
    }
  }
  ctx.fillStyle='#E8A820';
  [-30,0,30].forEach(function(rx){ctx.beginPath();ctx.arc(rx,10+bob,4,0,Math.PI*2);ctx.fill();});
  ctx.save(); ctx.translate(-80,-10+bob); ctx.rotate(-0.3+Math.sin(t*1.5)*.15);
  ctx.fillStyle='#2A5A18'; ctx.fillRect(-18,0,36,100);
  ctx.fillStyle='#555'; ctx.fillRect(-30,-20,60,35);
  ctx.fillStyle='#333'; ctx.fillRect(-28,-18,56,6);
  ctx.fillStyle='#E84040'; ctx.fillRect(-15,-14,30,10); ctx.restore();
  ctx.save(); ctx.translate(80,0+bob); ctx.rotate(0.2+Math.sin(t*1.8)*.1);
  ctx.fillStyle='#2A5A18'; ctx.fillRect(-18,0,36,85);
  ctx.fillStyle='#2A1A00'; ctx.fillRect(10,-10,55,75);
  ctx.strokeStyle='#8B1010'; ctx.lineWidth=3; ctx.strokeRect(10,-10,55,75);
  ctx.fillStyle='#E84040'; ctx.font='24px serif'; ctx.textAlign='center';
  ctx.fillText('💀',37,50); ctx.restore();
  ctx.fillStyle='#3A6A20'; ctx.fillRect(-20,-90+bob,40,45);
  var hg=ctx.createRadialGradient(0,-130+bob,10,0,-130+bob,70);
  hg.addColorStop(0,'#4A8A28'); hg.addColorStop(1,'#2A5A18'); ctx.fillStyle=hg;
  ctx.beginPath(); ctx.ellipse(sway,-130+bob,65,72,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#3A7018'; ctx.beginPath(); ctx.ellipse(sway,-90+bob,55,35,0,0,Math.PI); ctx.fill();
  ctx.fillStyle='#F0E8C0';
  [-1,1].forEach(function(d){
    ctx.beginPath(); ctx.moveTo(sway+d*20,-80+bob); ctx.lineTo(sway+d*28,-55+bob);
    ctx.lineTo(sway+d*12,-55+bob); ctx.closePath(); ctx.fill();
  });
  [-20,20].forEach(function(ex){
    var eg=ctx.createRadialGradient(sway+ex,-140+bob,0,sway+ex,-140+bob,20);
    eg.addColorStop(0,'rgba(255,0,0,0.8)'); eg.addColorStop(1,'rgba(255,0,0,0)');
    ctx.fillStyle=eg; ctx.beginPath(); ctx.arc(sway+ex,-140+bob,20,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#FF2020'; ctx.beginPath(); ctx.arc(sway+ex,-140+bob,10,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(sway+ex,-140+bob,4,0,Math.PI*2); ctx.fill();
  });
  ctx.fillStyle='#1A1A2A'; ctx.beginPath(); ctx.ellipse(sway,-155+bob,68,50,0,Math.PI,0); ctx.fill();
  ctx.fillStyle='#C8C8C8';
  ctx.beginPath(); ctx.moveTo(sway,-205+bob); ctx.lineTo(sway-10,-165+bob);
  ctx.lineTo(sway+10,-165+bob); ctx.closePath(); ctx.fill();
  [-1,1].forEach(function(d){
    ctx.fillStyle='#AAA'; ctx.beginPath();
    ctx.moveTo(sway+d*52,-175+bob); ctx.lineTo(sway+d*44,-165+bob);
    ctx.lineTo(sway+d*60,-165+bob); ctx.closePath(); ctx.fill();
  });
  ctx.strokeStyle='#E84040'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(sway-30,-120+bob); ctx.lineTo(sway-10,-100+bob); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(sway+10,-100+bob); ctx.lineTo(sway+30,-120+bob); ctx.stroke();
  ctx.restore();
},

_drawTroll: function(ctx, cx, cy, t, sc) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc);
  var bob=Math.sin(t*1.4)*8, sway=Math.sin(t*.8)*6;
  ctx.globalAlpha=.3; ctx.fillStyle='#000';
  ctx.beginPath(); ctx.ellipse(0,210,110,30,0,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
  ctx.fillStyle='#1A2A2A'; ctx.fillRect(-65,120+bob,55,80); ctx.fillRect(10,120+bob,55,80);
  ctx.fillStyle='#0A1818';
  ctx.beginPath(); ctx.ellipse(-38,198+bob,40,18,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(37,198+bob,40,18,0,0,Math.PI*2); ctx.fill();
  var bg3=ctx.createRadialGradient(-20,0,20,0,20,110);
  bg3.addColorStop(0,'#2A3A3A'); bg3.addColorStop(1,'#0D1E1E'); ctx.fillStyle=bg3;
  ctx.beginPath(); ctx.ellipse(0,30+bob,95,105,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(20,80,20,0.5)';
  [[-30,10],[40,-20],[-10,60],[60,40],[-60,-10]].forEach(function(p){
    ctx.beginPath(); ctx.ellipse(p[0],p[1]+bob,22,14,Math.random(),0,Math.PI*2); ctx.fill();
  });
  ctx.save(); ctx.translate(-100,-30+bob); ctx.rotate(-0.4+Math.sin(t*1.2)*.2);
  ctx.fillStyle='#2A3A3A'; ctx.fillRect(-25,0,50,120);
  ctx.fillStyle='#1A2A2A'; ctx.beginPath(); ctx.ellipse(0,-20,55,45,0.2,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#555';
  [[-30,-40],[0,-58],[30,-45],[-40,-10],[40,-10]].forEach(function(sp){
    ctx.beginPath(); ctx.moveTo(sp[0],sp[1]); ctx.lineTo(sp[0]-8,sp[1]+18);
    ctx.lineTo(sp[0]+8,sp[1]+18); ctx.closePath(); ctx.fill();
  }); ctx.restore();
  ctx.fillStyle='#1E2E2E'; ctx.fillRect(-28,-95+bob,56,50);
  var hg2=ctx.createRadialGradient(sway-15,-150+bob,10,sway,-140+bob,90);
  hg2.addColorStop(0,'#3A4A4A'); hg2.addColorStop(1,'#1A2828'); ctx.fillStyle=hg2;
  ctx.beginPath(); ctx.ellipse(sway,-148+bob,85,80,0.1,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#0A1010';
  [-1,1].forEach(function(d){
    ctx.beginPath(); ctx.moveTo(sway+d*55,-190+bob);
    ctx.quadraticCurveTo(sway+d*90,-240+bob,sway+d*70,-260+bob);
    ctx.quadraticCurveTo(sway+d*80,-240+bob,sway+d*45,-200+bob);
    ctx.closePath(); ctx.fill();
  });
  ctx.fillStyle='#0E1E1E'; ctx.fillRect(sway-80,-195+bob,160,22);
  [-25,25].forEach(function(ex){
    var eg2=ctx.createRadialGradient(sway+ex,-170+bob,0,sway+ex,-170+bob,22);
    eg2.addColorStop(0,'rgba(46,204,138,0.9)'); eg2.addColorStop(1,'rgba(46,204,138,0)');
    ctx.fillStyle=eg2; ctx.beginPath(); ctx.arc(sway+ex,-170+bob,22,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#1ECC6A'; ctx.beginPath(); ctx.arc(sway+ex,-170+bob,12,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(sway+ex+2,-170+bob,5,0,Math.PI*2); ctx.fill();
  });
  ctx.fillStyle='#050A0A'; ctx.beginPath(); ctx.ellipse(sway,-118+bob,55,22,0,0,Math.PI); ctx.fill();
  ctx.fillStyle='#D0C8A0';
  for (var ti=-3;ti<=3;ti++){
    ctx.beginPath(); ctx.moveTo(sway+ti*14,-118+bob);
    ctx.lineTo(sway+ti*14-7,-100+bob); ctx.lineTo(sway+ti*14+7,-100+bob);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
},

// ──────────────────────────────────────────────
// GAME FLOW OVERRIDES (applied after page loads)
// ──────────────────────────────────────────────
_applyOverrides: function() {
  var self = this;

  // Guard: make sure the game functions exist
  if (typeof openQuestion === 'undefined' ||
      typeof pickAnswer === 'undefined' ||
      typeof onReachedWaypoint === 'undefined') {
    console.warn('[SK Story] Game functions not found yet, retrying in 200ms...');
    setTimeout(function() { self._applyOverrides(); }, 200);
    return;
  }

  var _origOpen = window.openQuestion;
  var _origPick = window.pickAnswer;
  var _origWaypoint = window.onReachedWaypoint;
  var _origVictory = window.showVictory;

  window.openQuestion = function() {
    var idx = typeof stoneIdx !== 'undefined' ? stoneIdx : 0;
    var doBoss = idx === 5 ? 'thornback' : idx === 10 ? 'grimfang' : idx === 15 ? 'malachar' : null;
    self._runPre(idx, function() {
      if (doBoss) {
        self.showBossEncounter(doBoss, function() { _origOpen.call(window); });
      } else {
        _origOpen.call(window);
      }
    });
  };

  window.pickAnswer = function(idx) {
    if (typeof answered !== 'undefined' && answered) return;
    if (typeof answered !== 'undefined') answered = true;
    var isCorrect = (typeof shuffledCorrect !== 'undefined') && idx === shuffledCorrect;
    var curStone = typeof stoneIdx !== 'undefined' ? stoneIdx : 0;
    _origPick.call(window, idx);
    self._runPost(curStone, isCorrect);
  };

  window.onReachedWaypoint = function() {
    var idx = typeof stoneIdx !== 'undefined' ? stoneIdx : 0;
    if (idx === 6) {
      if (typeof gameState !== 'undefined') gameState = 'MODAL';
      setTimeout(function() {
        self.showZoneTransition(2, function() {
          if (typeof gameState !== 'undefined') gameState = 'QUESTIONING';
          _origOpen.call(window);
        });
      }, 400);
    } else if (idx === 11) {
      if (typeof gameState !== 'undefined') gameState = 'MODAL';
      setTimeout(function() {
        self.showZoneTransition(3, function() {
          if (typeof gameState !== 'undefined') gameState = 'QUESTIONING';
          _origOpen.call(window);
        });
      }, 400);
    } else {
      _origWaypoint.call(window);
    }
  };

  window.showVictory = function() {
    self.showNarrative('vera',
      '⚡ "The darkness lifts! Malachar is defeated! Knight — you have saved Codehaven. Our data integrity is restored. Our users are protected. The realm breathes again. You are a true Security Knight. —Princess Vera" ⚡',
      function() {
        self.showNarrative('merlin',
          'You have done it. SQL Injection to Logging Failures — all mastered. Thornback\'s orcs are routed. Grimfang\'s trolls have fled. Malachar dissolves into the void. Codehaven stands because of YOU. Your certificate awaits, Knight.',
          function() { _origVictory.call(window); }
        );
      }
    );
  };

  console.log('[SK Story] ✅ Story system installed & game flow overrides applied.');
},

// ──────────────────────────────────────────────
// SELF-INSTALL
// ──────────────────────────────────────────────
install: function() {
  // 1. Inject CSS
  var style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  // 2. Inject HTML overlays
  var wrap = document.createElement('div');
  wrap.innerHTML = HTML;
  while (wrap.firstChild) document.body.appendChild(wrap.firstChild);

  // 3. Apply game flow overrides after DOM is fully ready
  var self = this;
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(function() { self._applyOverrides(); }, 100);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() { self._applyOverrides(); }, 100);
    });
  }

  console.log('[SK Story] CSS & HTML injected. Waiting for game functions...');
}

}; // end SK

// Auto-install
SK.install();

})(); // end IIFE
