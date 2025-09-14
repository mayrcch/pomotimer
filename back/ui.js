export function setupProgressRing(progressCircle) {
    const radius = 140;
    const circumference = 2 * Math.PI * radius;
    progressCircle.style.strokeDasharray = circumference;
    progressCircle.style.strokeDashoffset = circumference;
    return circumference;
}

export function updateTimerDisplay(timerDisplay, timeLeft) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent =
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function updateProgress(progressCircle, totalTime, timeLeft, circumference) {
    const progress = (totalTime - timeLeft) / totalTime;
    const dashOffset = circumference * (1 - progress);
    progressCircle.style.strokeDashoffset = dashOffset;
}