// raceLogic.js

export let raceStarted = false;

function startCountdown(callback) {
  const countdownDisplay = document.createElement("div");
  countdownDisplay.style.position = "absolute";
  countdownDisplay.style.top = "50%";
  countdownDisplay.style.left = "50%";
  countdownDisplay.style.transform = "translate(-50%, -50%)";
  countdownDisplay.style.fontSize = "48px";
  countdownDisplay.style.color = "white";
  document.body.appendChild(countdownDisplay);

  let count = 3;
  const countdownInterval = setInterval(() => {
    countdownDisplay.innerText = count;
    count--;
    if (count < 0) {
      clearInterval(countdownInterval);
      countdownDisplay.innerText = "Go!";
      raceStarted = true;
      setTimeout(() => {
        document.body.removeChild(countdownDisplay);
        if (callback) callback(); // Start the race
      }, 1000);
    }
  }, 1000);
}

function endRace(winner) {
  const quote = winner
    ? ""
    : '"Last time I raced someone that slow, I was still learning to crawl."'; // Add actual quotes based on your logic
  const opponentImage = "/images/blacklist/thups.png"; // Set the path to your opponent image

  // Redirect to the results page with parameters
  window.location.href = `result.html?winner=${winner}&quote=${encodeURIComponent(
    quote
  )}&image=${encodeURIComponent(opponentImage)}`;
}

// Export the functions to make them available in other modules
export { startCountdown, endRace };
