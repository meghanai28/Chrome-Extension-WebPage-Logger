let eventBuffer = [];
let isRecording = false;
let flushInterval = null;

const SAMPLE_RATE_MS = 20; 
let lastMouseTime = 0;
const BLACKLIST_KEYWORDS = ["login", "signin", "password"];

function isSafeUrl() {
  const url = window.location.href.toLowerCase();
  return !BLACKLIST_KEYWORDS.some(keyword => url.includes(keyword));
}

chrome.storage.local.get(['isRecording'], (result) => {
  if (result.isRecording && isSafeUrl()) {
    startLogging();
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.isRecording) {
    if (changes.isRecording.newValue && isSafeUrl()) {
      startLogging();
    } else {
      stopLogging();
    }
  }
});

function startLogging() {
    if (isRecording) return;
    isRecording = true;
    console.log("RL Collector: Started");
  
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('mousedown', handleClick, true);
    document.addEventListener('keydown', handleKey, true);
    document.addEventListener('keyup', handleKey, true);   
    document.addEventListener('scroll', handleScroll, true);
    
    window.addEventListener('pagehide', flushBuffer); 
    window.addEventListener('beforeunload', flushBuffer);
  
    flushInterval = setInterval(flushBuffer, 3000);
}
  
function stopLogging() {
    if (!isRecording) return;
    flushBuffer();
    isRecording = false;
    console.log("RL Collector: Stopped");
  
    document.removeEventListener('mousemove', handleMouseMove, true);
    document.removeEventListener('mousedown', handleClick, true);
    document.removeEventListener('keydown', handleKey, true);
    document.removeEventListener('keyup', handleKey, true);
    document.removeEventListener('scroll', handleScroll, true);
  
    window.removeEventListener('pagehide', flushBuffer);
    window.removeEventListener('beforeunload', flushBuffer);
    
    if (flushInterval) clearInterval(flushInterval);
}


function flushBuffer() {
  if (eventBuffer.length === 0) return;

  
  chrome.runtime.sendMessage({
    action: "log_batch",
    data: eventBuffer
  });

  eventBuffer = [];
}


function handleMouseMove(e) {
  const now = Date.now();
  if (now - lastMouseTime < SAMPLE_RATE_MS) return; 
  lastMouseTime = now;
  logEvent({ type: 'mousemove', x: e.clientX, y: e.clientY, ts: now });
}

function handleClick(e) {
  logEvent({ type: 'click', x: e.clientX, y: e.clientY, button: e.button, ts: Date.now() });
}

function handleScroll(e) {
  logEvent({ type: 'scroll', scrollX: window.scrollX, scrollY: window.scrollY, ts: Date.now() });
}

function handleKey(e) {
  const isSensitive = (e.target.type === 'password');
  logEvent({ 
    type: e.type, 
    key: isSensitive ? 'REDACTED' : e.key, 
    code: e.code, 
    isSensitive: isSensitive, 
    ts: Date.now() 
  });
}

function logEvent(data) {
  data.url = window.location.hostname;
  data.winW = window.innerWidth;
  data.winH = window.innerHeight;
  eventBuffer.push(data);
}