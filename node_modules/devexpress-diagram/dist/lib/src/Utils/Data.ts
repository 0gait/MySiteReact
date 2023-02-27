import { DomUtils } from "@devexpress/utils/lib/utils/dom";
import { isDefined } from "@devexpress/utils/lib/utils/common";

function IsNumber(str): boolean {
    return !isNaN(parseFloat(str)) && isFinite(str);
}

export function SetAbsoluteX(element, x) {
    element.style.left = prepareClientPosForElement(x, element, true) + "px";
}
export function SetAbsoluteY(element, y) {
    element.style.top = prepareClientPosForElement(y, element, false) + "px";
}
function prepareClientPosForElement(pos, element, isX) {
    pos -= getPositionElementOffset(element, isX);
    return pos;
}
function getPositionElementOffset(element, isX) {
    const div = createElementMock(element);
    if(div.style.position === "static")
        div.style.position = "absolute";
    element.parentNode.appendChild(div);
    const realPos = isX ? DomUtils.getAbsolutePositionX(div) : DomUtils.getAbsolutePositionY(div);
    element.parentNode.removeChild(div);
    return Math.round(realPos);
}
function createElementMock(element) {
    const div = document.createElement("DIV");
    div.style.top = "0px";
    div.style.left = "0px";
    div.style.visibility = "hidden";
    div.style.position = DomUtils.getCurrentStyle(element).position;
    return div;
}

export class Data {
    static ArrayInsert(array, element, position) {
        if(0 <= position && position < array.length) {
            for(let i = array.length; i > position; i--)
                array[i] = array[i - 1];
            array[position] = element;
        }
        else
            array.push(element);
    }
    static ArrayRemove(array, element) {
        const index = Data.ArrayIndexOf(array, element);
        if(index > -1) Data.ArrayRemoveAt(array, index);
    }
    static ArrayRemoveAt(array, index) {
        if(index >= 0 && index < array.length) {
            for(let i = index; i < array.length - 1; i++)
                array[i] = array[i + 1];
            array.pop();
        }
    }
    static ArrayClear(array) {
        while(array.length > 0)
            array.pop();
    }
    static ArrayIndexOf(array, element, comparer?) {
        if(!comparer)
            for(let i = 0; i < array.length; i++) {
                if(array[i] === element)
                    return i;
            }
        else
            for(let i = 0; i < array.length; i++)
                if(comparer(array[i], element))
                    return i;


        return -1;
    }
    static ArrayContains(array, element) {
        return Data.ArrayIndexOf(array, element) >= 0;
    }
    static ArrayEqual(array1, array2) {
        const count1 = array1.length;
        const count2 = array2.length;
        if(count1 !== count2)
            return false;
        for(let i = 0; i < count1; i++)
            if(array1[i] !== array2[i])
                return false;
        return true;
    }
    static ArraySame(array1, array2) {
        if(array1.length !== array2.length)
            return false;
        return array1.every(function(elem) { return Data.ArrayContains(array2, elem); });
    }
    static ArrayGetIntegerEdgeValues(array) {
        const arrayToSort = Data.CollectionToArray(array);
        Data.ArrayIntegerAscendingSort(arrayToSort);
        return {
            start: arrayToSort[0],
            end: arrayToSort[arrayToSort.length - 1]
        };
    }
    static ArrayIntegerAscendingSort(array) {
        Data.ArrayIntegerSort(array, false);
    }
    static ArrayIntegerSort(array, desc) {
        array.sort(function(i1, i2) {
            let res = 0;
            if(i1 > i2)
                res = 1;
            else if(i1 < i2)
                res = -1;
            if(desc)
                res *= -1;
            return res;
        });
    }
    static CollectionsUnionToArray(firstCollection, secondCollection) {
        const result = [];
        const firstCollectionLength = firstCollection.length;
        const secondCollectionLength = secondCollection.length;
        for(let i = 0; i < firstCollectionLength + secondCollectionLength; i++)
            if(i < firstCollectionLength)
                result.push(firstCollection[i]);
            else
                result.push(secondCollection[i - firstCollectionLength]);

        return result;
    }
    static CollectionToArray(collection) {
        const array = [];
        for(let i = 0; i < collection.length; i++)
            array.push(collection[i]);
        return array;
    }
    static CreateHashTableFromArray(array) {
        const hash = [];
        for(let i = 0; i < array.length; i++)
            hash[array[i]] = 1;
        return hash;
    }
    static CreateIndexHashTableFromArray(array) {
        const hash = [];
        for(let i = 0; i < array.length; i++)
            hash[array[i]] = i;
        return hash;
    }
    static ArrayToHash(array, getKeyFunc, getValueFunc) {
        if(!(array instanceof Array))
            return {};
        return array.reduce(function(map, element, index) {
            const key = getKeyFunc(element, index);
            const value = getValueFunc(element, index);
            map[key] = value;
            return map;
        }, {});
    }
    static Sum(array, getValueFunc) {
        if(!(array instanceof Array))
            return 0;
        return array.reduce(function(prevValue, item) {
            let value = getValueFunc ? getValueFunc(item) : item;
            if(!IsNumber(value))
                value = 0;
            return prevValue + value;
        }, 0);
    }
    static Min(array, getValueFunc) { return Data.CalculateArrayMinMax(array, getValueFunc, false); }
    static Max(array, getValueFunc) { return Data.CalculateArrayMinMax(array, getValueFunc, true); }


