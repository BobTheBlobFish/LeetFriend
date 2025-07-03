// Inject @font-face for 'Android 7' font using chrome.runtime.getURL for Chrome extension compatibility
const fontUrl = chrome.runtime.getURL('leetfriend-fonts/Android 7.ttf');
const fontFaceStyle = document.createElement('style');
fontFaceStyle.textContent = `
@font-face {
  font-family: 'Android 7';
  src: url('${fontUrl}') format('truetype');
  font-weight: normal;
  font-style: normal;
}
.leetfriend-heading {
  font-family: 'Android 7', sans-serif !important;
  letter-spacing: 1px;
  font-size: 2.1em;
  color: #7ee787;
  display: block;
  text-align: center;
  margin-bottom: 8px;
}
`;
document.head.appendChild(fontFaceStyle);

// Overlay creation
const overlay = document.createElement('div');
overlay.id = 'leetfriend-overlay';
overlay.style.position = 'fixed';
overlay.style.top = '140px';
overlay.style.left = '100px';
overlay.style.width = '420px';
overlay.style.minWidth = '320px';
overlay.style.maxWidth = '520px';
overlay.style.maxHeight = '90vh';
overlay.style.overflowY = 'auto';
overlay.style.background = 'rgba(18, 20, 28, 0.75)';
overlay.style.color = '#e6e6e6';
overlay.style.borderRadius = '10px';
overlay.style.zIndex = '9999';
overlay.style.display = 'flex';
overlay.style.flexDirection = 'column';
overlay.style.justifyContent = 'center';
overlay.style.alignItems = 'center';
overlay.style.padding = '24px';
overlay.style.userSelect = 'none';
overlay.style.border = '1.5px solid #23263a';
overlay.style.boxShadow = '0 8px 32px 0 rgba(0,0,0,0.45)';

// Insert LeetuHi image just above the LeetFriend heading, absolutely positioned
const leetuHiImg = document.createElement('img');
leetuHiImg.src = chrome.runtime.getURL('icons/LeetuHi.png');
leetuHiImg.alt = 'LeetuHi';
leetuHiImg.style.position = 'absolute';
leetuHiImg.style.top = '-38px'; // adjust as needed for your image height
leetuHiImg.style.left = '50%';
leetuHiImg.style.transform = 'translateX(-50%)';
leetuHiImg.style.width = '54px'; // adjust as needed
leetuHiImg.style.height = '54px'; // adjust as needed
leetuHiImg.style.zIndex = '10001';
leetuHiImg.style.pointerEvents = 'none';
overlay.appendChild(leetuHiImg);

overlay.innerHTML = `


  <div style="width:100%;display:flex;flex-direction:column;align-items:center;margin-bottom:8px;position:relative;">
    
    <strong class="leetfriend-heading">💡 LEETFRIEND</strong>
  </div>
  
  <p>Use "Prev Hint" or "Next Hint" to navigate.</p>
  <div style="font-size: 12px; margin-top: 8px; text-align: left; background: rgba(255,255,255,0.08); border-radius: 6px; padding: 6px 8px; width: 100%;">
    <strong>Shortcuts:</strong><br>
    <kbd>Ctrl+B</kbd> Show/Hide<br>
    <kbd>Ctrl+Shift</kbd> + <kbd>↑</kbd>/<kbd>↓</kbd>/<kbd>←</kbd>/<kbd>→</kbd> Move<br>
    <kbd>Ctrl+Q</kbd> Next Hint<br>
    <kbd>Ctrl+D</kbd> Prev Hint<br>
    <kbd>Ctrl+M</kbd> Toggle Translucency
  </div>
`;
document.body.appendChild(overlay);

