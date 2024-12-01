<div align="center">

![GitHub](icons/banner.svg)

# [RepulsTime]
***Limit time spent on repuls.io***

[![GitHub](https://img.shields.io/badge/GitHub-%23121011.svg?logo=github&logoColor=white)](https://github.com/pandaroux007/RepulsTime)
[![Licence](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://github.com/pandaroux007/RepulsTime/blob/main/LICENCE.txt)
[![Firefox](https://img.shields.io/badge/Firefox-FF7139?logo=Firefox&logoColor=white&style=flat)](https://addons.mozilla.org/fr/firefox/addon/repulstime/)
[![Commits](https://img.shields.io/github/commit-activity/t/pandaroux007/RepulsTime)](https://github.com/pandaroux007/RepulsTime/commits/main/)
[![Stars](https://img.shields.io/github/stars/pandaroux007/RepulsTime.svg?style=social&label=Stars)](https://github.com/pandaroux007/RepulsTime)

Langages

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000)
![HTML](https://img.shields.io/badge/HTML-%23E34F26.svg?logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-1572B6?logo=css3&logoColor=fff)
![JSON](https://img.shields.io/badge/JSON-000?logo=json&logoColor=fff)
</div>

## Licence
This extension is licensed under the MIT license (see [LICENSE.txt](LICENCE.txt) file), for more information go to https://opensource.org/license/mit

## State
> [!IMPORTANT]
> This extension is currently finished for version 1 but placed in beta for now - **YOU CAN USE IT BUT DON'T BE SURPRISED IF YOU ENCOUNTER BUGS!**

If you find any issues/bugs, report them in [a GitHub issue](https://www.github.com/pandaroux007/RepulsTime/issues). If you have an idea for improvement, suggest it in the comments on AMO on [the extension page](https://addons.mozilla.org/fr/firefox/addon/repulstime/).

# Development
currently being written...
## Extension storage
- **`timePlayedToday`**: The time (in seconds) that the user has played on the current day. This value is updated every second while the user is on repuls.io.
- **`lastDate`**: A string representation of the last date the extension was active. This is used to reset the `timePlayedToday` counter when a new day starts. It's stored in the format returned by `new Date().toDateString()`.
- **`timeLimits`**: An object containing the daily time limits for each day of the week (they can be changed in the settings). The structure is as follows:
```json
{
    "monday": 30,
    "tuesday": 30,
    "wednesday": 45,
    "thursday": 30,
    "friday": 45,
    "saturday": 45,
    "sunday": 0
}
```
- **`timeRemaining`**: Used only by the popup (for display the remaining time) and updated in the `startTimer` function of `background.js`. Contains the remaining time so as not to have to define the `calculateRemainingTime` and `getDailyTimeLimit` functions twice. Probably not optimized and not reliable!
- **`contentVisible`** : Variable containing the display state of unnecessary elements of the game's main page (suggestion of gameplay video on youtube and link group at the right bottom).

## ToDo list
- [x] complete settings management (html, css, javascript...);
- [ ] finish writing the doc (README.md file);

[RepulsTime]: https://addons.mozilla.org/fr/firefox/addon/repulstime/