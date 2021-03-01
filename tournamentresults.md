# Tournament results

## Code

1. Convert results to an array
   ```javascript
   let results = Array.from(tournament1.games.results).map(a => [a[0], Array.from(a[1])])
   ```
2. Map each bot to bot.name
   ```javascript
   results = results.map(a => [a[0].name, a[1].map(b => [b[0].name, b[1]])])
   ```
3. Take old JSON from here, add it to the totals
   ```javascript
   let oldJSONArray = JSON.parse(/* old JSON from this file */)
   let newJSONArray = oldJSONArray.map(
      (a, index) => [
         a[0],
         a[1].map(
            (b, index2) => [
               b[0], {
                  wins: b[1].wins + results[index][1][index2][1].wins,
                  draws: b[1].draws + results[index][1][index2][1].draws,
                  losses: b[1].losses + results[index][1][index2][1].losses
               }
            ]
         )
      ]
   )
   let newJSON = JSON.stringify(newJSONArray, null, 3)
   ```
4. Gets the points of each bot
   ```javascript
   newJSONArray.reduce(
      (accum, curr) => (
         (accum[curr[0]] = curr[1].reduce(
            (accum2, curr2) => accum2 + curr2[1].wins + (curr2[1].draws / 2),
            0
         )
      ), accum),
      {}
   )
   ```
5. Convert newJSONArray again
   ```javascript
   let anotherJSON = Object.fromEntries(
      newJSONArray.map(
         a => [a[0], Object.fromEntries(a[1])]
      )
   )
   JSON.stringify(anotherJSON, null, 3)
   ```
6. And the table
   ```javascript
   // 10 draws is the same as 5 wins and 5 losses
   // Later that won't be the case
   let table = Object.fromEntries(
      newJSONArray.map(
         a => [
            a[0],
            Object.fromEntries(
               a[1].map(
                  b => [b[0], `${b[1].wins}/${b[1].draws}/${b[1].losses}`]
               )
            )
         ]
      )
   )
   table = Object.values(table).map(value => Object.values(value))
   let tableJSON = JSON.stringify(table)
   ```
7. Convert the tableJSON into CSV, then convert CSV to markdown tables <https://www.tablesgenerator.com/markdown_tables>


## Data

Total rounds: 5  
(Meaning each player plays against each other 5x2 times)

### Table

| Strategy      | random_move | middle_index |  copy | avoider | closer | firstDiagonal |
|---------------|:-----------:|:------------:|:-----:|:-------:|:------:|:-------------:|
| random_move   |    5/0/5    |     1/0/9    | 7/0/3 |  4/0/6  |  2/0/8 |     3/0/7     |
| middle_index  |    9/0/1    |    0/10/0    | 4/0/6 |  7/1/2  | 10/0/0 |     10/0/0    |
| copy          |    3/0/7    |     6/0/4    | 4/2/4 |  3/0/7  |  2/0/8 |     1/0/9     |
| avoider       |    6/0/4    |     2/1/7    | 7/0/3 |  3/4/3  |  1/0/9 |     3/0/7     |
| closer        |    8/0/2    |    0/0/10    | 8/0/2 |  9/0/1  |  5/0/5 |     0/0/10    |
| firstDiagonal |    7/0/3    |    0/0/10    | 9/0/1 |  7/0/3  | 10/0/0 |     5/0/5     |

### Ranking

| Strategy                | Pts  |
|-------------------------|------|
| __```middle_index```__  | 45.5 |
| __```firstDiagonal```__ |  38  |
| __```closer```__        |  30  |
| __```avoider```__       | 24.5 |
| __```random_move```__   |  22  |
| __```copy```__          |  20  |

### Raw JSON

