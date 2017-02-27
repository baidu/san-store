import {isGetterAvailable} from './isGetterAvailable';

const NO_CACHE = {};

let memoize = get => {
    let cache = NO_CACHE;
    return () => {
        if (cache === NO_CACHE) {
            cache = get();
        }

        return cache;
    };
};

export default isGetterAvailable
    ? (o, key, get) => Object.defineProperty(o, key, {get: memoize(get)})
    : (o, key, get) => o[key] = get();
