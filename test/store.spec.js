
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

        expect(store.getState().name).toBe('errorrik');
        expect(store.getState().emails[0]).toBe('errorrik@gmail.com');
        expect(store.getState('name')).toBe('errorrik');
        expect(store.getState('emails[0]')).toBe('errorrik@gmail.com');
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

        expect(store.getState().name).toBe('errorrik');
        expect(store.getState().emails[0]).toBe('errorrik@gmail.com');

        store.dispatch('changeName', 'erik');
        expect(store.getState().name).toBe('erik');
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

        expect(store.getState().name).toBe('errorrik');
        expect(store.getState().emails.length).toBe(1);


        let isChangeFired;
        store.listen(diff => {
            isChangeFired = true;
            expect(diff.length).toBe(2);
        });

        store.dispatch('change', {name: 'erik', email: 'erik168@163.com'});

        expect(store.getState().name).toBe('erik');
        expect(store.getState().emails[0]).toBe('errorrik@gmail.com');
        expect(store.getState().emails[1]).toBe('erik168@163.com');
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

        expect(store.getState().name).toBe('errorrik');
        expect(store.getState().emails.length).toBe(1);


        let fireTimes = 0;
        let listener = diff => {
            fireTimes++;
            expect(diff.length).toBe(2);
        };

        store.listen(listener);

        store.dispatch('change', {name: 'erik', email: 'erik168@163.com'});

        expect(store.getState().name).toBe('erik');
        expect(store.getState().emails[0]).toBe('errorrik@gmail.com');
        expect(store.getState().emails[1]).toBe('erik168@163.com');
        expect(fireTimes).toBe(1);

        store.unlisten(listener);
        store.dispatch('change', {name: 'e', email: 'e@e.com'});
        expect(store.getState().name).toBe('e');
        expect(store.getState().emails[2]).toBe('e@e.com');
        expect(fireTimes).toBe(1);
    });

    it('can add action after store created by "addAction"', () => {
        let store = new Store({
            initData: {
                name: 'errorrik',
                emails: ['errorrik@gmail.com']
            }
        });

        expect(store.getState().name).toBe('errorrik');
        expect(store.getState().emails[0]).toBe('errorrik@gmail.com');

        store.addAction('changeName', name => updateBuilder().set('name', name));
        store.dispatch('changeName', 'erik');
        expect(store.getState().name).toBe('erik');
    });

    it('can add action after store created by "addActions"', () => {
        let store = new Store({
            initData: {
                name: 'errorrik',
                emails: ['errorrik@gmail.com']
            }
        });

        expect(store.getState().name).toBe('errorrik');
        expect(store.getState().emails[0]).toBe('errorrik@gmail.com');

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

        expect(store.getState().name).toBe('erik');
        expect(store.getState().emails[0]).toBe('errorrik@gmail.com');
        expect(store.getState().emails[1]).toBe('erik168@163.com');
    });

    it('update depend on current state', () => {
        let store = new Store({
            initData: {
                name: 'errorrik',
                emails: ['errorrik@gmail.com']
            }
        });

        expect(store.getState().name).toBe('errorrik');
        expect(store.getState().emails[0]).toBe('errorrik@gmail.com');

        store.addActions({
            change(info, {getState}) {
                let builder = updateBuilder().set('name', info.name);

                if (!getState('emails[0]')) {
                    builder = builder.push('emails', info.email);
                }

                return builder;
            }
        });
        store.dispatch('change', {
            name: 'erik',
            email: 'erik168@163.com'
        });

        expect(store.getState().name).toBe('erik');
        expect(store.getState().emails[0]).toBe('errorrik@gmail.com');
        expect(store.getState('emails').length).toBe(1);
    });


    it('dispatch async action, promise resolve value is unuseful', done => {
        let store = new Store({
            initData: {
                name: 'errorrik',
                emails: ['errorrik@gmail.com']
            }
        });

        expect(store.getState().name).toBe('errorrik');
        expect(store.getState().emails[0]).toBe('errorrik@gmail.com');

        store.addActions({
            changeName(name, {dispatch}) {
                return new Promise(function (resolve) {
                    setTimeout(() => {
                        dispatch('setName', name);
                        resolve(updateBuilder().set('name', 'hello'));
                    }, 200);
                });
            },

            setName(name) {
                return updateBuilder().set('name', name);
            }
        });
        store.dispatch('changeName', 'erik');

        setTimeout(() => {
            expect(store.getState().name).toBe('erik');
            expect(store.getState().emails[0]).toBe('errorrik@gmail.com');

            done();
        }, 500);
    });

    it('dispatch async action in action', done => {
        let store = new Store({});

        expect(store.getState().list == null).toBeTruthy();

        store.addActions({
            fetchList(payload, {dispatch, getState}) {
                dispatch('loadingState', true);

                return requestList().then(list => {
                    dispatch('loadingState', false);

                    expect(getState('loading')).not.toBeTruthy();
                    expect(getActionInfo().done).not.toBeTruthy();
                    dispatch('updateList', list);
                });
            },

            updateList(list) {
                return updateBuilder().set('list', list);
            },

            loadingState(state) {
                return updateBuilder().set('loading', state);
            }
        });

        store.dispatch('fetchList');
        expect(store.getState('loading')).toBeTruthy();
        expect(getActionInfo().done).not.toBeTruthy();

        setTimeout(() => {
            expect(store.getState('loading')).not.toBeTruthy();
            expect(store.getState('list').length).toBe(2);
            expect(store.getState('list[0]')).toBe(1);
            expect(getActionInfo().done).toBeTruthy();

            done();
        }, 500);

        function requestList() {
            return new Promise(function (resolve) {
                setTimeout(() => {
                    resolve([1, 2]);
                }, 100);
            });
        }

        function getActionInfo() {
            let actionInfo;

            store.actionCtrl.list.forEach(item => {
                if (item.name === 'fetchList') {
                    actionInfo = item;
                }
            });
            return actionInfo;
        }
    });

    it('children action not done, action shouldnot be mark done', done => {
        let store = new Store({});

        expect(store.getState().list == null).toBeTruthy();

        store.addActions({
            fetchList(page, {getState, dispatch}) {
                dispatch('showLoading');
                dispatch('updateCurrentPage', page);
                expect(getState('currentPage')).toBe(page);

                return requestList(page).then(list => {
                    expect(getState('currentPage')).toBe(page);

                    if (getState('currentPage') === page) {
                        dispatch('sleep');
                        dispatch('hideLoading');

                        expect(getState('loading')).not.toBeTruthy();
                        expect(getActionInfo().done).not.toBeTruthy();
                        dispatch('updateList', list);
                    }
                });
            },

            showLoading() {
                return updateBuilder().set('loading', true);
            },

            hideLoading() {
                return updateBuilder().set('loading', false);
            },

            updateCurrentPage(page) {
                return updateBuilder().set('currentPage', page);
            },

            updateList(list) {
                return updateBuilder().set('list', list);
            },

            sleep() {
                return new Promise(resolve => {
                    setTimeout(() => {resolve()}, 400);
                });
            }
        });

        store.dispatch('fetchList', 1);
        expect(store.getState('loading')).toBeTruthy();
        expect(getActionInfo().done).not.toBeTruthy();

        setTimeout(() => {
            expect(store.getState('loading')).not.toBeTruthy();
            expect(store.getState('list').length).toBe(1);
            expect(store.getState('list[0]')).toBe(1);
            expect(getActionInfo().done).not.toBeTruthy();
        }, 400);

        setTimeout(() => {
            expect(getActionInfo().done).toBeTruthy();
            done();
        }, 1000);

        function requestList(page) {
            return new Promise(function (resolve) {
                setTimeout(() => {
                    resolve([page]);
                }, 100);
            });
        }

        function getActionInfo() {
            let actionInfo;

            store.actionCtrl.list.forEach(item => {
                if (item.name === 'fetchList') {
                    actionInfo = item;
                }
            });
            return actionInfo;
        }
    });


});
