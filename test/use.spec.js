import {Store, store} from 'san-store';
import {useAction, useState} from 'san-store/use';
import san from 'san';
import {components, defineComponent, onAttached, template} from 'san-composition';
import {updateBuilder} from 'san-update';

describe('use', () => {
    store.addAction('reset-for-use', () => {
        let resetBuilder = updateBuilder()
            .set('name', 'errorrik')
            .set('emails', ['errorrik@gmail.com'])
            .set('hobbies', ['apple', 'banana', 'orange'])
            .set('addresses', {
                home: 'Beijing',
                company: 'BaiduK5'
            });

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

    it('useState with callback when there are multiple components', () => {
        const MY_ACTION_NAME = 'for-use-state-with-fn';
        store.addAction(MY_ACTION_NAME, payload => {
            let builder = updateBuilder();
            if (payload.name) {
                builder = builder.set('name', payload.name);
            }
            if (payload.age) {
                builder = builder.set('age', payload.age);
            }
            return builder;
        });
        store.dispatch(MY_ACTION_NAME, {
            name: 'erik',
            age: 18
        });

        let MyComponent = defineComponent(() => {
            template(`
                <div>
                    <u title="{{name}}">{{name}}</u>
                    <u>{{age}}</u>
                </div>
            `);

            useState(state => state.name, 'name');
            useState(state => state.age, 'age');
        }, san);

        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let us = wrap.getElementsByTagName('u');
        expect(us[0].innerText).toBe('erik');
        expect(us[1].innerText).toBe('18');

        store.dispatch(MY_ACTION_NAME, {
            age: 40
        });
        san.nextTick(() => {
            expect(us[0].innerText).toBe('erik');
            expect(us[1].innerText).toBe('40');
            myComponent.dispose();
            document.body.removeChild(wrap);
        });
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

            let nameData = useState('name');
            useState('emails[0]', 'email');

            let update = useAction('for-use-1', 'update');
            onAttached(() => {
                expect(nameData.get()).toBe('errorrik');
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

        let u = wrap.getElementsByTagName('u')[0];
        expect(u.title).toBe('errorrik-errorrik@gmail.com');

        san.nextTick(() => {
            let u = wrap.getElementsByTagName('u')[0];
            expect(u.title).toBe('erik-erik@gmail.com');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });
    });

    it('component data should be update when modify same array chaining', done => {
        const MY_ACTION_NAME = 'for-use-modify-array';
        store.addAction(MY_ACTION_NAME, payload => {
            return updateBuilder()
                .set('hobbies.0', payload[0])
                .set('hobbies.1', payload[1])
                .set('hobbies.2', payload[2]);
        });

        let MyComponent = defineComponent(() => {
            template('<dl><dd san-for="hobby in hobbies">{{hobby}}</dd></dl>');
            let hobbiesData = useState('hobbies', 'hobbies');
            let update = useAction(MY_ACTION_NAME);
            onAttached(() => {
                expect(hobbiesData.get()).toEqual(['apple', 'banana', 'orange']);
                update(['basketball', 'football', 'tennis']);
            });
        }, san);

        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let dds = wrap.getElementsByTagName('dd');
        expect(dds[0].innerText).toBe('apple');
        expect(dds[1].innerText).toBe('banana');
        expect(dds[2].innerText).toBe('orange');

        san.nextTick(() => {
            let dds = wrap.getElementsByTagName('dd');
            expect(dds[0].innerText).toBe('basketball');
            expect(dds[1].innerText).toBe('football');
            expect(dds[2].innerText).toBe('tennis');


            expect(myComponent.data.get('hobbies[0]')).toBe('basketball');
            expect(myComponent.data.get('hobbies[1]')).toBe('football');
            expect(myComponent.data.get('hobbies[2]')).toBe('tennis');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });
    });

    it('component data should be update when merge object', done => {
        const MY_ACTION_NAME = 'for-use-merge-object';
        store.addAction(MY_ACTION_NAME, payload => {
            return updateBuilder().merge('addresses', payload);
        });

        let MyComponent = defineComponent(() => {
            template(`
                    <dl>
                        <dd>{{addresses.home}}</dd>
                        <dd>{{addresses.company}}</dd>
                        <dd>{{addresses.travel}}</dd>
                    </dl>`);

            let addresses = useState('addresses', 'addresses');
            let merge = useAction(MY_ACTION_NAME);

            onAttached(() => {
                expect(addresses.get()).toEqual({
                    home: 'Beijing',
                    company: 'BaiduK5'
                });
                merge({
                    company: 'BaiduDasha',
                    travel: 'Shanghai'
                });
            });

        }, san);

        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let dds = wrap.getElementsByTagName('dd');
        expect(dds[0].innerText).toBe('Beijing');
        expect(dds[1].innerText).toBe('BaiduK5');
        expect(dds[2].innerText).toBe('');

        san.nextTick(() => {
            let dds = wrap.getElementsByTagName('dd');

            expect(dds[0].innerText).toBe('Beijing');
            expect(dds[1].innerText).toBe('BaiduDasha');
            expect(dds[2].innerText).toBe('Shanghai');
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
