
import Store from '../src/store';
import {updateBuilder} from 'san-update';

describe('Store', () => {
    it('init data by constructor', () => {
        let store = new Store({
            initData: {
                name: 'errorrik',
                emails: ['errorrik@gmail.com']
            }
        });

        expect(store.get().name).toBe('errorrik');
        expect(store.get().emails[0]).toBe('errorrik@gmail.com');
    });

    it('can data change by dispatch action', () => {
        let store = new Store({
            initData: {
                name: 'errorrik',
                emails: ['errorrik@gmail.com']
            },
            actions: {
                changeName(name) {
                    return updateBuilder().set('name', name);
                }
            }
        });

        expect(store.get().name).toBe('errorrik');
        expect(store.get().emails[0]).toBe('errorrik@gmail.com');

        store.dispatch('changeName', 'erik');
        expect(store.get().name).toBe('erik');
    });

    it('listenable', () => {
        let store = new Store({
            initData: {
                name: 'errorrik',
                emails: ['errorrik@gmail.com']
            },
            actions: {
                change({name, email}) {
                    return updateBuilder().set('name', name).push('emails', email);
                }
            }
        });

        expect(store.get().name).toBe('errorrik');
        expect(store.get().emails.length).toBe(1);


        let isChangeFired;
        store.listen(diff => {
            isChangeFired = true;
            expect(diff.length).toBe(2);
        });

        store.dispatch('change', {name: 'erik', email: 'erik168@163.com'});

        expect(store.get().name).toBe('erik');
        expect(store.get().emails[0]).toBe('errorrik@gmail.com');
        expect(store.get().emails[1]).toBe('erik168@163.com');
        expect(isChangeFired).toBeTruthy();
    });

    it('remove listener by unlisten method', () => {
        let store = new Store({
            initData: {
                name: 'errorrik',
                emails: ['errorrik@gmail.com']
            },
            actions: {
                change({name, email}) {
                    return updateBuilder().set('name', name).push('emails', email);
                }
            }
        });

        expect(store.get().name).toBe('errorrik');
        expect(store.get().emails.length).toBe(1);


        let fireTimes = 0;
        let listener = diff => {
            fireTimes++;
            expect(diff.length).toBe(2);
        };

        store.listen(listener);

        store.dispatch('change', {name: 'erik', email: 'erik168@163.com'});

        expect(store.get().name).toBe('erik');
        expect(store.get().emails[0]).toBe('errorrik@gmail.com');
        expect(store.get().emails[1]).toBe('erik168@163.com');
        expect(fireTimes).toBe(1);

        store.unlisten(listener);
        store.dispatch('change', {name: 'e', email: 'e@e.com'});
        expect(store.get().name).toBe('e');
        expect(store.get().emails[2]).toBe('e@e.com');
        expect(fireTimes).toBe(1);
    });

    it('can add action after store created by "addAction"', () => {
        let store = new Store({
            initData: {
                name: 'errorrik',
                emails: ['errorrik@gmail.com']
            }
        });

        expect(store.get().name).toBe('errorrik');
        expect(store.get().emails[0]).toBe('errorrik@gmail.com');

        store.addAction('changeName', name => updateBuilder().set('name', name));
        store.dispatch('changeName', 'erik');
        expect(store.get().name).toBe('erik');
    });

    it('can add action after store created by "addActions"', () => {
        let store = new Store({
            initData: {
                name: 'errorrik',
                emails: ['errorrik@gmail.com']
            }
        });

        expect(store.get().name).toBe('errorrik');
        expect(store.get().emails[0]).toBe('errorrik@gmail.com');

        store.addActions({
            changeName(name) {
                return updateBuilder().set('name', name);
            },

            addEmail(email) {
                return updateBuilder().push('emails', email);
            }
        });
        store.dispatch('changeName', 'erik');
        store.dispatch('addEmail', 'erik168@163.com');

        expect(store.get().name).toBe('erik');
        expect(store.get().emails[0]).toBe('errorrik@gmail.com');
        expect(store.get().emails[1]).toBe('erik168@163.com');
    });


});
