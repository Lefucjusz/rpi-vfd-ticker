const scraper = require('./services/scraper');
const buffer = require('./services/buffer');

async function start() {
    buffer.init(2, 20);
    let newsString = await scraper.requestAndParseData();
    let index = 0;
    setInterval(async () => {
        const date = new Date();
        const dateString = date.toLocaleDateString([], {day: '2-digit', month: '2-digit', year: 'numeric'});
        const timeString = date.toLocaleTimeString([], {hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'});
        buffer.fill(2, `${dateString.substr(6,4)}-${dateString.substr(0,2)}-${dateString.substr(3,2)}  ${timeString}`);        
        
        buffer.update(1, newsString[index]); 
            
        index++;
        if(index >= newsString.length) {
            index = 0;
            newsString = await scraper.requestAndParseData();
        }
    }, 75);
}

start();
