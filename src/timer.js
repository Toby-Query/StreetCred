// countdown.js

export function startCountdown(seconds, displayElement) {
  let timeLeft = seconds;

  // Function to update the countdown display and color
  function updateDisplay() {
    if (timeLeft > seconds / 2) {
      displayElement.style.color = "green";
    } else if (timeLeft > 10) {
      displayElement.style.color = "orange";
    } else {
      displayElement.style.color = "red";
    }

    displayElement.textContent = timeLeft;

    // Decrement the time left and check if it's over
    if (timeLeft > 0) {
      timeLeft--;
      setTimeout(updateDisplay, 1000);
    } else {
      displayElement.textContent = "Go!";
      setTimeout(() => (displayElement.textContent = ""), 1000);
    }
  }

  updateDisplay(); // Start the countdown
}
