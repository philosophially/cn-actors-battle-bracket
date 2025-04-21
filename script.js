// Create a BracketBattle class
class BracketBattle {
  constructor(options) {
    this.options = options;
    this.currentRound = this.shuffle([...options]);
    this.nextRound = [];
    this.index = 0;
    this.roundNumber = 1;
    this.battleDiv = document.getElementById("battle");
    this.winnerDiv = document.getElementById("winner");
    this.progressBar = document.getElementById("progressBar");
    this.playAgainBtn = document.getElementById("playAgainBtn");
    this.totalBattles = options.length - 1;
    this.completedBattles = 0;
    this.choiceHistory = [];

    // Add event listener for Play Again button
    this.playAgainBtn.onclick = () => this.resetGame();

    // Add keyboard navigation
    document.addEventListener("keydown", (e) => this.handleKeyPress(e));
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  updateProgress() {
    const progress = (this.completedBattles / this.totalBattles) * 100;
    this.progressBar.style.width = `${progress}%`;
    this.progressBar.setAttribute("aria-valuenow", progress);
    this.progressBar.setAttribute(
      "aria-label",
      `Progress: ${Math.round(progress)}%`
    );
  }

  handleKeyPress(e) {
    if (e.key === "ArrowLeft") {
      const leftChoice = document.querySelector(".choice:first-child");
      if (leftChoice) leftChoice.click();
    } else if (e.key === "ArrowRight") {
      const rightChoice = document.querySelector(".choice:last-child");
      if (rightChoice) rightChoice.click();
    }
  }

  createChoiceElement(option, isLeft) {
    const btn = document.createElement("div");
    btn.className = "choice";
    btn.setAttribute("role", "button");
    btn.setAttribute("tabindex", "0");
    btn.setAttribute("aria-label", `Choose ${option.name}`);

    const img = document.createElement("img");
    img.src = option.image;
    img.alt = option.name;
    img.className = "choice-image";
    img.loading = "lazy";

    const name = document.createElement("div");
    name.className = "choice-name";
    name.textContent = option.name;

    btn.appendChild(img);
    btn.appendChild(name);

    btn.onclick = () => {
      this.choiceHistory.push({
        round: this.roundNumber,
        choices: [
          this.currentRound[this.index],
          this.currentRound[this.index + 1],
        ],
        winner: option,
      });
      this.nextRound.push(option);
      this.index += 2;
      this.completedBattles++;
      this.updateProgress();
      this.showBattle();
    };

    return btn;
  }

  showBattle() {
    this.battleDiv.innerHTML = "";
    this.winnerDiv.textContent = "";

    if (this.index >= this.currentRound.length) {
      if (this.nextRound.length === 1) {
        this.showWinner(this.nextRound[0]);
        return;
      }
      // Move to next round
      this.currentRound = [...this.nextRound];
      this.nextRound = [];
      this.index = 0;
      this.roundNumber++;
    }

    const option1 = this.currentRound[this.index];
    const option2 = this.currentRound[this.index + 1];

    const roundInfo = document.createElement("div");
    roundInfo.className = "round-info";
    roundInfo.textContent = `Round ${this.roundNumber}`;
    this.battleDiv.appendChild(roundInfo);

    const btn1 = this.createChoiceElement(option1, true);
    const btn2 = this.createChoiceElement(option2, false);

    this.battleDiv.appendChild(btn1);
    this.battleDiv.appendChild(btn2);
  }

  showWinner(winner) {
    this.battleDiv.innerHTML = "";

    const winnerContainer = document.createElement("div");
    winnerContainer.className = "winner-container";
    winnerContainer.setAttribute("role", "alert");

    const winnerImg = document.createElement("img");
    winnerImg.src = winner.image;
    winnerImg.alt = winner.name;
    winnerImg.className = "winner-image";
    winnerImg.loading = "lazy";

    const winnerText = document.createElement("div");
    winnerText.className = "winner-text";
    winnerText.textContent = `Winner: ${winner.name}!`;

    winnerContainer.appendChild(winnerImg);
    winnerContainer.appendChild(winnerText);
    this.winnerDiv.appendChild(winnerContainer);

    this.progressBar.style.width = "100%";
    this.progressBar.setAttribute("aria-valuenow", 100);

    const shareBtn = document.getElementById("shareBtn");
    const shareMsg = document.getElementById("shareMsg");

    shareBtn.style.display = "inline-block";
    this.playAgainBtn.style.display = "inline-block";

    shareBtn.onclick = () => {
      const shareText = `I played the China Actors Bracket Battle and my winner was: ${winner.name}! What would yours be?`;
      navigator.clipboard.writeText(shareText).then(() => {
        shareMsg.textContent = "Result copied! Share it with your friends!";
        shareMsg.setAttribute("role", "status");
      });
    };
  }

  resetGame() {
    this.currentRound = this.shuffle([...this.options]);
    this.nextRound = [];
    this.index = 0;
    this.roundNumber = 1;
    this.completedBattles = 0;
    this.choiceHistory = [];
    this.progressBar.style.width = "0%";
    this.progressBar.setAttribute("aria-valuenow", 0);
    this.winnerDiv.textContent = "";
    this.playAgainBtn.style.display = "none";
    document.getElementById("shareBtn").style.display = "none";
    document.getElementById("shareMsg").textContent = "";
    this.showBattle();
  }
}

// Load actor data and initialize the game
fetch("actors.json")
  .then((response) => response.json())
  .then((data) => {
    const game = new BracketBattle(data.actors);
    game.showBattle();
  })
  .catch((error) => {
    console.error("Error loading actor data:", error);
    document.getElementById("battle").innerHTML =
      '<div class="error">Error loading the game. Please try again later.</div>';
  });
