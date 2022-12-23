import {Store, store, connect} from 'san-store';
import san from 'san';
import {updateBuilder} from 'san-update';

function _typeof(obj) {
    "@babel/helpers - typeof";
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function _typeof(obj) {
            return typeof obj;
        };
    } else {
        _typeof = function _typeof(obj) {
            return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol": typeof obj;
        };
    }
    return _typeof(obj);
}

function _get(target, property, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.get) {
        _get = Reflect.get;
    } else {
        _get = function _get(target, property, receiver) {
            var base = _superPropBase(target, property);
            if (!base) return;
            var desc = Object.getOwnPropertyDescriptor(base, property);
            if (desc.get) {
                return desc.get.call(receiver);
            }
            return desc.value;
        };
    }
    return _get(target, property, receiver || target);
}

function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
        object = _getPrototypeOf(object);
        if (object === null) break;
    }
    return object;
}

function _createSuper(Derived) {
    return function() {
        var Super = _getPrototypeOf(Derived),
        result;
        if (_isNativeReflectConstruct()) {
            var NewTarget = _getPrototypeOf(this).constructor;
            result = Reflect.construct(Super, arguments, NewTarget);
        } else {
            result = Super.apply(this, arguments);
        }
        return _possibleConstructorReturn(this, result);
    };
}

function _possibleConstructorReturn(self, call) {
    if (call && (_typeof(call) === "object" || typeof call === "function")) {
        return call;
    }
    return _assertThisInitialized(self);
}

function _assertThisInitialized(self) {
    if (self === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
}

function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;
    try {
        Date.prototype.toString.call(Reflect.construct(Date, [],
        function() {}));
        return true;
    } catch(e) {
        return false;
    }
}

function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf: function _getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            writable: true,
            configurable: true
        }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf ||
    function _setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
    };
    return _setPrototypeOf(o, p);
}

function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !! right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}

