/**
 * san-store
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file 判断state是否需要更新
 * @author errorrik
 */

/**
 * 判断 state 是否需要更新
 *
 * @param {Object} component san 组件实例
 * @param {Store} store store 实例
 * @param {Object} info state的connect信息对象
 * @param {string} info.dataName 组件数据的名称
 * @param {Array} info.stateName store内 state的名称。调用方传递用点分隔的字符串，此处为分隔好的数组
 * @param {Object} diffIndex 数据变更的diff索引
 */
export default function updateComponentConnectedData(component, store, info, diffIndex) {
    let stateName = info.stateName;

    if (!stateName) {
        return;
    }

    let stateNameLen = stateName.length;

    let indexItem = diffIndex;
    let stateI = 0;

    while (stateI < stateNameLen) {
        let stateNameItem = stateName[stateI];

        if (indexItem[stateNameItem]) {
            stateI++;
            indexItem = indexItem[stateNameItem];
        }
        else {
            indexItem = null;
            break;
        }
    }

    if (stateI === 0 || !indexItem) {
        return;
    }

    let diffs = indexItem.__diffs__;
    if (!diffs) {
        return;
    }

    for (let i = 0; i < diffs.length; i++) {
        let diff = diffs[i];
        let target = diff.target;

        let componentData = info.dataName;
        let storeData = info.stateName;
        if (target.length > stateNameLen) {
            componentData += '.' + target.slice(stateNameLen).join('.');
            storeData = target;
        }

        if (target.length >= stateNameLen && diff.splice) {
            component.data.splice(
                componentData,
                diff.splice.insertions instanceof Array
                    ? [
                        diff.splice.index,
                        diff.splice.deleteCount,
                        ...diff.splice.insertions
                    ]
                    : [
                        diff.splice.index,
                        diff.splice.deleteCount
                    ]
            );
        }
        else {
            component.data.set(componentData, store.getState(storeData));
        }
    }
}