const style = document.createElement('style');
style.textContent = `
  .leetfriend-hint h1, .leetfriend-hint h2, .leetfriend-hint h3 {
    color: #7ee787; margin: 8px 0 4px;
  }
  .leetfriend-hint pre {
    background: #181a23; color: #e6e6e6; border-radius: 8px; padding: 12px; overflow-x: auto; margin: 10px 0; border: 1.5px solid #23263a;
  }
  .leetfriend-hint code {
    font-family: monospace; font-size: 13px; background: #23263a; color: #b5e0ff; border-radius: 6px; padding: 2px 6px;
  }
  .leetfriend-hint p { margin: 7px 0; }
  .leetfriend-hint ul { margin: 7px 0; padding-left: 22px; }
  .leetfriend-hint li { margin-bottom: 5px; }
  .leetfriend-italic-bullet { margin: 8px 0 8px 0; font-style: italic; color: #8b949e; }
  .leetfriend-hr { border: none; border-top: 2px solid #23263a; margin: 20px 0; }
`;
document.head.appendChild(style);

// Add resize handle to overlay
const resizeHandle = document.createElement('div');
resizeHandle.style.position = 'absolute';
resizeHandle.style.width = '22px';
resizeHandle.style.height = '22px';
resizeHandle.style.right = '2px';
resizeHandle.style.bottom = '2px';
resizeHandle.style.cursor = 'nwse-resize';
resizeHandle.style.background = 'rgba(255,255,255,0.08)';
resizeHandle.style.borderRadius = '6px';
resizeHandle.style.zIndex = '10000';
resizeHandle.title = 'Resize';
resizeHandle.innerHTML = `<svg width="18" height="18" style="margin:2px;opacity:0.7;" viewBox="0 0 18 18"><path d="M3 15h12M6 12h9M9 9h6" stroke="#bbb" stroke-width="2" fill="none"/></svg>`;
overlay.appendChild(resizeHandle);

let isDragging = false, offsetX = 0, offsetY = 0;
let isResizing = false, startWidth = 0, startHeight = 0, startMouseX = 0, startMouseY = 0;

overlay.addEventListener('mousedown', (e) => {
  if (e.target === resizeHandle) return;
  isDragging = true;
  offsetX = e.clientX - overlay.offsetLeft;
  offsetY = e.clientY - overlay.offsetTop;
});

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const minLeft = 0;
    const minTop = 0;
    const maxLeft = window.innerWidth - overlay.offsetWidth;
    const maxTop = window.innerHeight - overlay.offsetHeight;
    let newLeft = e.clientX - offsetX;
    let newTop = e.clientY - offsetY;
    newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));
    newTop = Math.max(minTop, Math.min(maxTop, newTop));
    overlay.style.left = `${newLeft}px`;
    overlay.style.top = `${newTop}px`;
  } else if (isResizing) {
    let newWidth = startWidth + (e.clientX - startMouseX);
    let newHeight = startHeight + (e.clientY - startMouseY);
    newWidth = Math.max(320, Math.min(1200, newWidth));
    newHeight = Math.max(260, Math.min(window.innerHeight - 40, newHeight));
    overlay.style.width = `${newWidth}px`;
    overlay.style.height = `${newHeight}px`;
    overlay.style.minWidth = '320px';
    overlay.style.maxWidth = '1200px';
    overlay.style.minHeight = '260px';
    overlay.style.maxHeight = '90vh';
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  isResizing = false;
});

resizeHandle.addEventListener('mousedown', (e) => {
  e.stopPropagation();
  isResizing = true;
  startWidth = overlay.offsetWidth;
  startHeight = overlay.offsetHeight;
  startMouseX = e.clientX;
  startMouseY = e.clientY;
});

overlay.style.position = 'fixed';
overlay.style.boxSizing = 'border-box';
overlay.style.resize = 'none';

const hintsContainer = document.createElement('div');
hintsContainer.style.width = '100%';
hintsContainer.style.display = 'flex';
hintsContainer.style.flexDirection = 'column';
hintsContainer.style.gap = '12px';
hintsContainer.style.marginTop = '16px';
hintsContainer.style.maxHeight = 'calc(90vh - 150px)';
hintsContainer.style.overflowY = 'auto';
overlay.appendChild(hintsContainer);

