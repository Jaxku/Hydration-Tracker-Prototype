// Hydration Goal
const goal = 2000;  // hand off notes: this should be customizable in a finished product.
let currentWater = 0;

const waterAmount = document.getElementById('waterAmount');
const addWaterBtn = document.getElementById('addWaterBtn');
const progressText = document.getElementById('progress-text');
const waterFill = document.querySelector('.water-fill');
const waterValue = document.getElementById('waterValue');
let goalReached = false; // to prevent multiple pop-ups

// Update button text dynamically


waterAmount.addEventListener('input', () => {
  addWaterBtn.textContent = `Add ${waterAmount.value}ml`;
  waterValue.textContent = `${waterAmount.value} ml`; // update span text too
});

// Helper function to update all UI
function updateProgress() {
  // Update progress text
  progressText.textContent = `${currentWater} / ${goal} ml`;

  // Update water fill
  const fillPercentage = (currentWater / goal) * 100;
  waterFill.style.transition = 'height 1s ease-in-out'; 
  waterFill.style.height = `${fillPercentage}%`;

  // Update add button text to reflect slider value
  addWaterBtn.textContent = `Add ${waterAmount.value}ml`;
}

document.querySelectorAll('.quick-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const amount = parseInt(btn.getAttribute('data-amount'));
    currentWater += amount;
    if (currentWater > goal) currentWater = goal;

    // Update UI
    updateProgress();

    // Trigger confetti + modal if goal reached
    if (currentWater >= goal) {
      triggerCelebration();
    }
  });
});

// Add water and animate
addWaterBtn.addEventListener('click', () => {
  if (goalReached) return; // prevent adding after goal

  const amount = parseInt(waterAmount.value);
  currentWater = Math.min(currentWater + amount, goal);

  // Update progress text
  progressText.textContent = `${currentWater} / ${goal} ml`;

  // Animate water fill
  const fillPercentage = (currentWater / goal) * 100;
  waterFill.style.transition = 'height 1s ease-in-out'; // smooth transition
  waterFill.style.height = `${fillPercentage}%`;
});

// Listen for when the CSS transition ends
waterFill.addEventListener('transitionend', () => {
  if (currentWater >= goal && !goalReached) {
    goalReached = true; // make sure this only runs once

    // Pop-up message
    alert('🎉 Great job! You reached your hydration goal of ' + currentWater + ' ml!');

    // Confetti
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js";
    script.onload = () => {
      confetti({
        particleCount: 200,
        spread: 70,
        origin: { y: 0.6 }
      });
    };
    document.body.appendChild(script);
  }
});