```json
[
   [
      "random_move",
      [
         [
            "random_move",
            {
               "wins": 5,
               "draws": 0,
               "losses": 5
            }
         ],
         [
            "middle_index",
            {
               "wins": 1,
               "draws": 0,
               "losses": 9
            }
         ],
         [
            "copy",
            {
               "wins": 7,
               "draws": 0,
               "losses": 3
            }
         ],
         [
            "avoider",
            {
               "wins": 4,
               "draws": 0,
               "losses": 6
            }
         ],
         [
            "closer",
            {
               "wins": 2,
               "draws": 0,
               "losses": 8
            }
         ],
         [
            "firstDiagonal",
            {
               "wins": 3,
               "draws": 0,
               "losses": 7
            }
         ]
      ]
   ],
   [
      "middle_index",
      [
         [
            "random_move",
            {
               "wins": 9,
               "draws": 0,
               "losses": 1
            }
         ],
         [
            "middle_index",
            {
               "wins": 0,
               "draws": 10,
               "losses": 0
            }
         ],
         [
            "copy",
            {
               "wins": 4,
               "draws": 0,
               "losses": 6
            }
         ],
         [
            "avoider",
            {
               "wins": 7,
               "draws": 1,
               "losses": 2
            }
         ],
         [
            "closer",
            {
               "wins": 10,
               "draws": 0,
               "losses": 0
            }
         ],
         [
            "firstDiagonal",
            {
               "wins": 10,
               "draws": 0,
               "losses": 0
            }
         ]
      ]
   ],
   [
      "copy",
      [
         [
            "random_move",
            {
               "wins": 3,
               "draws": 0,
               "losses": 7
            }
         ],
         [
            "middle_index",
            {
               "wins": 6,
               "draws": 0,
               "losses": 4
            }
         ],
         [
            "copy",
            {
               "wins": 4,
               "draws": 2,
               "losses": 4
            }
         ],
         [
            "avoider",
            {
               "wins": 3,
               "draws": 0,
               "losses": 7
            }
         ],
         [
            "closer",
            {
               "wins": 2,
               "draws": 0,
               "losses": 8
            }
         ],
         [
            "firstDiagonal",
            {
               "wins": 1,
               "draws": 0,
               "losses": 9
            }
         ]
      ]
   ],
   [
      "avoider",
      [
         [
            "random_move",
            {
               "wins": 6,
               "draws": 0,
               "losses": 4
            }
         ],
         [
            "middle_index",
            {
               "wins": 2,
               "draws": 1,
               "losses": 7
            }
         ],
         [
            "copy",
            {
               "wins": 7,
               "draws": 0,
               "losses": 3
            }
         ],
         [
            "avoider",
            {
               "wins": 3,
               "draws": 4,
               "losses": 3
            }
         ],
         [
            "closer",
            {
               "wins": 1,
               "draws": 0,
               "losses": 9
            }
         ],
         [
            "firstDiagonal",
            {
               "wins": 3,
               "draws": 0,
               "losses": 7
            }
         ]
      ]
   ],
   [
      "closer",
      [
         [
            "random_move",
            {
               "wins": 8,
               "draws": 0,
               "losses": 2
            }
         ],
         [
            "middle_index",
            {
               "wins": 0,
               "draws": 0,
               "losses": 10
            }
         ],
         [
            "copy",
            {
               "wins": 8,
               "draws": 0,
               "losses": 2
            }
         ],
         [
            "avoider",
            {
               "wins": 9,
               "draws": 0,
               "losses": 1
            }
         ],
         [
            "closer",
            {
               "wins": 5,
               "draws": 0,
               "losses": 5
            }
         ],
         [
            "firstDiagonal",
            {
               "wins": 0,
               "draws": 0,
               "losses": 10
            }
         ]
      ]
   ],
   [
      "firstDiagonal",
      [
         [
            "random_move",
            {
               "wins": 7,
               "draws": 0,
               "losses": 3
            }
         ],
         [
            "middle_index",
            {
               "wins": 0,
               "draws": 0,
               "losses": 10
            }
         ],
         [
            "copy",
            {
               "wins": 9,
               "draws": 0,
               "losses": 1
            }
         ],
         [
            "avoider",
            {
               "wins": 7,
               "draws": 0,
               "losses": 3
            }
         ],
         [
            "closer",
            {
               "wins": 10,
               "draws": 0,
               "losses": 0
            }
         ],
         [
            "firstDiagonal",
            {
               "wins": 5,
               "draws": 0,
               "losses": 5
            }
         ]
      ]
   ]
]
```

