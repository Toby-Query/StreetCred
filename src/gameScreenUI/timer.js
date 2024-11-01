// countdown.js

import { playAudio, preloadAudio } from "../setup/audioLoader";

export let matchStarted = false;

export function startMatch() {
  matchStarted = true;
}

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
      window.location.href = "../lose.html";
      setTimeout(() => (displayElement.textContent = ""), 1000);
    }
  }

  updateDisplay(); // Start the countdown
}

export async function preRaceCountdown(duration, onComplete) {
  const overlay = document.getElementById("countdown-overlay");
  overlay.style.display = "flex"; // Show the overlay

  let countdown = duration;
  overlay.innerText = countdown;

  // Disable controls during countdown
  //controls.enabled = false;

  // Preload all audio files
  await preloadAudio().then(() => {
    console.log("Audio loaded and ready to play.");
  });

  // Example: Play audio1
  const source = playAudio("engine");

  const interval = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      overlay.innerText = countdown;
    } else if (countdown === 0) {
      overlay.innerText = "GO!";
    } else {
      clearInterval(interval);
      overlay.style.display = "none"; // Hide the overlay
      //controls.enabled = true; // Enable controls

      // Trigger main timer and other actions
      startMatch(); // Set matchStarted to true here
      onComplete();
    }
  }, 1000);
}