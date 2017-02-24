
import EventTarget from 'mini-event/EventTarget';
import {set, push, unshift, splice} from 'san-update';
import parseName from './parse-name';


class ActionContext {
    constructor(store, actionName) {
        this.store = store;
        this.actionName = actionName;
    }

    set(name, value) {
        name = parseName(name);

        if (value !== this.store.get(name)) {
            this.store.raw = set(this.store.raw, name, value);

            let arg = {
                change: 'set',
                action: this.actionName,
                value: value,
                prop: name
            };
            this.store.log.push(arg);
            this.store.fire('change', arg);
        }
    }

    push(name, value) {
        if (value != null) {
            name = parseName(name);

            this.store.raw = push(this.store.raw, name, value);
            let arg = {
                change: 'push',
                action: this.actionName,
                value: value,
                prop: name
            };

            this.store.log.push(arg);
            this.store.fire('change', arg);
        }
    }

    unshift(name, value) {
        if (value != null) {
            name = parseName(name);

            this.store.raw = unshift(this.store.raw, name, value);
            let arg = {
                change: 'unshift',
                action: this.actionName,
                value: value,
                prop: name
            };

            this.store.log.push(arg);
            this.store.fire('change', arg);
        }
    }

    pop(name) {
        name = parseName(name);

        let array = this.store.get(name);
        let arrayLen;
        if (array instanceof Array && (arrayLen = array.length) > 0) {
            let value = array[arrayLen - 1];

            this.store.raw = splice(this.store.raw, name, arrayLen - 1, 1);
            let arg = {
                change: 'pop',
                action: this.actionName,
                value: value,
                prop: name
            };

            this.store.log.push(arg);
            this.store.fire('change', arg);

            return value;
        }
    }

    shift(name) {
        name = parseName(name);

        let array = this.store.get(name);
        if (array instanceof Array && array.length > 0) {
            let value = array[0];

            this.store.raw = splice(this.store.raw, name, 0, 1);
            let arg = {
                change: 'shift',
                action: this.actionName,
                value: value,
                prop: name
            };

            this.store.log.push(arg);
            this.store.fire('change', arg);

            return value;
        }
    }

    removeAt(name, index) {
        name = parseName(name);

        let array = this.store.get(name);
        if (array instanceof Array && array.length > index) {
            let value = array[index];

            this.store.raw = splice(this.store.raw, name, index, 1);
            let arg = {
                change: 'remove',
                action: this.actionName,
                value: value,
                prop: name,
                index: index
            };

            this.store.log.push(arg);
            this.store.fire('change', arg);

            return value;
        }
    }

    remove(name, value) {
        name = parseName(name);

        let array = this.store.get(name);
        if (array instanceof Array) {
            let len = array.length;

            while (len--) {
                if (array[len] === value) {
                    return this.removeAt(name, len);
                }
            }
        }
    }
}


export default class Store extends EventTarget {
    constructor(
        {
            initData = {},
            actions = {}
        } = {}
    ) {
        super();

        this.raw = initData;
        this.actions = actions;
        this.log = [];
    }

    get(name) {
        name = parseName(name);

        let value = this.raw;
        for (let i = 0, l = name.length; value != null && i < l; i++) {
            value = value[name[i]];
        }

        return value;
    }

    addAction(name, action) {
        if (typeof action !== 'function') {
            return;
        }

        if (this.actions[name]) {
            throw new Error('Action ' + name + ' exists!');
        }

        this.actions[name] = action;
    }

    addActions(source) {
        for (let key in source) {
            if (source.hasOwnProperty(key)) {
                this.addAction(key, source[key]);
            }
        }
    }

    dispatch(name, payload) {
        let action = this.actions[name];

        if (typeof action === 'function') {
            let context = new ActionContext(store, name);
            action.call(this, context, payload);
        }
    }
}