const btnContainer = document.createElement('div');
btnContainer.style.display = 'flex';
btnContainer.style.gap = '12px';
btnContainer.style.marginTop = '10px';
btnContainer.style.paddingTop = '10px';
overlay.appendChild(btnContainer);

const prevBtn = document.createElement('button');
prevBtn.innerText = 'Prev Hint';
prevBtn.style.padding = '5px 14px';
prevBtn.style.borderRadius = '5px';
prevBtn.style.border = '2px solid #bbb';
prevBtn.style.background = '#eee';
prevBtn.style.color = '#888';
prevBtn.disabled = true;

const nextBtn = document.createElement('button');
nextBtn.innerText = 'Next Hint';
styleHintButton(nextBtn);

// Only append nextBtn by default
btnContainer.appendChild(nextBtn);

// Add loading icon SVG inside the Next Hint button, hidden by default
nextBtn.innerHTML = `Next Hint <span class="leetfriend-loading-spinner" style="display:none;margin-left:8px;vertical-align:middle;"><svg width="18" height="18" viewBox="0 0 50 50" style="display:block;" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="25" r="20" fill="none" stroke="#444" stroke-width="4" stroke-linecap="round" stroke-dasharray="31.4 31.4" transform="rotate(-90 25 25)"><animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.8s" repeatCount="indefinite"/></circle></svg></span>`;

let currentStage = 1;
let currentIndex = -1;
let fetchedHints = [];

// 1. Inject highlight.js CSS
const hljsCSS = document.createElement('link');
hljsCSS.rel = 'stylesheet';
hljsCSS.href = chrome.runtime.getURL('highlight/github-dark.min.css');
document.head.appendChild(hljsCSS);

