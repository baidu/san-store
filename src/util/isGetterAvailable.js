let result = false;

if (Object.defineProperty) {
    let o = {};
    let get = () => result = true;
    Object.defineProperty(o, 'x', {get});
    o.x;
}

export default result;
