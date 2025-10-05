// Hydration tracker - robust sync version
document.addEventListener('DOMContentLoaded', () => {
  console.log('[hydration] DOM ready');

  // Config
  const goal = 2000;
  let currentWater = 0;
  let goalReached = false;

  // Elements (must match IDs in your HTML)
  const waterAmount = document.getElementById('waterAmount');       // slider input
  const addWaterBtn = document.getElementById('addWaterBtn');       // Add button
  const progressText = document.getElementById('progress-text');    // progress label
  const waterFill = document.querySelector('.water-fill');          // visual fill element
  const waterValue = document.getElementById('waterValue');         // span that shows selected ml
  const customAmountInput = document.getElementById('customAmount');// the typed input box

  // Quick validation so we can fail fast and show console hints
  if (!waterAmount) console.error('[hydration] Missing element: #waterAmount (slider)');
  if (!addWaterBtn) console.error('[hydration] Missing element: #addWaterBtn (button)');
  if (!customAmountInput) console.error('[hydration] Missing element: #customAmount (input box)');
  if (!progressText) console.warn('[hydration] Missing element: #progress-text (optional)');
  if (!waterFill) console.warn('[hydration] Missing element: .water-fill (optional)');
  if (!waterValue) console.warn('[hydration] Missing element: #waterValue (optional)');

  // Safe parse
  function toInt(v, fallback = 0) {
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? fallback : n;
  }

  // Update the Add button text to match the given value (or slider value if not passed)
  function updateAddButtonText(val) {
    const n = typeof val !== 'undefined' ? toInt(val, 0) : toInt(waterAmount.value, 0);
    addWaterBtn.textContent = `Add ${n}ml`;
  }

  // Update the progress text and water fill visual
  function updateProgressUI() {
    if (progressText) progressText.textContent = `${currentWater} / ${goal} ml`;
    if (waterFill) {
      const pct = Math.max(0, Math.min(100, (currentWater / goal) * 100));
      waterFill.style.transition = 'height 1s ease-in-out';
      waterFill.style.height = `${pct}%`;
    }
    // Make sure the Add button matches slider
    updateAddButtonText();
  }

  // Initialize UI from slider value on load
  (function init() {
    const initVal = toInt(waterAmount ? waterAmount.value : 0, 250);
    if (waterAmount) waterAmount.value = initVal;
    if (customAmountInput) customAmountInput.value = initVal;
    if (waterValue) waterValue.textContent = `${initVal} ml`;
    updateAddButtonText(initVal);
    updateProgressUI();
    console.log('[hydration] initialized with', initVal);
  })();

  // --- Event listeners ---

  // Slider moves -> update input + button + visible span
  if (waterAmount) {
    waterAmount.addEventListener('input', (e) => {
      const val = toInt(e.target.value, 0);
      if (customAmountInput) customAmountInput.value = val;
      if (waterValue) waterValue.textContent = `${val} ml`;
      updateAddButtonText(val);
      console.debug('[hydration] slider ->', val);
    });
  }

  // Typing in the custom input -> update slider + button + visible span
  if (customAmountInput) {
    customAmountInput.addEventListener('input', (e) => {
      // allow typing — but clamp for final value
      let raw = e.target.value;
      // If empty, don't freak out — show 0 in preview but wait until valid for slider update
      if (raw === '') {
        if (waterValue) waterValue.textContent = `0 ml`;
        updateAddButtonText(0);
        return;
      }
      let val = toInt(raw, 0);
      // clamp to sane bounds
      val = Math.max(1, Math.min(val, 2000));
      // push to slider and UI
      if (waterAmount) waterAmount.value = val;
      if (waterValue) waterValue.textContent = `${val} ml`;
      updateAddButtonText(val);
      console.debug('[hydration] custom input ->', val);
    });
  }

  // Quick buttons (data-amount) -> add and update UI (transitionend will handle celebration)
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = toInt(btn.getAttribute('data-amount'), 0);
      currentWater = Math.min(currentWater + amount, goal);
      updateProgressUI();
      console.debug('[hydration] quick-btn clicked amount=', amount, 'current=', currentWater);
      // Do not directly trigger celebration here — wait for transitionend to ensure animation finishes
    });
  });

  // Add button -> add using slider value and update UI
  if (addWaterBtn) {
    addWaterBtn.addEventListener('click', () => {
      if (goalReached) {
        console.debug('[hydration] goal already reached; add ignored');
        return;
      }
      const amount = toInt(waterAmount ? waterAmount.value : customAmountInput.value, 0);
      currentWater = Math.min(currentWater + amount, goal);
      updateProgressUI();
      console.debug('[hydration] add button clicked amount=', amount, 'current=', currentWater);
      // celebration/alert handled in transitionend below
    });
  }

  // When the fill transition ends, if we've reached the goal show celebration (only once)
  if (waterFill) {
    waterFill.addEventListener('transitionend', () => {
      if (currentWater >= goal && !goalReached) {
        goalReached = true;
        // pop-up message
        try {
          alert('🎉 Great job! You reached your hydration goal of ' + currentWater + ' ml!');
        } catch (e) { console.warn('[hydration] alert failed', e); }

        // confetti script load
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js";
        script.onload = () => {
          try {
            confetti({
              particleCount: 200,
              spread: 70,
              origin: { y: 0.6 }
            });
          } catch (err) {
            console.warn('[hydration] confetti failed', err);
          }
        };
        document.body.appendChild(script);
      }
    });
  }

  // Helpful debug to tell you which elements are present
  console.log('[hydration] elements:', {
    slider: !!waterAmount,
    customInput: !!customAmountInput,
    addButton: !!addWaterBtn,
    progressText: !!progressText,
    waterFill: !!waterFill,
    waterValue: !!waterValue
  });
});