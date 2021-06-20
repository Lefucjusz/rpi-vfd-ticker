const HD44780 = require('./HD44780');

const buffer = {
    bufferArray: null,
    rows: null,
    columns: null,
    init: function(rows, columns) {
        this.rows = rows;
        this.columns = columns;
        this.bufferArray = new Array(this.rows * this.columns);
        this.bufferArray.fill(' ');

        const pinDefinitions = {
            RS: 19,
            RW: 21,
            E: 23,
            D4: 18, 
            D5: 22,
            D6: 24, 
            D7: 26
        }

        HD44780.init(pinDefinitions);
	HD44780.setBrightness(3); // 75% brightness
    },
    update: function(row, newElement) {
        const offset = (row - 1) * this.columns;
        for(let i = 0; i < this.columns - 1; i++) {
            const index = offset + i;
            this.bufferArray[index] = this.bufferArray[index + 1];
        }
        this.bufferArray[offset + this.columns - 1] = newElement;

        const rowData = this.bufferArray.slice(offset, offset + this.columns);
        HD44780.goToPosition(row, 1);
        HD44780.sendString(rowData);
    },
    fill: function(row, string) {
        const offset = (row - 1) * this.columns;
        for(let i = 0; i < this.columns; i++) {
            const index = offset + i;
            this.bufferArray[index] = string[i];
        }

        const rowData = this.bufferArray.slice(offset, offset + this.columns);
        HD44780.goToPosition(row, 1);
        HD44780.sendString(rowData);
    }
}

module.exports = buffer;
