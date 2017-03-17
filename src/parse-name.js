/**
 * san-store
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file 解析数据属性名
 * @author errorrik
 */


/**
 * 解析数据属性名，返回数组形式的 terms
 *
 * @param {string} source 数据属性的字符串形式
 * @return {Array}
 */
export default function parseName(source) {
    if (source instanceof Array) {
        return source;
    }

    if (typeof source !== 'string') {
        return [];
    }

    // 这个简易的非状态机的实现是有缺陷的
    // 比如 a['dd.cc'].b 这种就有问题了，不过我们不考虑这种场景
    let terms = source.split('.');
    let result = [];

    for (let i = 0, l = terms.length; i < l; i++) {
        let term = terms[i];
        let propAccessorStart = term.indexOf('[');


        if (propAccessorStart >= 0) {
            if (propAccessorStart > 0) {
                result.push(term.slice(0, propAccessorStart));
                term = term.slice(propAccessorStart);
            }

            while (term.charCodeAt(0) === 91) {
                let propAccessorEnd = term.indexOf(']');
                if (propAccessorEnd < 0) {
                    throw new Error('name syntax error: ' + source);
                }

                let propAccessorLiteral = term.slice(1, propAccessorEnd);
                if (/^[0-9]+$/.test(propAccessorLiteral)) {
                    // for number
                    result.push(+propAccessorLiteral);
                }
                else if (/^(['"])([^\1]+)\1$/.test(propAccessorLiteral)) {
                    // for string literal
                    result.push((new Function('return ' + propAccessorLiteral))());
                }

                term = term.slice(propAccessorEnd + 1);
            }
        }
        else {
            result.push(term);
        }
    }


    return result;
}
