// TODO
// class Tournament {}

/**
let bot_iterator = Object.entries(bot_mechanics);
let currentBots = [0, 0];
let repeat = 100;
for (let bot of bot_iterator) {
    bot[1].games = []
}
function doGame () {
    if (currentBots[0] === bot_iterator.length) {
        currentBots = [0, 0]; repeat--;
        if (repeat === 0) clearInterval(tournamentInterval);
        return;
    }
    if (!currentGame.result && currentBots[0] + currentBots[1] !== 0) return;
    ELEMENTS.getPlayerSelects()[0].selectedIndex = 0;
    ELEMENTS.getPlayerSelects()[0].dispatchEvent(new Event("change"));
    if (currentBots[0] + currentBots[1] !== 0) ELEMENTS.resetGameButton.click();
    ELEMENTS.getPlayerSelects()[0].selectedIndex = 4 + currentBots[0];
    ELEMENTS.getPlayerSelects()[1].selectedIndex = 4 + currentBots[1];
    ELEMENTS.getPlayerSelects()[1].dispatchEvent(new Event("change"));
    ELEMENTS.getPlayerSelects()[0].dispatchEvent(new Event("change"));
    bot_iterator[currentBots[0]][1].games.push(currentGame);
    bot_iterator[currentBots[1]][1].games.push(currentGame);
    currentBots[1]++;
    if (currentBots[1] === bot_iterator.length) {
        currentBots[1] = 0;
        currentBots[0]++;
        if (currentBots[0] === bot_iterator.length) return true;
    }
    return false;
}
Game.prototype.doBotMove = function () {
  if (players[this.toMove].player.type === "bot")
     // if (this.result and tournament mode
     if (this.result) console.info("Game ended");
     else players[this.toMove].player.play();
  else
     console.info("Player must've changed into a human");
}
let tournamentInterval = setInterval(doGame, 4000);


*/
