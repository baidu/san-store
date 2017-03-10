import connect from '../src/connect/san';
import {store} from '../src/main'
import san from 'san';
import {updateBuilder} from 'san-update';

describe('Connect san component', () => {
    store.addAction('reset-for-connect', () => {
        let resetBuilder = updateBuilder()
            .set('name', 'errorrik')
            .set('emails', ['errorrik@gmail.com']);

        return updateBuilder;
    });

    beforeEach(() => {
        store.dispatch('reset-for-connect');
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
            let resetBuilder = updateBuilder()
                .set('name', payload.name)
                .set('emails[0]', payload.email);

            return updateBuilder;
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
            let resetBuilder = updateBuilder()
                .set('name', payload.name)
                .set('emails[0]', payload.email);

            return updateBuilder;
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
            let resetBuilder = updateBuilder()
                .set('name', payload.name)
                .set('emails[0]', payload.email);

            return updateBuilder;
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
            let resetBuilder = updateBuilder()
                .set('name', payload.name)
                .set('emails[0]', payload.email);

            return updateBuilder;
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

        myComponent.actions.['for-connect-4']({
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
});
