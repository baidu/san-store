import {update, splice} from 'san-update';

let source = {
    name: {
        firstName: 'Navy',
        lastName: 'Wong'
    },
    list: [1,2,3]
};
let target = splice(source, 'list', 0, 1);


console.log(target);
