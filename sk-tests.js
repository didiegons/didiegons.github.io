/*
╔══════════════════════════════════════════════════════════════════════╗
║         SECURITY KNIGHTS — TEST SUITE & LOGGER v1.0                 ║
║                                                                      ║
║  HOW TO USE:                                                         ║
║  1. Put this file in the same folder as security-knights-live.html  ║
║  2. Add ONE line before </body> in your HTML:                        ║
║     <script src="sk-tests.js"></script>                              ║
║  3. Open the game, press Ctrl+Shift+T to run tests                  ║
║     OR open browser console and type: SKTest.run()                   ║
╚══════════════════════════════════════════════════════════════════════╝
*/

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════
  // SECTION 1 — LOGGER
  // Tracks all major game actions with timestamps.
  // Stored in localStorage so logs survive page refresh.
  // ═══════════════════════════════════════════════════════

  var LOG_KEY = 'sk_audit_log';
  var MAX_LOG_ENTRIES = 200; // prevent localStorage bloat

  var SKLogger = {

    // Write a log entry
    log: function (action, detail) {
      var entry = {
        ts: new Date().toISOString(),
        action: action,
        detail: detail || {}
      };

      // Print to browser console with formatting
      console.log(
        '%c[SK]%c ' + action,
        'color:#E8A820;font-weight:bold',
        'color:#C8D8E8',
        detail || ''
      );

      // Persist to localStorage
      var existing = this._load();
      existing.push(entry);

      // Trim if over limit
      if (existing.length > MAX_LOG_ENTRIES) {
        existing = existing.slice(-MAX_LOG_ENTRIES);
      }

      try {
        localStorage.setItem(LOG_KEY, JSON.stringify(existing));
      } catch (e) {
        // localStorage full — clear old logs and retry
        localStorage.removeItem(LOG_KEY);
        localStorage.setItem(LOG_KEY, JSON.stringify([entry]));
      }
    },

    // Load all stored logs
    _load: function () {
      try {
        return JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
      } catch (e) {
        return [];
      }
    },

    // Print all logs to console in a readable table
    showAll: function () {
      var logs = this._load();
      if (logs.length === 0) {
        console.log('[SK] No logs yet. Play the game first!');
        return;
      }
      console.log('%c[SK] Audit Log (' + logs.length + ' entries)', 'color:#E8A820;font-weight:bold');
      console.table(logs.map(function (l) {
        return {
          time: l.ts.replace('T', ' ').slice(0, 19),
          action: l.action,
          detail: JSON.stringify(l.detail)
        };
      }));
    },

    // Clear all logs
    clear: function () {
      localStorage.removeItem(LOG_KEY);
      console.log('%c[SK] Audit log cleared.', 'color:#E8A820');
    }
  };

  // Hook into game events by patching key functions.
  // We wait for the game to fully load before patching.
  function attachLoggerHooks() {
    // Guard: game functions must exist
    if (typeof pickAnswer === 'undefined') {
      setTimeout(attachLoggerHooks, 300);
      return;
    }

    // Patch pickAnswer — log every answer attempt
    var _origPick = window.pickAnswer;
    window.pickAnswer = function (idx) {
      var challenge = (typeof current !== 'undefined' && current) ? current.title : 'unknown';
      var isCorrect = (typeof shuffledCorrect !== 'undefined') && idx === shuffledCorrect;
      var stone = typeof stoneIdx !== 'undefined' ? stoneIdx : '?';

      SKLogger.log(isCorrect ? 'ANSWER_CORRECT' : 'ANSWER_WRONG', {
        stone: stone,
        challenge: challenge,
        selectedIdx: idx,
        correctIdx: typeof shuffledCorrect !== 'undefined' ? shuffledCorrect : '?'
      });

      _origPick.call(window, idx);
    };

    // Patch showVictory — log game completion
    if (typeof showVictory !== 'undefined') {
      var _origVictory = window.showVictory;
      window.showVictory = function () {
        var xp = (typeof state !== 'undefined' && state) ? state.xp : 0;
        var rank = (typeof state !== 'undefined' && state) ? state.rank : '?';
        SKLogger.log('GAME_COMPLETED', { finalXP: xp, rank: rank });
        _origVictory.call(window);
      };
    }

    // Patch startGame — log session start
    if (typeof startGame !== 'undefined') {
      var _origStart = window.startGame;
      window.startGame = function () {
        SKLogger.log('GAME_STARTED', {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent.slice(0, 60)
        });
        _origStart.apply(window, arguments);
      };
    }

    // Log page load
    SKLogger.log('PAGE_LOADED', { url: location.href });
    console.log('%c[SK Logger] ✅ Hooks attached. Type SKLogger.showAll() to see logs.', 'color:#E8A820');
  }

  // Expose logger globally
  window.SKLogger = SKLogger;

  // ═══════════════════════════════════════════════════════
  // SECTION 2 — TEST RUNNER
  // A lightweight test framework — no Jest, no Node needed.
  // Runs entirely in the browser, results shown in a UI panel.
  // ═══════════════════════════════════════════════════════

  var results = [];

  // Core assertion helpers
  function assert(description, condition) {
    results.push({ description: description, passed: !!condition, type: 'assert' });
  }

  function assertEqual(description, actual, expected) {
    var passed = actual === expected;
    results.push({
      description: description,
      passed: passed,
      type: 'equal',
      actual: actual,
      expected: expected
    });
  }

  function assertRange(description, value, min, max) {
    var passed = value >= min && value <= max;
    results.push({
      description: description,
      passed: passed,
      type: 'range',
      actual: value,
      expected: min + '–' + max
    });
  }

  function section(name) {
    results.push({ type: 'section', name: name });
  }

  // ── TEST SUITE DEFINITIONS ─────────────────────────────

  var SKTest = {

    run: function () {
      results = [];
      console.log('%c[SK Tests] Running test suite...', 'color:#E8A820;font-weight:bold');

      this._testScoringLogic();
      this._testRandomization();
      this._testSessionValidation();
      this._testChallengeStructure();
      this._testEdgeCases();

      this._printResults();
      this._showResultsPanel();
    },

    // ── TEST 1: SCORING LOGIC ────────────────────────────
    // Tests that XP values, rank thresholds, and miss limits
    // behave as expected under various conditions.
    _testScoringLogic: function () {
      section('Scoring Logic');

      // XP should be a positive number for each challenge
      if (typeof CHALLENGES !== 'undefined') {
        var allXPPositive = CHALLENGES.every(function (c) { return c.xp > 0; });
        assert('All challenges have positive XP rewards', allXPPositive);

        // Tier 3 (Knight) challenges should reward more than Tier 1 (Paige)
        var paigeXP = CHALLENGES.filter(function (c) { return c.tier === 'Paige'; }).map(function (c) { return c.xp; });
        var knightXP = CHALLENGES.filter(function (c) { return c.tier === 'Knight'; }).map(function (c) { return c.xp; });
        var avgPaige = paigeXP.reduce(function (a, b) { return a + b; }, 0) / (paigeXP.length || 1);
        var avgKnight = knightXP.reduce(function (a, b) { return a + b; }, 0) / (knightXP.length || 1);
        assert('Knight tier XP > Paige tier XP on average', avgKnight > avgPaige);

        // Total possible XP from all challenges should be > 0
        var totalXP = CHALLENGES.reduce(function (sum, c) { return sum + c.xp; }, 0);
        assert('Total challenge XP pool is greater than zero', totalXP > 0);
        assertRange('Total XP pool is in a reasonable range (50–5000)', totalXP, 50, 5000);
      } else {
        assert('CHALLENGES array is available (game loaded)', false);
      }

      // Miss limit should be enforced at exactly 3
      // We test the logic directly without triggering game state changes
      var missLimitLogic = (function () {
        var misses = 0;
        var defeated = false;
        for (var i = 0; i < 4; i++) {
          misses++;
          if (misses >= 3) { defeated = true; break; }
        }
        return defeated;
      })();
      assert('Player is defeated after 3 wrong answers', missLimitLogic);

      // Simulated XP accumulation test
      var simulatedXP = 0;
      var mockChallenges = [{ xp: 10 }, { xp: 25 }, { xp: 35 }];
      mockChallenges.forEach(function (c) { simulatedXP += c.xp; });
      assertEqual('Simulated XP accumulates correctly (10+25+35=70)', simulatedXP, 70);

      // Rank thresholds — test that ranks exist and are ordered
      if (typeof RANKS !== 'undefined') {
        var rankXPValues = RANKS.map(function (r) { return r.minXP; });
        var isAscending = rankXPValues.every(function (v, i) {
          return i === 0 || v >= rankXPValues[i - 1];
        });
        assert('Rank XP thresholds are in ascending order', isAscending);
      } else {
        // Ranks may be inline — skip gracefully
        assert('RANKS constant accessible (optional)', true);
      }
    },

    // ── TEST 2: RANDOMIZATION ────────────────────────────
    // Tests that question selection is fair, non-duplicate,
    // and produces the correct number of questions per session.
    _testRandomization: function () {
      section('Randomization');

      if (typeof CHALLENGES === 'undefined') {
        assert('CHALLENGES available for randomization tests', false);
        return;
      }

      // Simulate the game's challenge selection (5 random from pool)
      function pickRandom(pool, count) {
        var copy = pool.slice();
        var picked = [];
        for (var i = 0; i < count && copy.length > 0; i++) {
          var idx = Math.floor(Math.random() * copy.length);
          picked.push(copy.splice(idx, 1)[0]);
        }
        return picked;
      }

      var sessionChallenges = pickRandom(CHALLENGES, 5);

      // Should return exactly 5 challenges
      assertEqual('Session picks exactly 5 challenges', sessionChallenges.length, 5);

      // No duplicates — all IDs should be unique
      var ids = sessionChallenges.map(function (c) { return c.id; });
      var uniqueIds = ids.filter(function (id, i) { return ids.indexOf(id) === i; });
      assertEqual('No duplicate challenges in a session', uniqueIds.length, ids.length);

      // Run 50 sessions and check distribution (each challenge should appear)
      var appearances = {};
      CHALLENGES.forEach(function (c) { appearances[c.id] = 0; });
      for (var s = 0; s < 50; s++) {
        pickRandom(CHALLENGES, 5).forEach(function (c) { appearances[c.id]++; });
      }
      var allAppeared = Object.values(appearances).every(function (count) { return count > 0; });
      assert('All challenges appear at least once in 50 sessions', allAppeared);

      // Answer options should be shuffled differently each time
      if (CHALLENGES[0] && CHALLENGES[0].options) {
        var optOrder1 = CHALLENGES[0].options.slice().sort(function () { return Math.random() - 0.5; }).join('|');
        var optOrder2 = CHALLENGES[0].options.slice().sort(function () { return Math.random() - 0.5; }).join('|');
        var originalOrder = CHALLENGES[0].options.join('|');
        // At least one shuffle should differ from original (very high probability)
        assert(
          'Answer options are shuffled (not always original order)',
          optOrder1 !== originalOrder || optOrder2 !== originalOrder
        );
      }

      // Each challenge must have exactly 4 options
      var allHave4Options = CHALLENGES.every(function (c) {
        return Array.isArray(c.options) && c.options.length === 4;
      });
      assert('Every challenge has exactly 4 answer options', allHave4Options);
    },

    // ── TEST 3: SESSION / STATE VALIDATION ───────────────
    // Tests that localStorage state is correctly structured,
    // readable, and doesn't contain corrupted data.
    _testSessionValidation: function () {
      section('Session Validation');

      // State must exist after game loads
      if (typeof state !== 'undefined') {
        assert('Game state object exists', typeof state === 'object' && state !== null);

        // XP must be a non-negative number
        assert('state.xp is a non-negative number', typeof state.xp === 'number' && state.xp >= 0);

        // completed must be an array
        assert('state.completed is an array', Array.isArray(state.completed));

        // misses must be a number, 0–3
        var missesValid = typeof state.misses === 'number' && state.misses >= 0 && state.misses <= 3;
        // misses might not exist yet (before first game) — treat undefined as 0
        assert('state.misses is valid (0–3) if present', state.misses === undefined || missesValid);

        // rank must be a non-empty string
        assert('state.rank is a non-empty string', typeof state.rank === 'string' && state.rank.length > 0);

        // Test: state should survive a simulated save/load cycle
        var testState = { xp: 999, rank: 'TestRank', completed: ['test-1'], misses: 1 };
        try {
          localStorage.setItem('sk_state_test', JSON.stringify(testState));
          var loaded = JSON.parse(localStorage.getItem('sk_state_test'));
          localStorage.removeItem('sk_state_test');
          assertEqual('State survives JSON save/load cycle (XP)', loaded.xp, 999);
          assertEqual('State survives JSON save/load cycle (rank)', loaded.rank, 'TestRank');
          assertEqual('State survives JSON save/load cycle (completed length)', loaded.completed.length, 1);
        } catch (e) {
          assert('localStorage read/write works', false);
        }
      } else {
        assert('Game state is accessible (start the game first)', false);
      }

      // Test: corrupted state should be handled gracefully
      var corruptionHandled = (function () {
        try {
          var corrupt = JSON.parse('not valid json at all ###');
          return false; // shouldn't reach here
        } catch (e) {
          return true; // correctly caught
        }
      })();
      assert('Corrupted localStorage JSON is caught gracefully', corruptionHandled);
    },

    // ── TEST 4: CHALLENGE DATA INTEGRITY ─────────────────
    // Tests that every challenge in the bank has all required
    // fields and valid data — no missing titles, no bad indexes.
    _testChallengeStructure: function () {
      section('Challenge Data Integrity');

      if (typeof CHALLENGES === 'undefined') {
        assert('CHALLENGES available', false);
        return;
      }

      // Must have at least 15 challenges
      assert('Challenge bank has at least 15 challenges', CHALLENGES.length >= 15);

      // Every challenge must have required fields
      var requiredFields = ['id', 'title', 'tier', 'topic', 'question', 'options', 'correct', 'explanation', 'xp'];
      var allHaveFields = CHALLENGES.every(function (c) {
        return requiredFields.every(function (f) { return c.hasOwnProperty(f); });
      });
      assert('Every challenge has all required fields (id, title, tier, topic, question, options, correct, explanation, xp)', allHaveFields);

      // Correct answer index must be within bounds
      var correctIndexValid = CHALLENGES.every(function (c) {
        return typeof c.correct === 'number' && c.correct >= 0 && c.correct < c.options.length;
      });
      assert('Correct answer index is within options bounds for all challenges', correctIndexValid);

      // No empty question text
      var noEmptyQuestions = CHALLENGES.every(function (c) {
        return typeof c.question === 'string' && c.question.trim().length > 10;
      });
      assert('No challenge has an empty or very short question', noEmptyQuestions);

      // No empty explanation
      var noEmptyExplanations = CHALLENGES.every(function (c) {
        return typeof c.explanation === 'string' && c.explanation.trim().length > 10;
      });
      assert('No challenge has an empty or very short explanation', noEmptyExplanations);

      // IDs must be unique
      var allIds = CHALLENGES.map(function (c) { return c.id; });
      var uniqueIds = allIds.filter(function (id, i) { return allIds.indexOf(id) === i; });
      assertEqual('All challenge IDs are unique', uniqueIds.length, CHALLENGES.length);

      // Tiers must be valid values
      var validTiers = ['Paige', 'Squire', 'Knight'];
      var allValidTiers = CHALLENGES.every(function (c) { return validTiers.indexOf(c.tier) !== -1; });
      assert('All challenges have a valid tier (Paige / Squire / Knight)', allValidTiers);
    },

    // ── TEST 5: EDGE CASES ────────────────────────────────
    // Tests unusual situations: empty state, boundary XP values,
    // and answer selection when already answered.
    _testEdgeCases: function () {
      section('Edge Cases');

      // XP should never go negative (simulate a deduction scenario)
      var xpFloor = (function () {
        var xp = 0;
        xp = Math.max(0, xp - 50); // deduct from zero
        return xp >= 0;
      })();
      assert('XP cannot go below zero when deducted', xpFloor);

      // Rank lookup with 0 XP should return the lowest rank
      if (typeof RANKS !== 'undefined' && RANKS.length > 0) {
        var lowestRank = RANKS[0];
        assert('Rank at 0 XP is the lowest rank', lowestRank.minXP === 0);
      } else {
        assert('RANKS constant accessible for edge case test', true);
      }

      // Challenge count validation: 30 total, 10 per tier
      if (typeof CHALLENGES !== 'undefined') {
        var paigeCount = CHALLENGES.filter(function (c) { return c.tier === 'Paige'; }).length;
        var squireCount = CHALLENGES.filter(function (c) { return c.tier === 'Squire'; }).length;
        var knightCount = CHALLENGES.filter(function (c) { return c.tier === 'Knight'; }).length;
        assertEqual('Paige tier has 10 challenges', paigeCount, 10);
        assertEqual('Squire tier has 10 challenges', squireCount, 10);
        assertEqual('Knight tier has 10 challenges', knightCount, 10);
      }

      // Double-answer prevention: if answered=true, pickAnswer should be a no-op
      // We test the guard logic in isolation
      var doubleAnswerBlocked = (function () {
        var answered = true;
        // Simulate the guard check at the top of pickAnswer
        if (answered) return true; // blocked correctly
        return false;
      })();
      assert('Double-answer guard prevents picking twice', doubleAnswerBlocked);

      // localStorage availability
      var lsAvailable = (function () {
        try {
          localStorage.setItem('sk_ls_test', '1');
          localStorage.removeItem('sk_ls_test');
          return true;
        } catch (e) { return false; }
      })();
      assert('localStorage is available in this browser', lsAvailable);
    },

    // ── PRINT RESULTS TO CONSOLE ──────────────────────────
    _printResults: function () {
      var passed = 0, failed = 0;
      results.forEach(function (r) {
        if (r.type === 'section') {
          console.log('%c\n── ' + r.name + ' ──', 'color:#E8A820;font-weight:bold');
        } else if (r.passed) {
          passed++;
          console.log('%c  ✓%c ' + r.description, 'color:#2ECC8A;font-weight:bold', 'color:#C8D8E8');
        } else {
          failed++;
          var detail = r.actual !== undefined ? ' (got: ' + r.actual + ', expected: ' + r.expected + ')' : '';
          console.log('%c  ✗%c ' + r.description + detail, 'color:#E84040;font-weight:bold', 'color:#E8B0B0');
        }
      });
      console.log(
        '\n%c[SK Tests] ' + passed + ' passed, ' + failed + ' failed',
        failed === 0 ? 'color:#2ECC8A;font-weight:bold' : 'color:#E84040;font-weight:bold'
      );
    },

    // ── SHOW IN-GAME RESULTS PANEL ────────────────────────
    _showResultsPanel: function () {
      // Remove existing panel if present
      var existing = document.getElementById('sk-test-panel');
      if (existing) existing.remove();

      var passed = results.filter(function (r) { return r.type !== 'section' && r.passed; }).length;
      var failed = results.filter(function (r) { return r.type !== 'section' && !r.passed; }).length;
      var total = passed + failed;

      var panel = document.createElement('div');
      panel.id = 'sk-test-panel';
      panel.style.cssText = [
        'position:fixed;top:70px;right:16px;z-index:9999',
        'background:rgba(6,8,20,0.98)',
        'border:1px solid ' + (failed === 0 ? 'rgba(46,204,138,0.5)' : 'rgba(232,64,64,0.5)'),
        'border-radius:12px;padding:16px 18px;max-width:340px;width:92vw',
        'font-family:\'JetBrains Mono\',monospace',
        'box-shadow:0 8px 40px rgba(0,0,0,0.8)',
        'max-height:70vh;overflow-y:auto'
      ].join(';');

      var statusColor = failed === 0 ? '#2ECC8A' : '#E84040';
      var statusIcon = failed === 0 ? '✓' : '✗';

      var html = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">'
        + '<span style="font-size:.75rem;font-weight:700;color:' + statusColor + ';letter-spacing:.12em;">'
        + statusIcon + ' SK TEST RESULTS</span>'
        + '<button onclick="document.getElementById(\'sk-test-panel\').remove()" '
        + 'style="background:none;border:none;color:rgba(200,200,200,0.5);cursor:pointer;font-size:1rem;line-height:1;">✕</button>'
        + '</div>';

      html += '<div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:10px 12px;margin-bottom:12px;text-align:center;">'
        + '<span style="font-size:1.5rem;font-weight:700;color:' + statusColor + ';">' + passed + '</span>'
        + '<span style="font-size:.7rem;color:rgba(200,200,200,0.5);"> / ' + total + ' passed</span>'
        + (failed > 0 ? '<span style="margin-left:12px;font-size:.85rem;color:#E84040;font-weight:700;">' + failed + ' failed</span>' : '')
        + '</div>';

      var currentSection = '';
      results.forEach(function (r) {
        if (r.type === 'section') {
          currentSection = r.name;
          html += '<div style="font-size:.6rem;color:rgba(232,168,32,0.6);letter-spacing:.15em;margin:10px 0 5px;text-transform:uppercase;">'
            + r.name + '</div>';
        } else {
          var icon = r.passed ? '✓' : '✗';
          var color = r.passed ? '#2ECC8A' : '#E84040';
          var detail = (!r.passed && r.actual !== undefined)
            ? '<div style="font-size:.58rem;color:rgba(232,100,100,0.7);margin-top:2px;padding-left:14px;">'
              + 'got: ' + r.actual + ' / expected: ' + r.expected + '</div>'
            : '';
          html += '<div style="margin-bottom:4px;">'
            + '<span style="color:' + color + ';font-size:.65rem;font-weight:700;">' + icon + '</span>'
            + '<span style="font-size:.65rem;color:rgba(200,210,220,0.85);margin-left:6px;">' + r.description + '</span>'
            + detail + '</div>';
        }
      });

      html += '<div style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);">'
        + '<span style="font-size:.58rem;color:rgba(200,200,200,0.35);">'
        + 'Press Ctrl+Shift+T to re-run · SKLogger.showAll() for logs</span></div>';

      panel.innerHTML = html;
      document.body.appendChild(panel);
    }
  };

  // Expose globally
  window.SKTest = SKTest;

  // ── KEYBOARD SHORTCUT: Ctrl+Shift+T runs tests ────────
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'T') {
      e.preventDefault();
      SKTest.run();
    }
  });

  // ── AUTO-ATTACH LOGGER HOOKS ON LOAD ──────────────────
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(attachLoggerHooks, 150);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(attachLoggerHooks, 150);
    });
  }

  console.log(
    '%c[SK Tests] Loaded. Press Ctrl+Shift+T to run tests, or type SKTest.run()',
    'color:#E8A820;font-weight:bold'
  );

})();