#### Simpler Raw JSON

```json
{
   "random_move": {
      "random_move": {
         "wins": 5,
         "draws": 0,
         "losses": 5
      },
      "middle_index": {
         "wins": 1,
         "draws": 0,
         "losses": 9
      },
      "copy": {
         "wins": 7,
         "draws": 0,
         "losses": 3
      },
      "avoider": {
         "wins": 4,
         "draws": 0,
         "losses": 6
      },
      "closer": {
         "wins": 2,
         "draws": 0,
         "losses": 8
      },
      "firstDiagonal": {
         "wins": 3,
         "draws": 0,
         "losses": 7
      }
   },
   "middle_index": {
      "random_move": {
         "wins": 9,
         "draws": 0,
         "losses": 1
      },
      "middle_index": {
         "wins": 0,
         "draws": 10,
         "losses": 0
      },
      "copy": {
         "wins": 4,
         "draws": 0,
         "losses": 6
      },
      "avoider": {
         "wins": 7,
         "draws": 1,
         "losses": 2
      },
      "closer": {
         "wins": 10,
         "draws": 0,
         "losses": 0
      },
      "firstDiagonal": {
         "wins": 10,
         "draws": 0,
         "losses": 0
      }
   },
   "copy": {
      "random_move": {
         "wins": 3,
         "draws": 0,
         "losses": 7
      },
      "middle_index": {
         "wins": 6,
         "draws": 0,
         "losses": 4
      },
      "copy": {
         "wins": 4,
         "draws": 2,
         "losses": 4
      },
      "avoider": {
         "wins": 3,
         "draws": 0,
         "losses": 7
      },
      "closer": {
         "wins": 2,
         "draws": 0,
         "losses": 8
      },
      "firstDiagonal": {
         "wins": 1,
         "draws": 0,
         "losses": 9
      }
   },
   "avoider": {
      "random_move": {
         "wins": 6,
         "draws": 0,
         "losses": 4
      },
      "middle_index": {
         "wins": 2,
         "draws": 1,
         "losses": 7
      },
      "copy": {
         "wins": 7,
         "draws": 0,
         "losses": 3
      },
      "avoider": {
         "wins": 3,
         "draws": 4,
         "losses": 3
      },
      "closer": {
         "wins": 1,
         "draws": 0,
         "losses": 9
      },
      "firstDiagonal": {
         "wins": 3,
         "draws": 0,
         "losses": 7
      }
   },
   "closer": {
      "random_move": {
         "wins": 8,
         "draws": 0,
         "losses": 2
      },
      "middle_index": {
         "wins": 0,
         "draws": 0,
         "losses": 10
      },
      "copy": {
         "wins": 8,
         "draws": 0,
         "losses": 2
      },
      "avoider": {
         "wins": 9,
         "draws": 0,
         "losses": 1
      },
      "closer": {
         "wins": 5,
         "draws": 0,
         "losses": 5
      },
      "firstDiagonal": {
         "wins": 0,
         "draws": 0,
         "losses": 10
      }
   },
   "firstDiagonal": {
      "random_move": {
         "wins": 7,
         "draws": 0,
         "losses": 3
      },
      "middle_index": {
         "wins": 0,
         "draws": 0,
         "losses": 10
      },
      "copy": {
         "wins": 9,
         "draws": 0,
         "losses": 1
      },
      "avoider": {
         "wins": 7,
         "draws": 0,
         "losses": 3
      },
      "closer": {
         "wins": 10,
         "draws": 0,
         "losses": 0
      },
      "firstDiagonal": {
         "wins": 5,
         "draws": 0,
         "losses": 5
      }
   }
}
```
