const date = {
    getCurrentDate: function() {
        const rawDate = new Date();
        
        const day = rawDate.getDate().toString().padStart(2, '0');
        const month = (rawDate.getMonth() + 1).toString().padStart(2, '0'); // Months are counted from 0...
        const year = rawDate.getFullYear();
        const dateMerged = `${year}-${month}-${day}`;

        const hours = rawDate.getHours().toString().padStart(2, '0');
        const minutes = rawDate.getMinutes().toString().padStart(2, '0');
        const seconds = rawDate.getSeconds().toString().padStart(2, '0');
        const timeMerged = `${hours}:${minutes}:${seconds}`;

        return {
            date: dateMerged,
            time: timeMerged
        }
    }
}

module.exports = date;