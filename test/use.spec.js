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

            let update = useAction('for-use-1');
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


    
});