// 2. Inject highlight.js JS and run highlighting after it loads
function loadHighlightJSAndApply() {
  return new Promise((resolve) => {
    if (window.hljs) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('highlight/highlight.min.js');
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

// 3. Function to highlight all code blocks
function highlightAllCodeBlocks() {
  if (window.hljs) {
    document.querySelectorAll('pre code').forEach(block => {
      window.hljs.highlightElement(block);
    });
  }
}

function renderHintMarkdown(md) {
  if (window.marked && typeof window.marked.parse === 'function') return window.marked.parse(md);

  md = md.replace(/```(\w*)\n?([\s\S]*?)```/g, function(_, lang, code) {
    const codeId = 'leetfriend-code-' + Math.random().toString(36).substr(2, 9);
    return `<div class='leetfriend-code-wrap' style='position:relative;'>
      <button class='leetfriend-copy-btn' data-code-id='${codeId}' title='Copy code' style='position:absolute;top:8px;right:8px;padding:4px 8px;font-size:15px;border-radius:5px;border:none;background:rgba(40,40,40,0.95);color:#fff;cursor:pointer;z-index:2;box-shadow:0 1px 4px #0002;transition:background 0.2s;'>
        <span class='leetfriend-copy-icon' style='display:inline-block;vertical-align:middle;'>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style="vertical-align:middle;" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="7" width="9" height="9" rx="2" stroke="#fff" stroke-width="1.5" fill="none"/><rect x="7.5" y="4" width="9" height="9" rx="2" stroke="#bbb" stroke-width="1.2" fill="none"/></svg>
        </span>
      </button>
      <pre style='margin-top:0;'><code id='${codeId}' class='language-${lang || "plaintext"}' style='user-select:text;'>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
    </div>`;
  });

  md = md.replace(/^\s*(---|\*\*\*)\s*$/gm, "<hr class='leetfriend-hr'>");
  md = md.replace(/^####\s+(.*)$/gm, "<br><h4 style='color:#e0e0e0;margin:8px 0 4px;'>$1</h4>");
  md = md.replace(/^###\s+(.*)$/gm, "<br><h3 style='color:#c3ff99;margin:8px 0 4px;'>$1</h3>");
  md = md.replace(/^##\s+(.*)$/gm, "<br><h2 style='color:#c3ff99;margin:10px 0 6px;font-size:1.2em;'>$1</h2>");
  md = md.replace(/^#\s+(.*)$/gm, "<br><h1 style='color:#c3ff99;margin:12px 0 8px;font-size:1.4em;'>$1</h1>");
  md = md.replace(/(\d+)\^(\d+)/g, "$1<sup>$2</sup>");
  let html = md.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|\W)_(\S[^_]*\S)_($|\W)/g, "$1<em>$2</em>$3")
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, "<code style='background:#23272f;border-radius:6px;padding:2px 6px;font-size:13px;color:#e0e0e0;user-select:text;'>$1</code>")
    .replace(/^\s*[-*]\s+(.*)$/gm, function(_, item) {
      if (/^<em>.*<\/em>$/.test(item.trim())) {
        return `<li class='leetfriend-italic-bullet'>${item}</li>`;
      }
      return `<li>${item}</li>`;
    });
  html = `<p>${html.replace(/\n{2,}/g, '</p><p>')}</p>`;
  html = html.replace(/<p>(\s*)?(<pre>[\s\S]*?<\/pre>)(\s*)<\/p>/g, '$2');
  html = html.replace(/<p>(\s*)?(<h[1-4][\s\S]*?<\/h[1-4]>)(\s*)<\/p>/g, '$2');
  setTimeout(() => {
    loadHighlightJSAndApply().then(() => {
      highlightAllCodeBlocks();
    });
    document.querySelectorAll('.leetfriend-copy-btn').forEach(btn => {
      btn.onclick = function() {
        const codeElem = document.getElementById(btn.getAttribute('data-code-id'));
        if (codeElem) {
          navigator.clipboard.writeText(codeElem.innerText).then(() => {
            btn.innerHTML = `<span class='leetfriend-tick-icon' style='display:inline-block;vertical-align:middle;'>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 10.5L9 14L15 7" stroke="#7CFC7C" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>`;
            btn.style.background = '#2ecc40';
            setTimeout(() => {
              btn.innerHTML = `<span class='leetfriend-copy-icon' style='display:inline-block;vertical-align:middle;'>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style="vertical-align:middle;" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="7" width="9" height="9" rx="2" stroke="#fff" stroke-width="1.5" fill="none"/><rect x="7.5" y="4" width="9" height="9" rx="2" stroke="#bbb" stroke-width="1.2" fill="none"/></svg>
              </span>`;
              btn.style.background = 'rgba(40,40,40,0.95)';
            }, 1200);
          });
        }
      };
    });
  }, 0);
  return html;
}

function showHint(hintText, stageNumber) {
  overlay.style.width = '960px';
  overlay.style.minWidth = '480px';
  overlay.style.maxWidth = '1200px';
  hintsContainer.innerHTML = "";
  const hintContainer = document.createElement('div');
  hintContainer.classList.add('leetfriend-hint');
  hintContainer.style.background = isTranslucent ? 'rgba(24, 26, 35, 0.75)' : 'rgba(24, 26, 35, 0.98)';
  hintContainer.style.border = '1.5px solid #23263a';
  hintContainer.style.borderRadius = '10px';
  hintContainer.style.padding = '18px 18px 14px 18px';
  hintContainer.style.color = '#e6e6e6';
  hintContainer.style.fontSize = '15px';
  hintContainer.style.width = '100%';
  hintContainer.style.boxSizing = 'border-box';
  hintContainer.style.wordBreak = 'break-word';
  hintContainer.style.boxShadow = '0 2px 12px 0 rgba(0,0,0,0.25)';
  hintContainer.innerHTML = `<div class='leetfriend-heading' style='margin-bottom:14px;font-size:2.1em;text-align:center;line-height:1.1;'>Hint ${stageNumber}</div>` + renderHintMarkdown(hintText);
  hintsContainer.appendChild(hintContainer);

  // Show Prev Hint button only after first hint is rendered
  if (!btnContainer.contains(prevBtn)) {
    btnContainer.insertBefore(prevBtn, nextBtn);
  }
  updateButtons();
}

function showWarning(msg) { const warn = document.createElement('div'); warn.style.marginTop = '12px'; warn.style.background = 'rgba(255, 80, 80, 0.15)'; warn.style.border = '1px solid #ff8080'; warn.style.borderRadius = '6px'; warn.style.padding = '10px 12px'; warn.style.color = '#ffb3b3'; warn.style.fontSize = '14px'; warn.style.width = '100%'; warn.style.boxSizing = 'border-box'; warn.textContent = msg; hintsContainer.appendChild(warn); }
function getLeetcodeTitle() { return document.querySelector('.css-v3d350, .mr-2.text-label-1.dark\\:text-dark-label-1')?.innerText || document.querySelector('h4')?.innerText || ""; }
function getLeetcodeDescription() { return document.querySelector('.content__u3I1.question-content__JfgR, .elfjS, .whitespace-pre-line')?.innerText || document.querySelector('div[role="main"]')?.innerText || ""; }
function updateButtons() { prevBtn.disabled = currentIndex <= 0; nextBtn.disabled = currentIndex + 1 >= fetchedHints.length && currentStage > 4; applyDisabledStyle(prevBtn); applyDisabledStyle(nextBtn); }
function applyDisabledStyle(btn) {
  if (btn.disabled) {
    btn.style.background = 'transparent';
    btn.style.color = '#444';
    btn.style.border = '2px solid #444';
    btn.style.cursor = 'default';
  } else {
    btn.style.background = 'transparent';
    btn.style.color = '#2ecc40';
    btn.style.border = '2px solid #2ecc40';
    btn.style.cursor = 'default';
  }
}
function styleHintButton(btn) {
  btn.style.padding = '5px 10px';
  btn.style.borderRadius = '5px';
  btn.style.border = '2px solid #2ecc40';
  btn.style.background = 'transparent';
  btn.style.color = '#2ecc40';
  btn.style.transition = 'background 0.2s, color 0.2s';
  btn.style.cursor = 'default';
  btn.addEventListener('mouseenter', () => {
    if (!btn.disabled) {
      btn.style.background = '#2ecc40';
      btn.style.color = '#fff';
    }
  });
  btn.addEventListener('mouseleave', () => {
    if (!btn.disabled) {
      btn.style.background = 'transparent';
      btn.style.color = '#2ecc40';
    }
  });
}

styleHintButton(nextBtn);
styleHintButton(prevBtn);

nextBtn.onclick = async () => {
  if (currentIndex + 1 < fetchedHints.length) { currentIndex++; showHint(fetchedHints[currentIndex], currentIndex + 1); updateButtons(); return; }
  let title = getLeetcodeTitle(), desc = getLeetcodeDescription(), questionText = `${title}\n\n${desc}`.trim();
  if (!title && !desc) { showWarning("Could not find a LeetCode question on this page."); return; }
  // Show loading spinner inside nextBtn and grey out button
  const spinner = nextBtn.querySelector('.leetfriend-loading-spinner');
  spinner.style.display = 'inline-block';
  nextBtn.disabled = true;
  nextBtn.style.color = '#444';
  nextBtn.style.border = '2px solid #444';
  nextBtn.style.cursor = 'default';
  nextBtn.style.background = 'transparent';
  try {
    const res = await fetch("https://leetfriend.onrender.com/generate-hint", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: questionText, stage: currentStage }) });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    const hintText = data.hint?.trim() || "No hint received.";
    fetchedHints.push(hintText); currentIndex++; showHint(hintText, currentStage); currentStage++; updateButtons();
  } catch (err) {
    console.error("Fetch failed:", err); showWarning(`Error: ${err.message || "Failed to contact backend."}`);
  } finally {
    spinner.style.display = 'none';
    nextBtn.disabled = false;
    applyDisabledStyle(nextBtn);
  }
};

prevBtn.onclick = () => { if (currentIndex > 0) { currentIndex--; showHint(fetchedHints[currentIndex], currentIndex + 1); updateButtons(); } };

let overlayVisible = true;
let isTranslucent = true;
window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && e.key.toLowerCase() === 'b') {
    overlayVisible = !overlayVisible;
    overlay.style.display = overlayVisible ? 'flex' : 'none';
    e.preventDefault();
  }
  if (e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey) {
    let left = parseInt(overlay.style.left, 10);
    let top = parseInt(overlay.style.top, 10);
    const moveAmount = 40;
    const minLeft = 0;
    const minTop = 0;
    const maxLeft = window.innerWidth - overlay.offsetWidth;
    const maxTop = window.innerHeight - overlay.offsetHeight;
    switch (e.key) {
      case 'ArrowUp':
        top = Math.max(minTop, top - moveAmount);
        overlay.style.top = `${top}px`;
        e.preventDefault();
        break;
      case 'ArrowDown':
        top = Math.min(maxTop, top + moveAmount);
        overlay.style.top = `${top}px`;
        e.preventDefault();
        break;
      case 'ArrowLeft':
        left = Math.max(minLeft, left - moveAmount);
        overlay.style.left = `${left}px`;
        e.preventDefault();
        break;
      case 'ArrowRight':
        left = Math.min(maxLeft, left + moveAmount);
        overlay.style.left = `${left}px`;
        e.preventDefault();
        break;
    }
  }
  if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && e.key.toLowerCase() === 'q') {
    nextBtn.click();
    e.preventDefault();
  }
  if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && e.key.toLowerCase() === 'd') {
    prevBtn.click();
    e.preventDefault();
  }
  if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && e.key.toLowerCase() === 'm') {
    isTranslucent = !isTranslucent;
    const overlayBg = isTranslucent ? 'rgba(18, 20, 28, 0.75)' : 'rgba(18, 20, 28, 0.98)';
    const hintBg = isTranslucent ? 'rgba(24, 26, 35, 0.75)' : 'rgba(24, 26, 35, 0.98)';
    overlay.style.background = overlayBg;
    // Update all current hint windows
    document.querySelectorAll('.leetfriend-hint').forEach(hint => {
      hint.style.background = hintBg;
    });
    // Update custom scrollbar background if needed
    const styleId = 'leetfriend-hint-scrollbar-style';
    let scrollbarStyle = document.getElementById(styleId);
    if (!scrollbarStyle) {
      scrollbarStyle = document.createElement('style');
      scrollbarStyle.id = styleId;
      document.head.appendChild(scrollbarStyle);
    }
    scrollbarStyle.textContent = `
      .leetfriend-hint::-webkit-scrollbar-thumb {
        background: ${isTranslucent ? 'rgba(60, 70, 90, 0.45)' : 'rgba(60, 70, 90, 0.7)'};
      }
      .leetfriend-hint::-webkit-scrollbar-track {
        background: transparent;
      }
    `;
    e.preventDefault();
  }
});

function clearHints() {
  hintsContainer.innerHTML = '';
  overlay.style.width = '420px';
  overlay.style.minWidth = '320px';
  overlay.style.maxWidth = '520px';
}

// Set initial custom scrollbar background for translucency
const styleId = 'leetfriend-hint-scrollbar-style';
let scrollbarStyle = document.getElementById(styleId);
if (!scrollbarStyle) {
  scrollbarStyle = document.createElement('style');
  scrollbarStyle.id = styleId;
  document.head.appendChild(scrollbarStyle);
}
scrollbarStyle.textContent = `
  .leetfriend-hint::-webkit-scrollbar-thumb {
    background: rgba(60, 70, 90, 0.45);
  }
  .leetfriend-hint::-webkit-scrollbar-track {
    background: transparent;
  }
`;
console.log(chrome.runtime.getURL('icons/LeetuHi.png'))