const rpio = require('rpio');

const HD44780 = {
    rpioParams: {
        gpiomem: true,
	    mapping: 'physical',
	    close_on_exit: true
    },
    pinDefinitions: null,
    setDataLines: function(nibble) {
        rpio.write(this.pinDefinitions.D4, (nibble & (1 << 0)) ? rpio.HIGH : rpio.LOW);
        rpio.write(this.pinDefinitions.D5, (nibble & (1 << 1)) ? rpio.HIGH : rpio.LOW);
        rpio.write(this.pinDefinitions.D6, (nibble & (1 << 2)) ? rpio.HIGH : rpio.LOW);
        rpio.write(this.pinDefinitions.D7, (nibble & (1 << 3)) ? rpio.HIGH : rpio.LOW);
    },
    init: function(pinDefinitions) {
        this.pinDefinitions = pinDefinitions;

        rpio.init(this.rpioParams);
        rpio.open(this.pinDefinitions.RS, rpio.OUTPUT, rpio.LOW);
        rpio.open(this.pinDefinitions.RW, rpio.OUTPUT, rpio.LOW);
        rpio.open(this.pinDefinitions.E, rpio.OUTPUT, rpio.LOW);
        rpio.open(this.pinDefinitions.D4, rpio.OUTPUT, rpio.LOW);
        rpio.open(this.pinDefinitions.D5, rpio.OUTPUT, rpio.LOW);
        rpio.open(this.pinDefinitions.D6, rpio.OUTPUT, rpio.LOW);
        rpio.open(this.pinDefinitions.D7, rpio.OUTPUT, rpio.LOW);

        /* Ensure that the display will switch from any state to 8 bit mode */
        this.sendCommand(0x30);
        rpio.msleep(5);
        this.sendCommand(0x30);
        rpio.msleep(1);
        this.sendCommand(0x30);
        this.sendCommand(0x02);

        /* Initialize display */
        this.sendCommand(0x28); // 2 lines, 5*8 font, 4-bit
        this.sendCommand(0x0C); // Display on, cursor off, blink off
        this.sendCommand(0x06); // Increase cursor position, scroll on

        this.clear();
    },
    sendByte: function(byte) {
        try {
            if(typeof byte === 'string') {
                byte = byte.charCodeAt(0);
            }

            this.setDataLines((byte >> 4) & 0x0F); // Send upper nibble
            rpio.write(this.pinDefinitions.E, rpio.HIGH);
	        rpio.write(this.pinDefinitions.E, rpio.LOW);

            this.setDataLines(byte & 0x0F); // Send lower nibble
            rpio.write(this.pinDefinitions.E, rpio.HIGH);
	        rpio.write(this.pinDefinitions.E, rpio.LOW);
	} catch(error) {
            console.log(error);
        }
    },
    sendCommand: function(command) {
        rpio.write(this.pinDefinitions.RS, rpio.LOW); // Set RS low - sending commands to LCD
        this.sendByte(command);
    },
    sendChar: function(char) {
        rpio.write(this.pinDefinitions.RS, rpio.HIGH); // Set RS high - sending chars to LCD
        this.sendByte(char);
    },
    sendNum: function(num) {
        this.sendChar(Math.floor(num / 10) + '0');
        this.sendChar((num % 10) + '0');
    },
    sendString: function(string) {
        for(let i = 0; i < string.length; i++) {
            this.sendChar(string[i]);
        }
    },
    goToPosition: function(row, column) {
        switch(row) {
            case 1:
                this.sendCommand(0x80 + column - 1);
                break;
            case 2:
                this.sendCommand(0xC0 + column - 1);
                break;
            default:
                console.log('This display supports only two rows, ordered from 1!');
        }
    },
    clear: function() {
        this.sendCommand(0x01); // Clear display
        this.sendCommand(0x80); // Go to first row, first column
    },
    setBrightness: function (level) {

    }
}

module.exports = HD44780;
