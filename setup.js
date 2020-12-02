(() => {

   let promise = fetch('https://raw.githubusercontent.com/icecream17/icecream17.github.io/master/Stuff/Tic%20Tac%20Toe%20Grow/game.html')
   promise.then(success, uhoh)

   function success(response) {
      console.log(response);
      if (!response.ok) {
         throw Error("Response !== 200 OK, got: " + reponse.status)
      }
      let text = reponse.text()
      return setDocumentTo(text)
   }

   function uhoh(rejectionReason) {
      throw rejectionReason
   }

   function setDocumentTo(text) {
      text = text.split('\n').slice(1).join('\n');
      document.documentElement.innerHTML = text;
   }

})()

/*

<!doctype html>
↵<html lang="en-us">
↵
↵<head>
↵   <meta charset="UTF-8">
↵   <title>Tic Tac Toe Grow</title>
↵   <script defer src="game.js"></script>
↵   <link rel="stylesheet" href="style.css">
↵</head>
↵
↵<body>
↵   <div id="container">
↵      <aside>
↵         <h1>Tic tac toe grow!</h1>
↵         <!-- Make this section a flexbox or grid -->
↵         <section id="gameControls">
↵            <fieldset id="mapControls">
↵               <legend>Map controls</legend>
↵               <button type="button" class="mapControl">up</button>
↵               <button type="button" class="mapControl">down</button>
↵               <button type="button" class="mapControl">left</button>
↵               <button type="button" class="mapControl">right</button>
↵            </fieldset>
↵            <!-- Game CONTROLS here -->
↵         </section>
↵         <section id="gameData">
↵            <h2>Game data</h2>
↵            <!-- Add width and height and turns and more here -->
↵            <fieldset id="countFields">
↵               <label id="playerAmountLabel">
↵                  <var>Number of players: </var>
↵                  <select autocomplete="off">
↵                     <option selected>2</option>
↵                     <option>3</option>
↵                     <option>4</option>
↵                  </select>
↵               </label>
↵               <br>
↵               <label id="personCountLabel">
↵                  <var>Number of people playing: </var>
↵                  <select autocomplete="off">
↵                     <option>0</option>
↵                     <option selected>1</option>
↵                     <option>2</option>
↵                     <option>3</option>
↵                     <option>4</option>
↵                  </select>
↵               </label>
↵            </fieldset>
↵            <!-- When disabled.onclick, enablePlayer. 
↵               [+] Button is redundant but nice. -->
↵            <fieldset id="nameFields">
↵               <fieldset id="nameField1">
↵                  <label id="usernameLabel1">
↵                     <var>Username #1: </var>
↵                     <input type="text" placeholder="Person 1">
↵                  </label>
↵                  <button type="button" id="enableName1" class="enable" disabled>+ enable</button>
↵                  <button type="button" id="disableName1" class="disable">× remove</button>
↵               </fieldset>
↵               <fieldset id="nameField2">
↵                  <label id="usernameLabel2">
↵                     <var>Username #2: </var>
↵                     <input disabled type="text" placeholder="Person 2">
↵                  </label>
↵                  <button type="button" id="enableName2" class="enable">+ enable</button>
↵                  <button type="button" id="disableName2" class="disable" disabled>× remove</button>
↵               </fieldset>
↵               <fieldset id="nameField3">
↵                  <label id="usernameLabel3">
↵                     <var>Username #3: </var>
↵                     <input disabled type="text" placeholder="Person 3">
↵                  </label>
↵                  <button type="button" id="enableName3" class="enable">+ enable</button>
↵                  <button type="button" id="disableName3" class="disable" disabled>× remove</button>
↵               </fieldset>
↵               <fieldset id="nameField4">
↵                  <label id="usernameLabel4">
↵                     <var>Username #4: </var>
↵                     <input disabled type="text" placeholder="Person 4">
↵                  </label>
↵                  <button type="button" id="enableName4" class="enable">+ enable</button>
↵                  <button type="button" id="disableName4" class="disable" disabled>× remove</button>
↵               </fieldset>
↵            </fieldset>
↵            <fieldset id="choosePlayerFields">
↵               <fieldset id="playerField1">
↵                  <label id="whoPlays1">
↵                     <var>Player #1: </var>
↵                     <select aria-labelledby="whoPlays1" autocomplete="off">
↵                        <optgroup label="Humans">
↵                           <option selected>Person 1</option>
↵                           <option disabled>Person 2</option>
↵                           <option disabled>Person 3</option>
↵                           <option disabled>Person 4</option>
↵                        </optgroup>
↵                        <optgroup label="Bots">
↵                           <option>random_move</option>
↵                           <option>middle_index</option>
↵                           <option>copy</option>
↵                        </optgroup>
↵                     </select>
↵                  </label>
↵                  <button type="button" id="enablePlayer1" class="enable" disabled>+ enable</button>
↵                  <button type="button" id="disablePlayer1" class="disable">× remove</button>
↵               </fieldset>
↵               <fieldset id="playerField2">
↵                  <label id="whoPlays2">
↵                     <var>Player #2: </var>
↵                     <select aria-labelledby="whoPlays2" autocomplete="off">
↵                        <optgroup label="Humans">
↵                           <option>Person 1</option>
↵                           <option disabled>Person 2</option>
↵                           <option disabled>Person 3</option>
↵                           <option disabled>Person 4</option>
↵                        </optgroup>
↵                        <optgroup label="Bots">
↵                           <option selected>random_move</option>
↵                           <option>middle_index</option>
↵                           <option>copy</option>
↵                        </optgroup>
↵                     </select>
↵                  </label>
↵                  <button type="button" id="enablePlayer2" class="enable" disabled>+ enable</button>
↵                  <button type="button" id="disablePlayer2" class="disable">× remove</button>
↵               </fieldset>
↵               <fieldset id="playerField3">
↵                  <label id="whoPlays3">
↵                     <var>Player #3: </var>
↵                     <select aria-labelledby="whoPlays3" autocomplete="off" disabled>
↵                        <optgroup label="Humans">
↵                           <option>Person 1</option>
↵                           <option disabled>Person 2</option>
↵                           <option disabled>Person 3</option>
↵                           <option disabled>Person 4</option>
↵                        </optgroup>
↵                        <optgroup label="Bots">
↵                           <option>random_move</option>
↵                           <option selected>middle_index</option>
↵                           <option>copy</option>
↵                        </optgroup>
↵                     </select>
↵                  </label>
↵                  <button type="button" id="enablePlayer3" class="enable">+ enable</button>
↵                  <button type="button" id="disablePlayer3" class="disable" disabled>× remove</button>
↵               </fieldset>
↵               <fieldset id="playerField4">
↵                  <label id="whoPlays4">
↵                     <var>Player #4: </var>
↵                     <select aria-labelledby="whoPlays4" autocomplete="off" disabled>
↵                        <optgroup label="Humans">
↵                           <option>Person 1</option>
↵                           <option disabled>Person 2</option>
↵                           <option disabled>Person 3</option>
↵                           <option disabled>Person 4</option>
↵                        </optgroup>
↵                        <optgroup label="Bots">
↵                           <option>random_move</option>
↵                           <option>middle_index</option>
↵                           <option selected>copy</option>
↵                        </optgroup>
↵                     </select>
↵                  </label>
↵                  <button type="button" id="enablePlayer4" class="enable">+ enable</button>
↵                  <button type="button" id="disablePlayer4" class="disable" disabled>× remove</button>
↵               </fieldset>
↵            </fieldset>
↵         </section>
↵      </aside>
↵   </div>
↵   <aside>
↵      <h1>About</h1>
↵      <h2>How to play</h2>
↵      <p>To play, simply click on an empty square (a button)</p>
↵      <p>Every square where a move is played,<br>
↵         all squares 1 step vertically or horizontally away<br>
↵         become part of the board (if they aren't already).</p>
↵      <details>
↵         <summary>Examples:</summary>
↵         <p>I recommend just trying these out above.</p>
↵         <p class="monospace">
↵            <br>&nbsp;X__<br>&nbsp;___<br>&nbsp;___<br>
↵            <br>&nbsp;_<br>_X__<br>&nbsp;___<br>&nbsp;___<br>
↵            <br>
↵            <br>&nbsp;_<br>_XO_<br>&nbsp;___<br>&nbsp;___<br>
↵            <br>&nbsp;__<br>_XO_<br>&nbsp;___<br>&nbsp;___<br>
↵            <br>
↵            <br>&nbsp;_<br>_XO_<br>&nbsp;X__<br>&nbsp;___<br>
↵            <br>&nbsp;__<br>_XO_<br>_X__<br>&nbsp;___<br>
↵         </p>
↵      </details>
↵      <p>Hence the name, tic tac toe grow.</p>
↵      <p>If the board grows too big, you can use the mapControl buttons on the right</p>
↵      <p>For example, the "up" button moves the whole board up.</p>
↵      <p>This can actually be quite unintuitive,<br>
↵         since when you click on "up", you move the board up,<br>
↵         but you (e.g. your mouse) moves down in comparison.<br>
↵         It's kinda like scrolling.</p>
↵      <p>You win if you get 7 in a row, or a checkmark.</p>
↵      <p>A checkmark is defined as a region of squares that:</p>
↵      <ul>
↵         <li>are all <em>diagonally</em> adjacent to each other</li>
↵         <li>form a right angle, where
↵            <ol>
↵               <li>both sides share a square
↵               <li>one side is 2 squares long</li>
↵               <li>the other side is 4 squares long</li>
↵            </ol>
↵         </li>
↵      </ul>
↵      <details>
↵         <summary>Example checkmarks:</summary>
↵         <p class="monospace">____X<br>___X_<br>X_X__<br>_X___</p>
↵         <p class="monospace">_X__<br>X____<br>_X__<br>__X_<br>___X</p>
↵         <p class="monospace">
↵            X_______<br>_X______<br>__X_____<br>___X___X<br>____X_X_<br>_____X__
↵         </p>
↵         <p>
↵            The last one has sides that have more than 2 or 4 squares long, <br>
↵            but that just makes it more awesome, <br>
↵            and the rest of the "checkmark" will turn green anyways.
↵         </p>
↵      </details>
↵      <h3>Another note</h3>
↵      <p>
↵         If the length is (7 times the width), or vice versa,
↵         it's a draw.
↵      </p>
↵      <details>
↵         <summary>Technicallly</summary>
↵         <p>What? No way, the length was 6 times the width,<br>
↵            but then skipped to 8 times?</p>
↵         <p>You shouldn't be able to do that.<br>
↵            If you do, it's a bug so tell me</p>
↵         <p>Still a draw though.</p>
↵      </details>
↵      <h2>More details</h2>
↵      <p>The game will tell you if it's a win or a draw,<br>
↵         so you don't have to worry about that</p>
↵      <p>You can see the width and height in the game info,<br>
↵         where, eventually (not done yet), you can also...</p>
↵      <ul>
↵         <li>See the height of the board</li>
↵         <li>See the width of the board</li>
↵         <li>Add to the total number of people</li>
↵         <li>Also delete some people</li>
↵         <li>And also name the people</li>
↵         <li>My code doesn't really care about the names</li>
↵         <li>And you can also change whose turn it is</li>
↵         <li>Wow! Just have a bot play</li>
↵         <li>Or even multiple bots</li>
↵         <li>Or even the same bot, but multiple times</li>
↵         <li>Or even the same person multiple times</li>
↵         <li>Or a different person multiple times</li>
↵         <li>And you can add a player (different from "person")</li>
↵         <li>Or delete players</li>
↵         <li>You can even have humans and bots at the same time</li>
↵         <li>You can admire the amount of bots there are</li>
↵         <li>AND MORE</li>
↵         <li>Free limit: Only 4 players max</li>
↵         <li>Free limit: Only 2 players... min</li>
↵         <li>You can breathe easily. It's really easy to breathe.</li>
↵         <li>Did I mention: Names can be the same?</li>
↵         <li>Imagine... holding the down arrow key on a dropdown =O</li>
↵         <li>You can click the words "Player 1" instead of the box!</li>
↵         <li>You can change the number of players directly</li>
↵         <li>Or just one by one I guess</li>
↵         <li>And same thing for the number of humans!</li>
↵         <li>That's right, changing the number of humans directly</li>
↵         <li>Or just one by one</li>
↵         <li>There's so much you could theoretically do</li>
↵         <li>Imagine... the possibilities XDDDD</li>
↵         <li>BWAHAHAHAHA sorry I really had fun making this</li>
↵      </ul>
↵      <p>By default, it's 1 player against a bot named "random_move"</p>
↵   </aside>
↵</body>
↵
↵</html>
↵
*/
