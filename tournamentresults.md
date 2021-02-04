# Tournament results

## Tournament1

Win-Draw-Loss Table

|                         | ```middle_index``` | ```firstDiagonal``` | ```closer``` | ```random_move``` | ```avoider``` | ```copy```  |
|-------------------------|--------------------|---------------------|--------------|-------------------|---------------|-------------|
| __```middle_index```__  |     ```0-6-0```    |     ```6-0-0```     |  ```6-0-0``` |    ```5-0-1```    |  ```4-1-1```  | ```3-0-3``` |
| __```firstDiagonal```__ |     ```0-0-6```    |     ```3-0-3```     |  ```6-0-0``` |    ```3-0-3```    |  ```5-0-1```  | ```5-0-1``` |
| __```closer```__        |     ```0-0-6```    |     ```0-0-6```     |  ```3-0-3``` |    ```4-0-2```    |  ```6-0-0```  | ```6-0-0``` |
| __```random_move```__   |     ```1-0-5```    |     ```3-0-3```     |  ```2-0-4``` |    ```3-0-3```    |  ```3-0-3```  | ```3-0-3``` |
| __```avoider```__       |     ```1-1-4```    |     ```1-0-5```     |  ```0-0-6``` |    ```3-0-3```    |  ```1-4-1```  | ```6-0-0``` |
| __```copy```__          |     ```3-0-3```    |     ```1-0-5```     |  ```0-0-6``` |    ```3-0-3```    |  ```0-0-6```  | ```3-0-3``` |

Ranking

| Strategy                | Pts |
|-------------------------|-----|
| __```middle_index```__  |  27 |
| __```firstDiagonal```__ |  22 |
| __```closer```__        |  19 |
| __```random_move```__   |  15 |
| __```avoider```__       |  12 |
| __```copy```__          |  10 |

Raw JSON:

```json
[
   [
      "random_move",
      [
         [
            "random_move",
            {
               "wins": 3,
               "draws": 0,
               "losses": 3
            }
         ],
         [
            "middle_index",
            {
               "wins": 1,
               "draws": 0,
               "losses": 5
            }
         ],
         [
            "copy",
            {
               "wins": 3,
               "draws": 0,
               "losses": 3
            }
         ],
         [
            "avoider",
            {
               "wins": 3,
               "draws": 0,
               "losses": 3
            }
         ],
         [
            "closer",
            {
               "wins": 2,
               "draws": 0,
               "losses": 4
            }
         ],
         [
            "firstDiagonal",
            {
               "wins": 3,
               "draws": 0,
               "losses": 3
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
               "wins": 5,
               "draws": 0,
               "losses": 1
            }
         ],
         [
            "middle_index",
            {
               "wins": 0,
               "draws": 6,
               "losses": 0
            }
         ],
         [
            "copy",
            {
               "wins": 3,
               "draws": 0,
               "losses": 3
            }
         ],
         [
            "avoider",
            {
               "wins": 4,
               "draws": 1,
               "losses": 1
            }
         ],
         [
            "closer",
            {
               "wins": 6,
               "draws": 0,
               "losses": 0
            }
         ],
         [
            "firstDiagonal",
            {
               "wins": 6,
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
               "losses": 3
            }
         ],
         [
            "middle_index",
            {
               "wins": 3,
               "draws": 0,
               "losses": 3
            }
         ],
         [
            "copy",
            {
               "wins": 3,
               "draws": 0,
               "losses": 3
            }
         ],
         [
            "avoider",
            {
               "wins": 0,
               "draws": 0,
               "losses": 6
            }
         ],
         [
            "closer",
            {
               "wins": 0,
               "draws": 0,
               "losses": 6
            }
         ],
         [
            "firstDiagonal",
            {
               "wins": 1,
               "draws": 0,
               "losses": 5
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
               "wins": 3,
               "draws": 0,
               "losses": 3
            }
         ],
         [
            "middle_index",
            {
               "wins": 1,
               "draws": 1,
               "losses": 4
            }
         ],
         [
            "copy",
            {
               "wins": 6,
               "draws": 0,
               "losses": 0
            }
         ],
         [
            "avoider",
            {
               "wins": 1,
               "draws": 4,
               "losses": 1
            }
         ],
         [
            "closer",
            {
               "wins": 0,
               "draws": 0,
               "losses": 6
            }
         ],
         [
            "firstDiagonal",
            {
               "wins": 1,
               "draws": 0,
               "losses": 5
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
               "wins": 4,
               "draws": 0,
               "losses": 2
            }
         ],
         [
            "middle_index",
            {
               "wins": 0,
               "draws": 0,
               "losses": 6
            }
         ],
         [
            "copy",
            {
               "wins": 6,
               "draws": 0,
               "losses": 0
            }
         ],
         [
            "avoider",
            {
               "wins": 6,
               "draws": 0,
               "losses": 0
            }
         ],
         [
            "closer",
            {
               "wins": 3,
               "draws": 0,
               "losses": 3
            }
         ],
         [
            "firstDiagonal",
            {
               "wins": 0,
               "draws": 0,
               "losses": 6
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
               "wins": 3,
               "draws": 0,
               "losses": 3
            }
         ],
         [
            "middle_index",
            {
               "wins": 0,
               "draws": 0,
               "losses": 6
            }
         ],
         [
            "copy",
            {
               "wins": 5,
               "draws": 0,
               "losses": 1
            }
         ],
         [
            "avoider",
            {
               "wins": 5,
               "draws": 0,
               "losses": 1
            }
         ],
         [
            "closer",
            {
               "wins": 6,
               "draws": 0,
               "losses": 0
            }
         ],
         [
            "firstDiagonal",
            {
               "wins": 3,
               "draws": 0,
               "losses": 3
            }
         ]
      ]
   ]
]
```
