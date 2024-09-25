const PRESSED = 1, RELEASED = 0;

export class Input {

    constructor(hold = false) {
        this.keyStates = new Map();
        this.keyMap = new Map();
        this.hold = hold;
    }

    addMap(code, callback = null) {
        this.keyMap.set(code, callback);
    }

    getKeyState(key)
    {
        return this.keyStates.get(key);
    }

    #handleEvent(event) {
        const {code, type} = event;
        if(!this.keyMap.has(code)) {
            return;
        }
        event.preventDefault();
        const keyState = type == 'keydown' ? PRESSED : RELEASED;
        if(this.keyStates.get(code) === keyState) {
            return;
        }
        this.keyStates.set(code, keyState);
        this.keyMap.get(code)?.(keyState);
    }

    listen(window) {
        ['keydown', 'keyup'].forEach(eventName => {
            window.addEventListener(eventName, event => {
                this.#handleEvent(event);
            });
        });

    }
}
