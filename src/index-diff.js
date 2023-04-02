/**
 * san-store
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file 为 flatten 的 diff 数组生成简单索引
 */


/**
 * 为 flatten 的 diff 数组生成简单索引
 *
 * @param {Array} diff diff 对象
 * @return {Object}
 */
export default function indexDiff(diff) {
    let index = {};
    for (let i = 0, l = diff.length; i < l; i++) {
        let diffItem = diff[i];
        let target = diffItem.target;

        let indexObj = index;
        let stack = [];
        for (let j = 0; j < target.length; j++) {
            let targetItem = target[j];
            let currIndexObj = indexObj[targetItem];

            if (!currIndexObj) {
                currIndexObj = {
                    __diffs__: []
                };
                indexObj[targetItem] = currIndexObj;
                for (let k = 0; k < j; k++) {
                    let offsprings = stack[k].__offsprings__;
                    if (!offsprings) {
                        offsprings = stack[k].__offsprings__ = [];
                    }
                    offsprings.push(currIndexObj);
                }
            }

            indexObj = currIndexObj;
            stack[j] = currIndexObj;
        }
    }
    
    for (let i = 0, l = diff.length; i < l; i++) {
        let diffItem = diff[i];
        let target = diffItem.target;

        let indexObj = index;
        for (let j = 0; j < target.length; j++) {
            indexObj = indexObj[target[j]];
            indexObj.__diffs__.push(diffItem);
        }

        let offsprings = indexObj.__offsprings__;
        if (offsprings) {
            for (let j = 0; j < offsprings.length; j++) {
                let offspring = offsprings[j];
                offspring.__diffs__.push(diffItem);
            }
        }
    }

    return index;
}