/*═══════════════════════════════════════════
   ANIMEX v4 — SPATIAL AUDIO (Web Audio API)
══════════════════════════════════════════*/

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration, vol) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Ignore audio context errors before user interaction
  }
}

// Hover "tick" sound
function playHoverSound() {
  playTone(800, 'sine', 0.05, 0.015);
}

// Click "pop" sound
function playClickSound() {
  playTone(400, 'triangle', 0.1, 0.04);
  setTimeout(() => playTone(600, 'sine', 0.1, 0.02), 20);
}

// Bind sounds to document events
document.addEventListener('mouseover', e => {
  if (e.target.closest('.anime-card, .btn-sm, .modal-btn, .nav-link, .hero-dot, .filter-pill, .suggestion-item, .mood-btn')) {
    playHoverSound();
  }
}, {passive: true});

document.addEventListener('mousedown', e => {
  if (e.target.closest('button, a, .anime-card, .rec-card, .char-card')) {
    playClickSound();
  }
}, {passive: true});
