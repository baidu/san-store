import connect from '../src/connect/san';
import {store} from '../src/main'
import san from 'san';
import {updateBuilder} from 'san-update';

describe('Connect san component', () => {
    store.addAction('reset-for-connect', () => {
        let resetBuilder = updateBuilder()
            .set('name', 'errorrik')
            .set('emails', ['errorrik@gmail.com']);

        return resetBuilder;
    });

    beforeEach(done => {
        store.dispatch('reset-for-connect');
        setTimeout(done, 1);
    });

    it('data should be ready when component init', () => {
        let MyComponent = san.defineComponent({
            template: '<u title="{{name}}-{{email}}">{{name}}-{{email}}</u>'
        });

        connect({
            name: 'name',
            email: 'emails[0]'
        })(MyComponent);

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
        store.addAction('for-connect-1', payload => {
            let builder = updateBuilder()
                .set('name', payload.name)
                .set('emails[0]', payload.email);

            return builder;
        });

        let MyComponent = san.defineComponent({
            template: '<u title="{{name}}-{{email}}">{{name}}-{{email}}</u>'
        });

        connect({
            name: 'name',
            email: 'emails[0]'
        })(MyComponent);


        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let u = wrap.getElementsByTagName('u')[0];
        expect(u.title).toBe('errorrik-errorrik@gmail.com');

        store.dispatch('for-connect-1', {
            name: 'erik',
            email: 'erik@gmail.com'
        });

        san.nextTick(() => {
            let u = wrap.getElementsByTagName('u')[0];
            expect(u.title).toBe('erik-erik@gmail.com');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        })
    });

    it('component data should be update when store data change, function mapStates item', done => {
        store.addAction('for-connect-2', payload => {
            let builder = updateBuilder()
                .set('name', payload.name)
                .set('emails[0]', payload.email);

            return builder;
        });

        let MyComponent = san.defineComponent({
            template: '<u title="{{name}}-{{email}}">{{name}}-{{email}}</u>'
        });

        connect({
            name: 'name',
            email: state => {
                return state.emails[0];
            }
        })(MyComponent);


        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let u = wrap.getElementsByTagName('u')[0];
        expect(u.title).toBe('errorrik-errorrik@gmail.com');

        store.dispatch('for-connect-2', {
            name: 'erik',
            email: 'erik@gmail.com'
        });

        san.nextTick(() => {
            let u = wrap.getElementsByTagName('u')[0];
            expect(u.title).toBe('erik-erik@gmail.com');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        })
    });

    it('dispatch action method should connect to component "actions" member, object mapActions', done => {
        store.addAction('for-connect-3', payload => {
            let builder = updateBuilder()
                .set('name', payload.name)
                .set('emails[0]', payload.email);

            return builder;
        });

        let MyComponent = san.defineComponent({
            template: '<u title="{{name}}-{{email}}">{{name}}-{{email}}</u>'
        });

        connect(
            {
                name: 'name',
                email: 'emails[0]'
            },
            {
                updateInfo: 'for-connect-3'
            }
        )(MyComponent);


        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let u = wrap.getElementsByTagName('u')[0];
        expect(u.title).toBe('errorrik-errorrik@gmail.com');

        myComponent.actions.updateInfo({
            name: 'erik',
            email: 'erik@gmail.com'
        });

        san.nextTick(() => {
            let u = wrap.getElementsByTagName('u')[0];
            expect(u.title).toBe('erik-erik@gmail.com');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        })
    });

    it('dispatch action method should connect to component "actions" member, array mapActions', done => {
        store.addAction('for-connect-4', payload => {
            let builder = updateBuilder()
                .set('name', payload.name)
                .set('emails[0]', payload.email);

            return builder;
        });

        let MyComponent = san.defineComponent({
            template: '<u title="{{name}}-{{email}}">{{name}}-{{email}}</u>'
        });

        connect(
            {
                name: 'name',
                email: 'emails[0]'
            },
            [
                'for-connect-4'
            ]
        )(MyComponent);


        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let u = wrap.getElementsByTagName('u')[0];
        expect(u.title).toBe('errorrik-errorrik@gmail.com');

        myComponent.actions['for-connect-4']({
            name: 'erik',
            email: 'erik@gmail.com'
        });

        san.nextTick(() => {
            let u = wrap.getElementsByTagName('u')[0];
            expect(u.title).toBe('erik-erik@gmail.com');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        })
    });

    store.addAction('for-connect-persons', persons => {
        let builder = updateBuilder().set('persons', persons);
        return builder;
    });

    it('components data should not infulence each other, and push item', done => {
        store.addAction('for-connect-5', email => {
            let builder = updateBuilder().push('persons[0].emails', email);
            return builder;
        });

        let MyComponent = san.defineComponent({
            template: '<dl><dt title="{{name}}">{{name}}</dt><dd san-for="email in emails" title="{{email}}">{{email}}</dd></dl>'
        });

        connect({
            name: 'persons[0].name',
            emails: 'persons[0].emails'
        })(MyComponent);

        store.dispatch('for-connect-persons', [
            {name: 'erik', emails: ['erik168@163.com', 'errorrik@gmail.com']}
        ]);

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);

        let myComponent1 = new MyComponent();
        myComponent1.attach(wrap);
        let myComponent2 = new MyComponent();
        myComponent2.attach(wrap);

        let dts = wrap.getElementsByTagName('dt');
        let dds = wrap.getElementsByTagName('dd');
        expect(dts.length).toBe(2);
        expect(dds.length).toBe(4);
        expect(dts[0].title).toBe('erik');
        expect(dts[1].title).toBe('erik');

        expect(dds[0].title).toBe('erik168@163.com');
        expect(dds[1].title).toBe('errorrik@gmail.com');
        expect(dds[2].title).toBe('erik168@163.com');
        expect(dds[3].title).toBe('errorrik@gmail.com');

        store.dispatch('for-connect-5', 'xxx@xxx.com');

        san.nextTick(() => {
            let dts = wrap.getElementsByTagName('dt');
            let dds = wrap.getElementsByTagName('dd');
            expect(dts.length).toBe(2);
            expect(dds.length).toBe(6);

            expect(dds[0].title).toBe('erik168@163.com');
            expect(dds[1].title).toBe('errorrik@gmail.com');
            expect(dds[2].title).toBe('xxx@xxx.com');
            expect(dds[3].title).toBe('erik168@163.com');
            expect(dds[4].title).toBe('errorrik@gmail.com');
            expect(dds[5].title).toBe('xxx@xxx.com');


            myComponent2.data.push('emails', 'erik@erik.com');
            san.nextTick(() => {
                let dts = wrap.getElementsByTagName('dt');
                let dds = wrap.getElementsByTagName('dd');
                expect(dts.length).toBe(2);
                expect(dds.length).toBe(7);

                expect(dds[0].title).toBe('erik168@163.com');
                expect(dds[1].title).toBe('errorrik@gmail.com');
                expect(dds[2].title).toBe('xxx@xxx.com');
                expect(dds[3].title).toBe('erik168@163.com');
                expect(dds[4].title).toBe('errorrik@gmail.com');
                expect(dds[5].title).toBe('xxx@xxx.com');
                expect(dds[6].title).toBe('erik@erik.com');

                myComponent1.dispose();
                myComponent2.dispose();
                document.body.removeChild(wrap);
                done();
            });

        })
    });

    it('components data should not infulence each other, remove item', done => {
        store.addAction('for-connect-6', email => {
            let builder = updateBuilder().remove('persons[0].emails', email);
            return builder;
        });

        let MyComponent = san.defineComponent({
            template: '<dl><dt title="{{person.name}}">{{person.name}}</dt><dd san-for="email in person.emails" title="{{email}}">{{email}}</dd></dl>'
        });

        connect({
            person: 'persons[0]'
        })(MyComponent);

        store.dispatch('for-connect-persons', [
            {name: 'erik', emails: ['erik168@163.com', 'errorrik@gmail.com']}
        ]);

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);

        let myComponent1 = new MyComponent();
        myComponent1.attach(wrap);
        let myComponent2 = new MyComponent();
        myComponent2.attach(wrap);

        let dts = wrap.getElementsByTagName('dt');
        let dds = wrap.getElementsByTagName('dd');
        expect(dts.length).toBe(2);
        expect(dds.length).toBe(4);
        expect(dts[0].title).toBe('erik');
        expect(dts[1].title).toBe('erik');

        expect(dds[0].title).toBe('erik168@163.com');
        expect(dds[1].title).toBe('errorrik@gmail.com');
        expect(dds[2].title).toBe('erik168@163.com');
        expect(dds[3].title).toBe('errorrik@gmail.com');

        store.dispatch('for-connect-6', 'erik168@163.com');

        san.nextTick(() => {
            let dts = wrap.getElementsByTagName('dt');
            let dds = wrap.getElementsByTagName('dd');
            expect(dts.length).toBe(2);
            expect(dds.length).toBe(2);

            expect(dds[0].title).toBe('errorrik@gmail.com');
            expect(dds[1].title).toBe('errorrik@gmail.com');


            myComponent2.data.push('person.emails', 'erik@erik.com');
            san.nextTick(() => {
                let dts = wrap.getElementsByTagName('dt');
                let dds = wrap.getElementsByTagName('dd');
                expect(dts.length).toBe(2);
                expect(dds.length).toBe(3);


                expect(dds[0].title).toBe('errorrik@gmail.com');
                expect(dds[1].title).toBe('errorrik@gmail.com');
                expect(dds[2].title).toBe('erik@erik.com');

                myComponent1.dispose();
                myComponent2.dispose();
                document.body.removeChild(wrap);
                done();
            });

        })
    });

    store.addAction('for-connect-push-persons', (npersons, {getState}) => {
        let persons = getState('persons');
        let builder = updateBuilder().splice('persons', persons.length, npersons.length, ...npersons);
        return builder;
    });

    it('two actions should be able to update the same state', done => {
        store.addAction('for-connect-7', function (start, {getState}) {
            const persons = getState('persons');
            let ub = updateBuilder();

            for (let i = 0; i < persons.length; ++i) {
                ub = ub.set('persons[' + i + '].no', i + start);
            }
            return ub;
        });

        let MyComponent = san.defineComponent({
            template: '<dl><dd san-for="person in persons" title="{{person.name}}" index="{{person.no}}">{{person.no}}. {{person.name}}</dd></dl>'
        });

        connect({
            persons: 'persons'
        })(MyComponent);

        store.dispatch('for-connect-persons', [{
            name: 'erik',
            emails: ['erik168@163.com', 'errorrik@gmail.com']
        }]);

        store.dispatch('for-connect-push-persons', [{
            name: 'yanni4night',
            emails: ['yinyongcom666@163.com', 'yanni4night@gmail.com']
        }]);

        store.dispatch('for-connect-7', 3);

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);

        let myComponent = new MyComponent();
        myComponent.attach(wrap);

        let dds = wrap.getElementsByTagName('dd');
        expect(dds.length).toBe(2);
        expect(dds[0].getAttribute('index')).toBe('3');
        expect(dds[1].getAttribute('index')).toBe('4');

        store.dispatch('for-connect-push-persons', [{
            name: 'Kate',
            emails: []
        }, {
            name: 'Jim',
            emails: []
        }]);

        store.dispatch('for-connect-7', 3);
        san.nextTick(() => {
            let dds = wrap.getElementsByTagName('dd');
            expect(dds.length).toBe(4);
            expect(dds[2].getAttribute('index')).toBe('5');
            expect(dds[3].getAttribute('index')).toBe('6');

             myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });
    });
});
