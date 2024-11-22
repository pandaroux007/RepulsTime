# RepulsTime
***Limit time spent on repuls.io***

## Licence
This extension is licensed under the MIT license (see [LICENSE.txt](LICENCE.txt) file), for more information go to https://opensource.org/license/mit

## State
> [!IMPORTANT]
> This extension is in active development and is not yet fully functional (settings, repuls.io tab change detection, etc...). **DO NOT USE IT!**

# Development
currently being written...
## Extension storage
- `timePlayedToday`: The time (in seconds) that the user has played on the current day. This value is updated every second while the user is on repuls.io.
- `lastDate`: A string representation of the last date the extension was active. This is used to reset the `timePlayedToday` counter when a new day starts. It's stored in the format returned by `new Date().toDateString()`.
- `timeLimits`: An object containing the daily time limits for each day of the week (they can be changed in the settings). The structure is as follows:
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