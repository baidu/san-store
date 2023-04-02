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
 * @param {Object} info state的connect信息对象
 * @param {string} info.dataName 组件数据的名称
 * @param {Array} info.stateName store内 state的名称。调用方传递用点分隔的字符串，此处为分隔好的数组
 * @param {Object} diffIndex 数据变更的diff索引
 * @return {Array | undefined} 要更新的数据信息
 */
export default function calcUpdateInfo(info, diffIndex) {
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

    let updateInfos = [];
    for (let i = 0; i < diffs.length; i++) {
        let diff = diffs[i];
        let target = diff.target;

        let updateInfo;
        if (target.length > stateNameLen) {
            updateInfo = {
                componentData: info.dataName + '.' + target.slice(stateNameLen).join('.'),
                storeData: target
            };
        }
        else {
            updateInfo = {
                componentData: info.dataName,
                storeData: info.stateName
            };
        }

        if (target.length >= stateNameLen && diff.splice) {
            updateInfo.spliceArgs = diff.splice.insertions instanceof Array
                ? [
                    diff.splice.index,
                    diff.splice.deleteCount,
                    ...diff.splice.insertions
                ]
                : [
                    diff.splice.index,
                    diff.splice.deleteCount
                ];
        }

        updateInfos.push(updateInfo);
    }

    return updateInfos; 
}