    static NearestLeftBinarySearchComparer(array, index, value) {
        const arrayElement = array[index];

        const leftPoint = arrayElement < value;
        const lastLeftPoint = leftPoint && index === array.length - 1;
        const nearestLeftPoint = lastLeftPoint || (leftPoint && array[index + 1] >= value);
        if(nearestLeftPoint)
            return 0;
        else
            return arrayElement < value ? -1 : 1;
    }
    static ArrayBinarySearch(array, value, binarySearchComparer, startIndex, length) {
        if(!binarySearchComparer)
            binarySearchComparer = Data.defaultBinarySearchComparer;
        if(!isDefined(startIndex))
            startIndex = 0;
        if(!isDefined(length))
            length = array.length - startIndex;
        let endIndex = (startIndex + length) - 1;
        while(startIndex <= endIndex) {
            const middle = (startIndex + ((endIndex - startIndex) >> 1));
            const compareResult = binarySearchComparer(array, middle, value);
            if(compareResult === 0)
                return middle;
            if(compareResult < 0)
                startIndex = middle + 1;
            else
                endIndex = middle - 1;
        }
        return -(startIndex + 1);
    }
    static ArrayFlatten(arrayOfArrays: any[]) {
        let result = [];
        arrayOfArrays.forEach(arr => {
            result = result.concat(arr);
        });
        return result;
    }
    static GetDistinctArray(array) {
        const resultArray = [];
        for(let i = 0; i < array.length; i++) {
            const currentEntry = array[i];
            if(Data.ArrayIndexOf(resultArray, currentEntry) === -1)
                resultArray.push(currentEntry);

        }

        return resultArray;
    }
    static ForEach(arr, callback) {
        if(Array.prototype.forEach)
            Array.prototype.forEach.call(arr, callback);
        else
            for(let i = 0, len = arr.length; i < len; i++)
                callback(arr[i], i, arr);


    }
    static MergeHashTables(target, object) {
        if(!object || typeof (object) === "string")
            return target;

        if(!target)
            target = {};
        for(const key in object)
            if(key && !(key in target))
                target[key] = object[key];
        return target;
    }
    static Range(count, start) {
        count = parseInt(count) || 0;
        start = parseInt(start) || 0;
        if(count < 0) count = 0;
        if(start < 0) start = 0;
        const result = Array(count);
        return result.map(function(_val, i) { return start + i; });
    }
    private static CalculateArrayMinMax(array, getValueFunc, isMax) {
        if(!(array instanceof Array))
            return 0;
        const startValue = isMax ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
        return array.reduce(function(prevValue, item) {
            let value = getValueFunc ? getValueFunc(item) : item;
            if(!IsNumber(value))
                value = startValue;
            const func = isMax ? Math.max : Math.min;
            return func(value, prevValue);
        }, startValue);
    }

    static byRange(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max);
    }

    private static defaultBinarySearchComparer(array, index, value) {
        const arrayElement = array[index];
        if(arrayElement === value)
            return 0;
        else
            return arrayElement < value ? -1 : 1;
    }

    static cssTextToObject(cssText: string): any {
        if(!cssText) return {};
        cssText = cssText.replace(/\/\*(.|\s)*?\*\//g, "").replace(/\s+/g, " ");
        return cssText.split(";").reduce((acc, val) => {
            if(val) {
                const matches = /\s*([^:]+?)\s*:\s*([^;]*)\s*$/.exec(val);
                if(matches) {
                    const [, name, value] = matches;
                    name && value && (acc[name.trim()] = value.trim());
                }
                return acc;
            }
            return acc;
        }, {});
    }

    static objectToCssText(obj: any): string {
        if(!obj) return "";
        return Object.keys(obj).reduce((acc, key) => {
            const name = key.trim();
            const value = obj[key];
            if(name && value)
                acc.push(name + ": " + value.toString().trim());
            return acc;
        }, []).join("; ");
    }
}
