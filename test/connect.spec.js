import {Store, store, connect} from 'san-store';
import san from 'san';
import {updateBuilder} from 'san-update';

describe('connect', () => {
    store.addAction('reset-for-connect-module', () => {
        let resetBuilder = updateBuilder()
            .set('name', 'errorrik')
            .set('emails', ['errorrik@gmail.com']);

        return resetBuilder;
    });

    beforeEach(done => {
        store.dispatch('reset-for-connect-module');
        setTimeout(done, 1);
    });

    it('data should be ready when component init', () => {
        let MyComponent = connect({
            name: 'name',
            email: 'emails[0]'
        })(
            san.defineComponent({
                template: '<u title="{{name}}-{{email}}">{{name}}-{{email}}</u>'
            })
        );


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
        store.addAction('for-connect-module-1', payload => {
            let builder = updateBuilder()
                .set('name', payload.name)
                .set('emails[0]', payload.email);

            return builder;
        });

        let MyComponent = connect.san({
            name: 'name',
            email: 'emails[0]'
        })(
            san.defineComponent({
                template: '<u title="{{name}}-{{email}}">{{name}}-{{email}}</u>'
            })
        );

        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let u = wrap.getElementsByTagName('u')[0];
        expect(u.title).toBe('errorrik-errorrik@gmail.com');

        store.dispatch('for-connect-module-1', {
            name: 'erik',
            email: 'erik@gmail.com'
        });

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

        let MyComponent = connect(
            myStore,
            {
                name: 'name',
                email: 'emails[0]'
            })(
            san.defineComponent({
                template: '<u title="{{name}}-{{email}}">{{name}}-{{email}}</u>'
            })
        );


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

        let MyComponent = connect(myStore,{name: 'name'})
            .connect(myStore2, {email: 'emails[0]'})(
                san.defineComponent({
                    template: '<u title="{{name}}-{{email}}">{{name}}-{{email}}</u>'
                }
            )
        );


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

        let MyComponent = connect(myStore,{name: 'name'})
            .connect(myStore2, {email: 'emails[0]'})(
                san.defineComponent({
                    template: '<u title="{{name}}-{{email}}">{{name}}-{{email}}</u>'
                }
            )
        );


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

    it('data from many stores, update by array mapped action', done => {
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

        let MyComponent = connect(myStore,{name: 'name'}, ['updateName'])
            .connect(myStore2, {email: 'emails[0]'}, ['updateEmail'])(
                san.defineComponent({
                    template: '<u title="{{name}}-{{email}}">{{name}}-{{email}}</u>'
                }
            )
        );


        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let u = wrap.getElementsByTagName('u')[0];
        expect(u.title).toBe('erik-erik@gmail.com');

        myComponent.actions.updateName('errorrik');
        myComponent.actions.updateEmail('errorrik@gmail.com');

        san.nextTick(() => {
            let u = wrap.getElementsByTagName('u')[0];
            expect(u.title).toBe('errorrik-errorrik@gmail.com');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });

    });

    it('data from many stores, update by named mapped action', done => {
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

        let MyComponent = connect(myStore,{name: 'name'}, {name:'updateName'})
            .connect(myStore2, {email: 'emails[0]'}, {email:'updateEmail'})(
                san.defineComponent({
                    template: '<u title="{{name}}-{{email}}">{{name}}-{{email}}</u>'
                }
            )
        );


        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let u = wrap.getElementsByTagName('u')[0];
        expect(u.title).toBe('erik-erik@gmail.com');

        myComponent.actions.name('errorrik');
        myComponent.actions.email('errorrik@gmail.com');

        san.nextTick(() => {
            let u = wrap.getElementsByTagName('u')[0];
            expect(u.title).toBe('errorrik-errorrik@gmail.com');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });

    });
});
