
//checks if a day has passed since date
function DayPassed(date) {
    const now = new Date();
    return date.getTime() < now.getTime() && now.getDay() != date.getDay();
}

exports.DayPassed = DayPassed;