function _classCallCheck(instance, Constructor) {
    if (!_instanceof(instance, Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}

function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}

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

    it('which has aPack prop', () => {
        let MyComponent = connect({
            name: 'name',
            email: 'emails[0]'
        })(
            san.defineComponent({
                aPack: [1, "u", 5, 2, "title", 9, , 3, 7, , 6, 1, 3, "name", , 3, "-", 7, , 6, 1, 3, "email", , 2, "class", 7, , 6, 1, 3, "class", 1, 8, 6, 1, 3, "_class", , 2, "style", 7, , 6, 1, 3, "style", 1, 8, 6, 1, 3, "_style", , 2, "id", 6, 1, 3, "id", , 9, , 3, 7, , 6, 1, 3, "name", , 3, "-", 7, , 6, 1, 3, "email",]
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

    it('which has aPack static prop', () => {
        let MyCmpt = san.defineComponent({});
        MyCmpt.aPack = [1, "u", 5, 2, "title", 9, , 3, 7, , 6, 1, 3, "name", , 3, "-", 7, , 6, 1, 3, "email", , 2, "class", 7, , 6, 1, 3, "class", 1, 8, 6, 1, 3, "_class", , 2, "style", 7, , 6, 1, 3, "style", 1, 8, 6, 1, 3, "_style", , 2, "id", 6, 1, 3, "id", , 9, , 3, 7, , 6, 1, 3, "name", , 3, "-", 7, , 6, 1, 3, "email",]

        let MyComponent = connect({
            name: 'name',
            email: 'emails[0]'
        })(MyCmpt);


        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let u = wrap.getElementsByTagName('u')[0];
        expect(u.title).toBe('errorrik-errorrik@gmail.com');

        myComponent.dispose();
        document.body.removeChild(wrap);
    });

    it('data should be ready when component init, component declare as class', () => {
        class RawComponent extends san.Component {

        }
        RawComponent.template =  '<u title="{{name}}-{{email}}">{{name}}-{{email}}</u>';

        let MyComponent = connect({
            name: 'name',
            email: 'emails[0]'
        })(
            RawComponent
        );


        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let u = wrap.getElementsByTagName('u')[0];
        expect(myComponent.data.get('name')).toBe('errorrik');
        expect(u.title).toBe('errorrik-errorrik@gmail.com');

        myComponent.dispose();
        document.body.removeChild(wrap);
    });

    it('data should be ready when component init, component declare as class and trans by babel', () => {

        var RawComponent = /*#__PURE__*/function (_san$Component) {
            _inherits(RawComponent, _san$Component);

            var _super = _createSuper(RawComponent);

            function RawComponent() {
                _classCallCheck(this, RawComponent);

                return _super.apply(this, arguments);
            }

            return RawComponent;
        }(san.Component);

        RawComponent.template =  '<u title="{{name}}-{{email}}">{{name}}-{{email}}</u>';

        let MyComponent = connect({
            name: 'name',
            email: 'emails[0]'
        })(
            RawComponent
        );


        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let u = wrap.getElementsByTagName('u')[0];
        expect(myComponent.data.get('name')).toBe('errorrik');
        expect(u.title).toBe('errorrik-errorrik@gmail.com');

        myComponent.dispose();
        document.body.removeChild(wrap);
    });

    it('data should be ready when component init, component declare as class and trans by babel, extends more than once', () => {

        var BaseComponent = /*#__PURE__*/function (_san$Component) {
            _inherits(BaseComponent, _san$Component);

            var _super = _createSuper(BaseComponent);

            function BaseComponent() {
              _classCallCheck(this, BaseComponent);

              return _super.apply(this, arguments);
            }

            return BaseComponent;
          }(san.Component);

          var RawComponent = /*#__PURE__*/function (_BaseComponent) {
            _inherits(RawComponent, _BaseComponent);

            var _super2 = _createSuper(RawComponent);

            function RawComponent() {
              _classCallCheck(this, RawComponent);

              return _super2.apply(this, arguments);
            }

            return RawComponent;
          }(BaseComponent);

        RawComponent.template =  '<u title="{{name}}-{{email}}">{{name}}-{{email}}</u>';

        let MyComponent = connect({
            name: 'name',
            email: 'emails[0]'
        })(
            RawComponent
        );


        let myComponent = new MyComponent();
        let wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        let u = wrap.getElementsByTagName('u')[0];
        expect(myComponent.data.get('name')).toBe('errorrik');
        expect(u.title).toBe('errorrik-errorrik@gmail.com');

        myComponent.dispose();
        document.body.removeChild(wrap);
    });

    it('static prop should not be lost', () => {
        let RawComponent = san.defineComponent({
        });
        RawComponent.template =  '<u title="{{name}}-{{email}}">{{name}}-{{email}}</u>';

        let MyComponent = connect({
            name: 'name',
            email: 'emails[0]'
        })(
            RawComponent
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

    it('component data should be update when store data change, function mapStates item', done => {
        store.addAction('for-connect-module-2', payload => {
            let builder = updateBuilder()
                .set('name', payload.name)
                .set('emails[0]', payload.email);

            return builder;
        });

        let MyComponent = connect({
            name: 'name',
            email: state => {
                return state.emails[0];
            }
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

        store.dispatch('for-connect-module-2', {
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

    it('dispatch action method should connect to component "actions" member, object mapActions', done => {
        store.addAction('for-connect-module-3', payload => {
            let builder = updateBuilder()
                .set('name', payload.name)
                .set('emails[0]', payload.email);

            return builder;
        });

        let MyComponent = connect(
            {
                name: 'name',
                email: 'emails[0]'
            },
            {
                updateInfo: 'for-connect-module-3'
            }
        )(
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
        });
    });

    it('dispatch action method should connect to component "actions" member, array mapActions', done => {
        store.addAction('for-connect-module-4', payload => {
            let builder = updateBuilder()
                .set('name', payload.name)
                .set('emails[0]', payload.email);

            return builder;
        });

        let MyComponent = connect(
            {
                name: 'name',
                email: 'emails[0]'
            },
            [
                'for-connect-module-4'
            ]
        )(
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

        myComponent.actions['for-connect-module-4']({
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

    store.addAction('for-connect-module-persons', persons => {
        let builder = updateBuilder().set('persons', persons);
        return builder;
    });

    it('components data should not infulence each other, and push item', done => {
        store.addAction('for-connect-module-5', email => {
            let builder = updateBuilder().push('persons[0].emails', email);
            return builder;
        });

        let MyComponent = connect({
            name: 'persons[0].name',
            emails: 'persons[0].emails'
        })(
            san.defineComponent({
                template: '<dl><dt title="{{name}}">{{name}}</dt><dd san-for="email in emails" title="{{email}}">{{email}}</dd></dl>'
            })
        );

        store.dispatch('for-connect-module-persons', [
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

        store.dispatch('for-connect-module-5', 'xxx@xxx.com');

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

        });
    });

    it('components data should not infulence each other, remove item', done => {
        store.addAction('for-connect-module-6', email => {
            let builder = updateBuilder().remove('persons[0].emails', email);
            return builder;
        });

        let MyComponent = connect({
            person: 'persons[0]'
        })(
            san.defineComponent({
                template: '<dl><dt title="{{person.name}}">{{person.name}}</dt><dd san-for="email in person.emails" title="{{email}}">{{email}}</dd></dl>'
            })
        );

        store.dispatch('for-connect-module-persons', [
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

        store.dispatch('for-connect-module-6', 'erik168@163.com');

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

        });
    });

    it('async action should return Promise', done => {
        store.addAction('for-connect-module-7', (name, {dispatch}) => {
            return new Promise(function (resolve) {
                setTimeout(() => {
                    dispatch('for-connect-module-8', name);
                    resolve();
                }, 100);
            });
        });

        store.addAction('for-connect-module-8', name => {
            return updateBuilder().set('forConnectModule7', name);
        });

        let MyComponent = connect(
            {name: 'forConnectModule7'},
            {change: 'for-connect-module-7'}
        )(
            san.defineComponent({
                template: '<a>{{name}}</a>'
            })
        );

        let wrap = document.createElement('div');
        document.body.appendChild(wrap);

        let myComponent = new MyComponent();
        myComponent.attach(wrap);
        expect(myComponent.data.get('name')).toBeUndefined();

        myComponent.actions.change('asyncchange').then(() => {
            expect(myComponent.data.get('name')).toBe('asyncchange');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });
    });

    it('connected component should be independent', done => {
        store.addAction('for-connect-module-9', payload => {
            let builder = updateBuilder()
                .set('name', payload.name)
                .set('emails[0]', payload.email);

            return builder;
        });

        let RawComponent = san.defineComponent({
            template: '<u title="{{name}}-{{email}}">{{name}}-{{email}}</u>',

            initData() {
                return {
                    name: 'efe',
                    email: 'ecomfe@gmail.com'
                }
            }
        });

        let MyComponent = connect({
            name: 'name',
            email: 'emails[0]'
        })(RawComponent);

        expect(MyComponent === RawComponent).toBeFalsy();


        let wrap = document.createElement('div');
        document.body.appendChild(wrap);

        let myComponent = new RawComponent();
        myComponent.attach(wrap);

        let myComponent2 = new MyComponent();
        myComponent2.attach(wrap);

        expect(myComponent.el.title).toBe('efe-ecomfe@gmail.com');
        expect(myComponent2.el.title).toBe('errorrik-errorrik@gmail.com');

        store.dispatch('for-connect-module-9', {
            name: 'erik',
            email: 'erik@gmail.com'
        });

        myComponent.data.set('name', 'err');
        myComponent.data.set('email', 'errorrik@gmail.com');

        san.nextTick(() => {
            expect(myComponent.el.title).toBe('err-errorrik@gmail.com');
            expect(myComponent2.el.title).toBe('erik-erik@gmail.com');

            myComponent.dispose();
            myComponent2.dispose();
            document.body.removeChild(wrap);
            done();
        });
    });

    it('connected component should be independent', done => {
        store.addAction('for-connect-module-10', payload => {
            let builder = updateBuilder()
                .set('name', payload.name)
                .set('emails[0]', payload.email);

            return builder;
        });

        let RawComponent = san.defineComponent({
            template: '<u title="{{name}}-{{email}}">{{name}}-{{email}}</u>',

            initData() {
                return {
                    name: 'efe',
                    email: 'ecomfe@gmail.com'
                }
            }
        });

        let MyComponent = connect({
            name: states => states.name,
            email: states => states.emails[0]
        })(RawComponent);

        expect(MyComponent === RawComponent).toBeFalsy();


        let wrap = document.createElement('div');
        document.body.appendChild(wrap);

        let myComponent = new MyComponent();
        myComponent.attach(wrap);

        expect(myComponent.el.title).toBe('errorrik-errorrik@gmail.com');

        store.dispatch('for-connect-module-10', {
            name: 'erik',
            email: 'erik@gmail.com'
        });

        san.nextTick(() => {
            expect(myComponent.el.title).toBe('erik-erik@gmail.com');

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
            }
        )(
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

        let MyComponent = connect(myStore, {name: 'name'})
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

        let MyComponent = connect(myStore, {name: 'name'})
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

        let MyComponent = connect(myStore, {name: 'name'}, ['updateName'])
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

        let MyComponent = connect(myStore, {name: 'name'}, {name:'updateName'})
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

    it('data from many stores, one store update by other store', done => {
        let myStore0 = new Store({
            initData: {
                username: ''
            },

            actions: {
                userLogin(payload) {
                    return updateBuilder()
                        .set('username', payload);
                }
            }
        });
        let myStore = new Store({
            initData: {
                name: 'erik'
            },
            actions: {
                updateName(payload) {
                    myStore0.dispatch('userLogin', payload);
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

        let MyComponent = connect(myStore, {name: 'name'}, {name:'updateName'})
            .connect(myStore0, {username: 'username'})
            .connect(myStore2, {email: 'emails[0]'}, {email:'updateEmail'})(
                san.defineComponent({
                    template: `<div>
                        <i title="{{username}}">current user: {{username}}</i>
                        <u title="{{name}}-{{email}}">{{name}}-{{email}}</u>
                    </div>`
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

        san.nextTick(() => {
            let u = wrap.getElementsByTagName('u')[0];
            expect(u.title).toBe('errorrik-erik@gmail.com');

            let i = wrap.getElementsByTagName('i')[0];
            expect(i.title).toBe('errorrik');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        });
    });
});
