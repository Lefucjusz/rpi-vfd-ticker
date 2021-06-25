const scraper = require('./services/scraper');
const buffer = require('./services/buffer');
const date = require('./services/date');

async function start() {
    buffer.init(2, 20);
    let newsString = await scraper.requestAndParseData();
    let index = 0;
    setInterval(async () => {
        buffer.update(1, newsString[index]); 
            
        index++;
        if(index >= newsString.length) {
            index = 0;
            newsString = await scraper.requestAndParseData();
        }
    }, 120);
    
    setInterval(() => {
        const dateTime = date.getCurrentDate();
        buffer.fill(2, `${dateTime.date}  ${dateTime.time}`);  
    }, 500);
}

start();
