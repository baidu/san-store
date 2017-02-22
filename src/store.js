
import EventTarget from 'mini-event/EventTarget';
import {set, push, unshift, splice} from 'san-update';
import parseName from './parse-name';

export class Store extends EventTarget {
    constructor(defaultValue = {}) {
        this.raw = defaultValue;
    }

    get(name) {
        name = parseName(name);

        let value = this.raw;
        for (let i = 0, l = name.length; value != null && i < l; i++) {
            value = value[name[i]];
        }

        return value;
    }

    set(name, value) {
        name = parseName(name);

        if (value !== this.get(name)) {
            this.raw = set(this.raw, name, value);
            this.fire('change', {
                type: 'set',
                value: value,
                prop: name
            });
        }
    }

    push(name, value) {
        if (value != null) {
            name = parseName(name);

            this.raw = push(this.raw, name, value);
            this.fire('change', {
                type: 'push',
                value: value,
                prop: name
            });
        }
    }

    unshift(name, value) {
        if (value != null) {
            name = parseName(name);

            this.raw = unshift(this.raw, name, value);
            this.fire('change', {
                type: 'unshift',
                value: value,
                prop: name
            });
        }
    }

    pop(name) {
        name = parseName(name);

        let array = this.get(name);
        let arrayLen;
        if (array instaceof Array && (arrayLen = array.length) > 0) {
            let value = array[arrayLen - 1];

            this.raw = splice(this.raw, name, arrayLen - 1, 1);
            this.fire('change', {
                type: 'pop',
                value: value,
                prop: name
            });

            return value;
        }
    }

    shift(name) {
        name = parseName(name);

        let array = this.get(name);
        if (array instaceof Array && array.length > 0) {
            let value = array[0];

            this.raw = splice(this.raw, name, 0, 1);
            this.fire('change', {
                type: 'shift',
                value: value,
                prop: name
            });

            return value;
        }
    }

    removeAt(name, index) {
        name = parseName(name);

        let array = this.get(name);
        if (array instaceof Array && array.length > index) {
            let value = array[index];

            this.raw = splice(this.raw, name, index, 1);
            this.fire('change', {
                type: 'remove',
                value: value,
                prop: name,
                index: index
            });

            return value;
        }
    }

    remove(name, value) {
        name = parseName(name);

        let array = this.get(name);
        if (array instaceof Array) {
            let len = array.length;

            while (len--) {
                if (array[len] === value) {
                    return this.removeAt(name, len);
                }
            }
        }
    }
}


