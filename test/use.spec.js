import {Store, store} from 'san-store';
import {useState, useAction} from 'san-store/use';
import san from 'san';
import {defineComponent, template, onAttached} from 'san-composition';
import {updateBuilder} from 'san-update';

describe('use', () => {
    store.addAction('reset-for-use', () => {
        let resetBuilder = updateBuilder()
            .set('name', 'errorrik')
            .set('emails', ['errorrik@gmail.com']);

        return resetBuilder;
    });

    beforeEach(done => {
        store.dispatch('reset-for-use');
        setTimeout(done, 1);
    });

    it('has useState and useAction methods', () => {
        expect(typeof useState).toBe('function');
        expect(typeof useAction).toBe('function');
    });

    it('data should be ready when component init', () => {
        let MyComponent = defineComponent(() => {
            template('<u title="{{name}}-{{email}}">{{name}}-{{email}}</u>');

            useState('name');
            useState('emails[0]', 'email');
        }, san);
        
        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let u = wrap.getElementsByTagName('u')[0];
        expect(u.title).toBe('errorrik-errorrik@gmail.com');

        myComponent.dispose();
        document.body.removeChild(wrap);
    });

    it('component data should be update when store data change', done => {
        store.addAction('for-use-1', payload => {
            let builder = updateBuilder()
                .set('name', payload.name)
                .set('emails[0]', payload.email);
    
            return builder;
        });

        let MyComponent = defineComponent(() => {
            template('<u title="{{name}}-{{email}}">{{name}}-{{email}}</u>');

            useState('name');
            useState('emails[0]', 'email');

            let update = useAction('for-use-1', 'update');
            onAttached(() => {
                update({
                    name: 'erik',
                    email: 'erik@gmail.com'
                });
            });

        }, san);
        
        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        san.nextTick(() => {
            let u = wrap.getElementsByTagName('u')[0];
            expect(u.title).toBe('erik-erik@gmail.com');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });
    });

    it('use store which create by yourself', () => {
        let myStore = new Store({
            initData: {
                name: 'erik',
                emails: ['erik@gmail.com']
            }
        });

        let MyComponent = defineComponent(() => {
            template('<u title="{{name}}-{{email}}">{{name}}-{{email}}</u>');

            useState(myStore, 'name');
            useState(myStore, 'emails[0]', 'email');

        }, san);

        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let u = wrap.getElementsByTagName('u')[0];
        expect(u.title).toBe('erik-erik@gmail.com');

        myComponent.dispose();
        document.body.removeChild(wrap);
    });

    it('data from many stores', () => {
        let myStore = new Store({
            initData: {
                name: 'erik'
            }
        });
        let myStore2 = new Store({
            initData: {
                emails: ['erik@gmail.com']
            }
        });

        let MyComponent = defineComponent(() => {
            template('<u title="{{name}}-{{email}}">{{name}}-{{email}}</u>');

            useState(myStore, 'name');
            useState(myStore2, 'emails[0]', 'email');

        }, san);


        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let u = wrap.getElementsByTagName('u')[0];
        expect(u.title).toBe('erik-erik@gmail.com');

        myComponent.dispose();
        document.body.removeChild(wrap);
    });

    it('data from many stores, update by dispatch', done => {
        let myStore = new Store({
            initData: {
                name: 'erik'
            },

            actions: {
                updateName(payload) {
                    return updateBuilder()
                        .set('name', payload);
                }
            }
        });
        let myStore2;

        let MyComponent = defineComponent(() => {
            template('<u title="{{name}}-{{email}}">{{name}}-{{email}}</u>');

            myStore2 = new Store({
                initData: {
                    emails: ['erik@gmail.com']
                },
    
                actions: {
                    updateEmail(payload) {
                        return updateBuilder()
                            .set('emails[0]', payload);
                    }
                }
            });
            useState(myStore, 'name');
            useState(myStore2, 'emails[0]', 'email');

        }, san);

        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let u = wrap.getElementsByTagName('u')[0];
        expect(u.title).toBe('erik-erik@gmail.com');

        myStore.dispatch('updateName', 'errorrik');
        myStore2.dispatch('updateEmail', 'errorrik@gmail.com');

        san.nextTick(() => {
            let u = wrap.getElementsByTagName('u')[0];
            expect(u.title).toBe('errorrik-errorrik@gmail.com');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });

    });

    it('data from many stores, update by use action', done => {
        let myStore = new Store({
            initData: {
                name: 'erik'
            },

            actions: {
                updateName(payload) {
                    return updateBuilder()
                        .set('name', payload);
                }
            }
        });
        let myStore2 = new Store({
            initData: {
                emails: ['erik@gmail.com']
            },

            actions: {
                updateEmail(payload) {
                    return updateBuilder()
                        .set('emails[0]', payload);
                }
            }
        });

        let MyComponent = defineComponent(() => {
            template('<u title="{{name}}-{{email}}">{{name}}-{{email}}</u>');

            useState(myStore, 'name');
            useState(myStore2, 'emails[0]', 'email');

            useAction(myStore, 'updateName', 'name');
            useAction(myStore2, 'updateEmail', 'email');

        }, san);

        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let u = wrap.getElementsByTagName('u')[0];
        expect(u.title).toBe('erik-erik@gmail.com');

        myComponent.name('errorrik');
        myComponent.email('errorrik@gmail.com');

        san.nextTick(() => {
            let u = wrap.getElementsByTagName('u')[0];
            expect(u.title).toBe('errorrik-errorrik@gmail.com');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });
    }); 
});