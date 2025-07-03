// Create floating overlay
const overlay = document.createElement('div');
overlay.id = 'leetfriend-overlay';
overlay.style.position = 'fixed';
overlay.style.top = '140px';
overlay.style.left = '100px';
overlay.style.width = '960px';
overlay.style.minWidth = '480px';
overlay.style.maxWidth = '95vw';
overlay.style.maxHeight = '90vh';
overlay.style.overflowY = 'auto';
overlay.style.background = 'rgba(0, 0, 0, 0.7)';
overlay.style.color = 'white';
overlay.style.borderRadius = '10px';
overlay.style.zIndex = '9999';
overlay.style.display = 'flex';
overlay.style.flexDirection = 'column';
overlay.style.justifyContent = 'center';
overlay.style.alignItems = 'center';
overlay.style.padding = '24px';
overlay.style.userSelect = 'none';
overlay.innerHTML = `<strong>💡 LeetFriend</strong><p>Use "Prev Hint" or "Next Hint" to navigate.</p><div style="font-size: 12px; margin-top: 8px; text-align: left; background: rgba(255,255,255,0.08); border-radius: 6px; padding: 6px 8px; width: 100%;"><strong>Shortcuts:</strong><br> <kbd>Ctrl+B</kbd> Show/Hide<br> <kbd>Ctrl+Shift</kbd> + <kbd>↑</kbd>/<kbd>↓</kbd>/<kbd>←</kbd>/<kbd>→</kbd> Move</div>`;
document.body.appendChild(overlay);

// Add styles for markdown hints
const style = document.createElement('style');
style.textContent = `
  .leetfriend-hint h1, .leetfriend-hint h2, .leetfriend-hint h3 {
    color: #c3ff99; margin: 8px 0 4px;
  }
  .leetfriend-hint pre {
    background: #222; color: #e0e0e0; border-radius: 6px; padding: 8px; overflow-x: auto; margin: 8px 0;
  }
  .leetfriend-hint code {
    font-family: monospace; font-size: 13px;
  }
  .leetfriend-hint p { margin: 6px 0; }
  .leetfriend-hint ul { margin: 6px 0; padding-left: 20px; }
  .leetfriend-hint li { margin-bottom: 4px; }
`;
document.head.appendChild(style);

// Make overlay draggable
let isDragging = false, offsetX = 0, offsetY = 0;
overlay.addEventListener('mousedown', (e) => { isDragging = true; offsetX = e.clientX - overlay.offsetLeft; offsetY = e.clientY - overlay.offsetTop; });
document.addEventListener('mousemove', (e) => { if (isDragging) { overlay.style.left = `${e.clientX - offsetX}px`; overlay.style.top = `${e.clientY - offsetY}px`; }});
document.addEventListener('mouseup', () => { isDragging = false; });

// Hints container
const hintsContainer = document.createElement('div');
hintsContainer.style.width = '100%';
hintsContainer.style.display = 'flex';
hintsContainer.style.flexDirection = 'column';
hintsContainer.style.gap = '12px';
hintsContainer.style.marginTop = '16px';
overlay.appendChild(hintsContainer);

// Buttons container
const btnContainer = document.createElement('div');
btnContainer.style.display = 'flex';
btnContainer.style.gap = '12px';
btnContainer.style.marginTop = '10px';
overlay.appendChild(btnContainer);

// Create Prev/Next buttons
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

btnContainer.appendChild(prevBtn);
btnContainer.appendChild(nextBtn);

// State
let currentStage = 1;
let currentIndex = -1;
let fetchedHints = [];

