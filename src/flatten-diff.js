/**
 * san-store
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file 把 san-update 给予的 diff 对象扁平化成数组
 * @author errorrik
 */


/**
 * 把 san-update 给予的 diff 对象扁平化成数组
 *
 * @param {Object} diff diff 对象
 * @return {Array}
 */
export default function flattenDiff(diff) {
    let flatDiff = [];
    let pos = [];

    function readDiffObject(source) {
        if (source.$change) {
            source.target = pos.slice(0);
            flatDiff.push(source);
            return;
        }

        for (let key in source) {
            if (source.hasOwnProperty(key)) {
                pos.push(key);
                readDiffObject(source[key]);
                pos.pop();
            }
        }
    }

    readDiffObject(diff);
    return flatDiff;
}
