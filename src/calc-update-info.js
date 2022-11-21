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
 * @param {Array} diff 数据变更的diff信息
 * @return {boolean}
 */
export default function calcUpdateInfo(info, diff) {
    if (info.stateName) {
        let stateNameLen = info.stateName.length;

        for (let i = 0, diffLen = diff.length; i < diffLen; i++) {
            let diffInfo = diff[i];
            let target = diffInfo.target;
            let matchThisDiff = true;
            let j = 0;
            let targetLen = target.length;

            for (; j < targetLen && j < stateNameLen; j++) {
                if (info.stateName[j] !== target[j]) {
                    matchThisDiff = false;
                    break;
                }
            }

            if (matchThisDiff) {
                let updateInfo = {
                    componentData: info.dataName,
                    storeData: info.stateName
                };

                if (targetLen > stateNameLen) {
                    updateInfo.storeData = target;
                    updateInfo.componentData += '.' + target.slice(stateNameLen).join('.');
                }

                if (targetLen >= stateNameLen && diffInfo.splice) {
                    updateInfo.spliceArgs = [
                        diffInfo.splice.index,
                        diffInfo.splice.deleteCount
                    ];

                    if (diffInfo.splice.insertions instanceof Array) {
                        updateInfo.spliceArgs.push.apply(
                            updateInfo.spliceArgs,
                            diffInfo.splice.insertions
                        );
                    }
                }

                return updateInfo;
            }
        }
    }
}