// Markdown renderer (fallback if window.marked unavailable)
function renderHintMarkdown(md) {
  if (window.marked && typeof window.marked.parse === 'function') return window.marked.parse(md);
  let html = md.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/^\s*-\s(.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  html = `<p>${html.replace(/\n{2,}/g, '</p><p>')}</p>`;
  return html;
}

// Show hint by index
function showHint(hintText, stageNumber) {
  hintsContainer.innerHTML = "";
  const hintContainer = document.createElement('div');
  hintContainer.classList.add('leetfriend-hint');
  hintContainer.style.background = 'rgba(44, 62, 80, 0.85)';
  hintContainer.style.border = '1px solid #e0e0e0';
  hintContainer.style.borderRadius = '6px';
  hintContainer.style.padding = '10px 12px';
  hintContainer.style.color = '#f5f5f5';
  hintContainer.style.fontSize = '14px';
  hintContainer.style.width = '100%';
  hintContainer.style.boxSizing = 'border-box';
  hintContainer.style.wordBreak = 'break-word';
  hintContainer.innerHTML = `<div style='font-weight:bold;margin-bottom:6px;color:#e0e0e0;'>Hint ${stageNumber}:</div>` + renderHintMarkdown(hintText);
  hintsContainer.appendChild(hintContainer);
  overlay.scrollTop = overlay.scrollHeight;
}

// Helpers
function showWarning(msg) { const warn = document.createElement('div'); warn.style.marginTop = '12px'; warn.style.background = 'rgba(255, 80, 80, 0.15)'; warn.style.border = '1px solid #ff8080'; warn.style.borderRadius = '6px'; warn.style.padding = '10px 12px'; warn.style.color = '#ffb3b3'; warn.style.fontSize = '14px'; warn.style.width = '100%'; warn.style.boxSizing = 'border-box'; warn.textContent = msg; hintsContainer.appendChild(warn); }
function getLeetcodeTitle() { return document.querySelector('.css-v3d350, .mr-2.text-label-1.dark\\:text-dark-label-1')?.innerText || document.querySelector('h4')?.innerText || ""; }
function getLeetcodeDescription() { return document.querySelector('.content__u3I1.question-content__JfgR, .elfjS, .whitespace-pre-line')?.innerText || document.querySelector('div[role="main"]')?.innerText || ""; }
function updateButtons() { prevBtn.disabled = currentIndex <= 0; nextBtn.disabled = currentIndex + 1 >= fetchedHints.length && currentStage > 4; applyDisabledStyle(prevBtn); applyDisabledStyle(nextBtn); }
function applyDisabledStyle(btn) { if (btn.disabled) { btn.style.background = '#bbb'; btn.style.color = '#fff'; btn.style.border = '2px solid #bbb'; btn.style.cursor = 'default'; } else { btn.style.background = 'transparent'; btn.style.color = '#2ecc40'; btn.style.border = '2px solid #2ecc40'; btn.style.cursor = 'default'; } }
function styleHintButton(btn) { btn.style.padding = '5px 10px'; btn.style.borderRadius = '5px'; btn.style.border = '2px solid #2ecc40'; btn.style.background = 'transparent'; btn.style.color = '#2ecc40'; btn.style.transition = 'background 0.2s, color 0.2s'; btn.style.cursor = 'default'; btn.addEventListener('mouseenter', () => { if (!btn.disabled) { btn.style.background = '#2ecc40'; btn.style.color = '#fff'; }}); btn.addEventListener('mouseleave', () => { if (!btn.disabled) { btn.style.background = 'transparent'; btn.style.color = '#2ecc40'; }}); }

// Next button click
nextBtn.onclick = async () => {
  if (currentIndex + 1 < fetchedHints.length) { currentIndex++; showHint(fetchedHints[currentIndex], currentIndex + 1); updateButtons(); return; }
  let title = getLeetcodeTitle(), desc = getLeetcodeDescription(), questionText = `${title}\n\n${desc}`.trim();
  if (!title && !desc) { showWarning("Could not find a LeetCode question on this page."); return; }
  try { const res = await fetch("http://127.0.0.1:8000/generate-hint", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: questionText, stage: currentStage }) }); if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`); const data = await res.json(); const hintText = data.hint?.trim() || "No hint received."; fetchedHints.push(hintText); currentIndex++; showHint(hintText, currentStage); currentStage++; updateButtons(); } catch (err) { console.error("Fetch failed:", err); showWarning(`Error: ${err.message || "Failed to contact backend."}`); }
};

// Prev button click
prevBtn.onclick = () => { if (currentIndex > 0) { currentIndex--; showHint(fetchedHints[currentIndex], currentIndex + 1); updateButtons(); } };

// Overlay shortcuts
let overlayVisible = true;
window.addEventListener('keydown', (e) => {
  // Show/hide overlay with Ctrl+B
  if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && e.key.toLowerCase() === 'b') {
    overlayVisible = !overlayVisible;
    overlay.style.display = overlayVisible ? 'flex' : 'none';
    e.preventDefault();
  }
  // Move overlay with Ctrl+Shift+Arrow keys
  if (e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey) {
    let left = parseInt(overlay.style.left, 10);
    let top = parseInt(overlay.style.top, 10);
    switch (e.key) {
      case 'ArrowUp': overlay.style.top = `${top - 15}px`; e.preventDefault(); break;
      case 'ArrowDown': overlay.style.top = `${top + 15}px`; e.preventDefault(); break;
      case 'ArrowLeft': overlay.style.left = `${left - 15}px`; e.preventDefault(); break;
      case 'ArrowRight': overlay.style.left = `${left + 15}px`; e.preventDefault(); break;
    }
  }
  // Next Hint: Ctrl+Q
  if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && e.key.toLowerCase() === 'q') {
    nextBtn.click();
    e.preventDefault();
  }
  // Prev Hint: Ctrl+D
  if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && e.key.toLowerCase() === 'd') {
    prevBtn.click();
    e.preventDefault();
  }
});
