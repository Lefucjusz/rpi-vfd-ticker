const rpio = require('rpio');

const HD44780 = {
    rpioParams: {
        gpiomem: true,
	    mapping: 'physical',
	    close_on_exit: true
    },
    pinDefinitions: null,
    fourBitInterface: 0x20,
    twoLinesDisplay: 0x08,
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
        this.sendCommand(this.fourBitInterface | this.twoLinesDisplay);
        this.sendCommand(0x0C); // Display on, cursor off, blink off
        this.sendCommand(0x06); // Increase cursor position, scroll on
        
	    this.loadPolishDiacritics();
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
                console.log('This display supports only two rows, ranging from 1 to 2!');
        }
    },
    clear: function() {
        this.sendCommand(0x01); // Clear display
		rpio.msleep(1);
        this.sendCommand(0x80); // Go to first row, first column
		rpio.msleep(1);
    },
    setBrightness: function(level) {
        const constantValue = this.fourBitInterface | this.twoLinesDisplay; // Register that controls brightness controls also data bus width and number of the display lines - don't change these settings
        switch(level) {
            case 1:
                this.sendCommand(constantValue | 0x03);
            break;
            case 2:
                this.sendCommand(constantValue | 0x02);
            break;
            case 3:
                this.sendCommand(constantValue | 0x01);
            break;
            case 4:
                this.sendCommand(constantValue);
            break;
            default:
            console.log('This display has only 4 levels of brightness, ranging from 1 to 4!');
        }
    },
    loadChar: function (CGRAMAddress, pixelArray) {
        /* Validate input data */
        if(CGRAMAddress < 0 || CGRAMAddress > 7) {
            console.log('This display supports only 8 custom characters, ranging from 0 to 7!');
            return;
        }
        if(pixelArray.length != 8) {
            console.log('Improper pixelArray format - should be 8 bytes, one for each dot matrix line!');
            return;
        }

        const setFirstCGRAMAddress = 0x40;
        this.sendCommand(setFirstCGRAMAddress + (CGRAMAddress * 8)); // Each char uses 8 bytes
        for(let i = 0; i < 8; i++) {
            this.sendChar(pixelArray[i]); // Store each line in CGRAM
        }
    },
    loadPolishDiacritics: function() {
        const byteCodes = [
            [ //ą
                0b00000,
                0b01110,
                0b00001,
                0b01111,
                0b10001,
                0b01111,
                0b00010,
                0b00001
            ],
            [ //ć
                0b00010,
                0b00100,
                0b01110,
                0b10000,
                0b10000,
                0b10001,
                0b01110,
                0b00000
            ],
            [ //ę
                0b00000,
                0b01110,
                0b10001,
                0b11111,
                0b10000,
                0b01110,
                0b00100,
                0b00010
            ],
            [ //ł
                0b01100,
                0b00100,
                0b00110,
                0b00100,
                0b01100,
                0b00100,
                0b01110,
                0b00000
            ],
            [ //ń
                0b00010,
                0b00100,
                0b10110,
                0b11001,
                0b10001,
                0b10001,
                0b10001,
                0b00000
            ],
            [ //ó
                0b00010,
                0b00100,
                0b01110,
                0b10001,
                0b10001,
                0b10001,
                0b01110,
                0b00000
            ],
            [ //ś
                0b00010,
                0b00100,
                0b01110,
                0b10000,
                0b01110,
                0b00001,
                0b11110,
                0b00000
            ],
            [ //ż
                0b00000,
                0b00010,
                0b11111,
                0b00010,
                0b00100,
                0b01000,
                0b11111,
                0b00000
            ]
        ];

        for(let i = 0; i < byteCodes.length; i++) {
            this.loadChar(i, byteCodes[i]);
        }
    }
}

module.exports = HD44780;
