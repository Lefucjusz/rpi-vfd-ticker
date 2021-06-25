const axios = require('axios');
const xml2js = require('xml2js');

const scraper = {
    newsString: '',
    parseDate: function(date) {
        const dateSplit = date.split('T');
	    const extractedDate = dateSplit[0];
	    const extractedTime = dateSplit[1].substr(0, 8);
        const dateAsString = `${extractedDate} ${extractedTime}`;
        return dateAsString;
    },
    mapDiacritics: function(string) {
        /* Definitions in display's CGRAM, see HD44780.js -> loadPolishDiacritics() */
        /* No capitals and 'ź' because of only 8 custom characters available :( */ 
        return string.replace(/ą/g, String.fromCharCode(0x00)).replace(/Ą/g, String.fromCharCode(0x00))
        .replace(/ć/g, String.fromCharCode(0x01)).replace(/Ć/g, String.fromCharCode(0x01))
        .replace(/ę/g, String.fromCharCode(0x02)).replace(/Ę/g, String.fromCharCode(0x02))
        .replace(/ł/g, String.fromCharCode(0x03)).replace(/Ł/g, String.fromCharCode(0x03))
        .replace(/ń/g, String.fromCharCode(0x04)).replace(/Ń/g, String.fromCharCode(0x04))
        .replace(/ó/g, String.fromCharCode(0x05)).replace(/Ó/g, String.fromCharCode(0x05))
        .replace(/ś/g, String.fromCharCode(0x06)).replace(/Ś/g, String.fromCharCode(0x06))
        .replace(/ż/g, String.fromCharCode(0x07)).replace(/Ż/g, String.fromCharCode(0x07))
        .replace(/ź/g, String.fromCharCode(0x07)).replace(/Ź/g, String.fromCharCode(0x07)); 
    },
    requestAndParseData: async function() {
        try {
            const res = await axios.get('https://tvn24.pl/najnowsze.xml');
            const parser = new xml2js.Parser();
            let parsedXml = '';
	        parser.parseString(res.data, function(err, result) {
		        parsedXml = result;
            });

            const title = parsedXml.rss.channel[0].title[0];
            this.newsString = `#${title}#`;

            const date = this.parseDate(parsedXml.rss.channel[0].lastBuildDate[0]);
            this.newsString += ` ostatnia aktualizacja: ${date} `;

            const news = parsedXml.rss.channel[0].item;

            for(let i = 0; i < news.length; i++) {
                const newsTitle = news[i].title[0];
                this.newsString += `${i+1}/${news.length} -> ${newsTitle}: `;

                const description = news[i].description[0];
                const descriptionStart = description.indexOf('>') + 6; // 5 additional whitechars after img src closing tag
                const descriptionEnd = description.lastIndexOf('\n    \n    ');
                const descriptionLength = descriptionEnd - descriptionStart;

                const descriptionText = description.substr(descriptionStart, descriptionLength);

                this.newsString += `${descriptionText} `
            }

            return this.mapDiacritics(this.newsString);
        } catch(error) {
            console.log(error);
        }
    }
}

module.exports = scraper;
