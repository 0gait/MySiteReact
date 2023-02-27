"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGlobalStateReducer = void 0;
var react_1 = require("react");
function useGlobalStateReducer(reducer, globalState, config) {
    if (config === void 0) { config = {}; }
    var _a = (0, react_1.useState)(null), setState = _a[1];
    var isMounted = (0, react_1.useRef)(false);
    var currentState = globalState.getValue(config.selector);
    function reRender() {
        // re-render if the component is mounted
        if (isMounted.current) {
            setState({});
        }
    }
    function observer(newState) {
        if (currentState === newState) {
            // Do nothing because the selected state is up-to-date
        }
        else {
            reRender();
        }
    }
    var subscription = {
        observer: observer,
        selector: config.selector ?
            config.selector :
            function (state) { return state; },
        refresh: reRender
    };
    (0, react_1.useEffect)(function () {
        var unsubscribe = globalState.subscribe(subscription);
        isMounted.current = true;
        return function () {
            unsubscribe();
            isMounted.current = false;
        };
    }, [currentState, globalState]);
    function dispatch(action) {
        var newState = reducer(currentState, action);
        globalState.setValue(newState, config);
    }
    return [currentState, dispatch];
}
exports.useGlobalStateReducer = useGlobalStateReducer;
