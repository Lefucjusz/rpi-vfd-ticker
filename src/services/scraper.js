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
    removeDiacritics: function(string) {
        return string.replace(/ą/g, 'a').replace(/Ą/g, 'A')
        .replace(/ć/g, 'c').replace(/Ć/g, 'C')
        .replace(/ę/g, 'e').replace(/Ę/g, 'E')
        .replace(/ł/g, 'l').replace(/Ł/g, 'L')
        .replace(/ń/g, 'n').replace(/Ń/g, 'N')
        .replace(/ó/g, 'o').replace(/Ó/g, 'O')
        .replace(/ś/g, 's').replace(/Ś/g, 'S')
        .replace(/ż/g, 'z').replace(/Ż/g, 'Z')
        .replace(/ź/g, 'z').replace(/Ź/g, 'Z');
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

            return this.removeDiacritics(this.newsString);
        } catch(error) {
            console.log(error);
        }
    }
}

module.exports = scraper;
