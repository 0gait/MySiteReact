"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types = {
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object Object]': 'object',
    '[object String]': 'string',
    '[object Null]': 'null',
};
var type = function (object) {
    var typeOfObject = Object.prototype.toString.call(object);
    return typeof object === 'object'
        ? types[typeOfObject] || 'object' : typeof object;
};
var isObject = function (object) {
    return type(object) === 'object';
};
var arraysEqualByValue = function (array1, array2, depth) {
    if (array1.length !== array2.length) {
        return false;
    }
    for (var i = 0; i < array1.length; i++) {
        if (!exports.equalByValue(array1[i], array2[i], depth + 1)) {
            return false;
        }
    }
    return true;
};
var objectsEqualByValue = function (object1, object2, depth, strict) {
    for (var propertyName in object1) {
        if (Object.prototype.hasOwnProperty.call(object1, propertyName)
            && !exports.equalByValue(object1[propertyName], object2[propertyName], depth + 1, strict)) {
            return false;
        }
    }
    for (var propertyName in object2) {
        if (!(propertyName in object1)) {
            return false;
        }
    }
    return true;
};
exports.toComparable = function (value, caseSensitive) {
    if (value instanceof Date) {
        return value.getTime();
    }
    // if(value && value instanceof Class && value.valueOf) {
    //        return value.valueOf();
    // }
    if (!caseSensitive && typeof value === 'string') {
        return value.toLowerCase();
    }
    return value;
};
var maxEqualityDepth = 15;
exports.equalByValue = function (object1, object2, depth, strict) {
    if (depth === void 0) { depth = 0; }
    if (strict === void 0) { strict = true; }
    object1 = exports.toComparable(object1, true);
    object2 = exports.toComparable(object2, true);
    // eslint-disable-next-line eqeqeq
    var comparisonResult = strict ? object1 === object2 : object1 == object2;
    if (comparisonResult || depth >= maxEqualityDepth) {
        return true;
    }
    if (isObject(object1) && isObject(object2)) {
        return objectsEqualByValue(object1, object2, depth, strict);
    }
    if (Array.isArray(object1) && Array.isArray(object2)) {
        return arraysEqualByValue(object1, object2, depth);
    }
    return false;
};
