const types = {
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object Object]': 'object',
    '[object String]': 'string',
    '[object Null]': 'null',
};
const type = function (object) {
    const typeOfObject = Object.prototype.toString.call(object);
    return typeof object === 'object'
        ? types[typeOfObject] || 'object' : typeof object;
};
const isObject = function (object) {
    return type(object) === 'object';
};
const arraysEqualByValue = (array1, array2, depth) => {
    if (array1.length !== array2.length) {
        return false;
    }
    for (let i = 0; i < array1.length; i++) {
        if (!equalByValue(array1[i], array2[i], depth + 1)) {
            return false;
        }
    }
    return true;
};
const objectsEqualByValue = (object1, object2, depth, strict) => {
    for (const propertyName in object1) {
        if (Object.prototype.hasOwnProperty.call(object1, propertyName)
            && !equalByValue(object1[propertyName], object2[propertyName], depth + 1, strict)) {
            return false;
        }
    }
    for (const propertyName in object2) {
        if (!(propertyName in object1)) {
            return false;
        }
    }
    return true;
};
export const toComparable = (value, caseSensitive) => {
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
const maxEqualityDepth = 15;
export const equalByValue = function (object1, object2, depth = 0, strict = true) {
    object1 = toComparable(object1, true);
    object2 = toComparable(object2, true);
    // eslint-disable-next-line eqeqeq
    const comparisonResult = strict ? object1 === object2 : object1 == object2;
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
