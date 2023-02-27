"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGlobalState = void 0;
var useGlobalStateReducer_1 = require("./useGlobalStateReducer");
function useGlobalState(globalState, config) {
    if (config === void 0) { config = {}; }
    function reducer(currentState, newState) {
        return newState;
    }
    var _a = (0, useGlobalStateReducer_1.useGlobalStateReducer)(reducer, globalState, config), state = _a[0], setState = _a[1];
    function updateState(updater) {
        globalState.updateValue(updater, config);
    }
    return [state, setState, updateState];
}
exports.useGlobalState = useGlobalState;
