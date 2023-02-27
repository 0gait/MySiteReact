"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStore = exports.Store = void 0;
var GlobalState_1 = require("./GlobalState");
var useGlobalState_1 = require("./useGlobalState");
var useGlobalStateReducer_1 = require("./useGlobalStateReducer");
var notImplementedErrorMsg = [
    "You must implement 'loadState' and 'saveState' to be able ",
    'to save state to your preffered storage. E.g \n',
    'store.persist({ \n',
    '    saveState: function(key, state, isInitialSet){/*logics to save state to storage*/}, \n',
    '    loadState: function(key, noState){/*logics to load state from storage*/} \n',
    '}) \n'
].join("");
var Empty = /** @class */ (function () {
    function Empty() {
    }
    return Empty;
}()); // Class for empty state/value
var EMPTY = new Empty();
var PersistentStorage = /** @class */ (function () {
    function PersistentStorage() {
        this.SHOULD_PERSIST_BY_DEFAULT = false;
    }
    PersistentStorage.prototype.loadState = function (key, noState) {
        throw TypeError(notImplementedErrorMsg);
    };
    PersistentStorage.prototype.saveState = function (key, state, isInitialSet) {
        throw TypeError(notImplementedErrorMsg);
    };
    return PersistentStorage;
}());
var Store = /** @class */ (function () {
    function Store() {
        this.states = new Map();
        this.subscribers = [];
        this.persistentStorage = new PersistentStorage();
    }
    Store.prototype.subscribe = function (observer) {
        var _this = this;
        if (this.subscribers.indexOf(observer) === -1) {
            // Subscribe a component to this store
            this.subscribers.push(observer);
        }
        var unsubscribe = function () {
            _this.subscribers = _this.subscribers.filter(function (subscriber) { return subscriber !== observer; });
        };
        return unsubscribe;
    };
    Store.prototype.onStoreUpdate = function (key, value) {
        this.subscribers.forEach(function (subscriber) {
            subscriber(key, value);
        });
    };
    Store.prototype.persist = function (config) {
        if (config.saveState) {
            this.persistentStorage.saveState = config.saveState;
        }
        if (config.loadState) {
            this.persistentStorage.loadState = config.loadState;
        }
        if (config.removeState) {
            this.persistentStorage.removeState = config.removeState;
        }
        if (config.clear) {
            this.persistentStorage.clear = config.clear;
        }
        if (config.PERSIST_ENTIRE_STORE) {
            this.persistentStorage.SHOULD_PERSIST_BY_DEFAULT = config.PERSIST_ENTIRE_STORE;
        }
    };
    Store.prototype.setState = function (key, initialValue, _a) {
        var _this = this;
        var _b = _a === void 0 ? {} : _a, persist = _b.persist;
        var shouldPersist = persist === undefined ?
            this.persistentStorage.SHOULD_PERSIST_BY_DEFAULT : persist;
        if (shouldPersist) {
            // Load state from localStorage
            var savedState = this.persistentStorage.loadState(key, EMPTY);
            if (savedState !== EMPTY) {
                // Use savedState as the initialValue
                initialValue = savedState;
            }
            else {
                // This is the initial set
                this.persistentStorage.saveState(key, initialValue, true);
            }
        }
        var onGlobalStateChange = function (newValue) {
            // Note key & persist variables depends on scope
            _this.onStoreUpdate(key, newValue);
            if (shouldPersist) {
                _this.persistentStorage.saveState(key, newValue, false);
            }
        };
        // Create global state
        var globalState = (0, GlobalState_1.createGlobalstate)(initialValue);
        var unsubscribe = globalState.subscribe({
            observer: onGlobalStateChange,
            selector: function (state) { return state; }
        });
        var state = {
            "state": globalState,
            "unsubscribe": unsubscribe,
            "persist": shouldPersist
        };
        // Add global state to the store
        this.states.set(key, state);
    };
    Store.prototype.getState = function (key, config) {
        if (config === void 0) { config = { default: EMPTY }; }
        var defaultValue = config.default;
        // Get key based global state
        if (!this.states.has(key)) { // Global state is not found
            if (defaultValue !== EMPTY) { // Default value is found
                // Create a global state and use defaultValue as the initial value
                this.setState(key, defaultValue, { persist: config.persist });
            }
            else {
                // Global state is not found and the default value is not specified
                var errorMsg = [
                    "There is no global state with the key '".concat(key, "', "),
                    "You are either trying to access a global ",
                    "state which was not created or it was deleted."
                ];
                throw Error(errorMsg.join(""));
            }
        }
        return this.states.get(key).state;
    };
    Store.prototype.clear = function (fn) {
        var _this = this;
        // Copy store
        var storeCopy = this.states;
        // Clear store
        this.states = new Map();
        if (this.persistentStorage.clear) {
            this.persistentStorage.clear();
        }
        if (fn) {
            // Run store re-initialization
            fn();
        }
        storeCopy.forEach(function (oldState, key) {
            // Unsubscribe from an old state 
            oldState.unsubscribe();
            // Notify subscribers to a store that a global state has been removed
            if (_this.states.has(key)) {
                var newGlobalState = _this.getState(key);
                _this.onStoreUpdate(key, newGlobalState.getValue());
            }
            // Rerender all components using this global state
            oldState.state.refresh();
        });
    };
    Store.prototype.remove = function (globalStatekey, fn) {
        var _this = this;
        var keys = [];
        if (typeof globalStatekey === 'string') {
            keys = [globalStatekey];
        }
        else {
            keys = globalStatekey;
        }
        var globalStatesToRemove = new Map();
        keys.forEach(function (key) {
            // Copy global state to remove from a store
            globalStatesToRemove.set(key, _this.states.get(key));
            // Remove global state from a store
            _this.states.delete(key);
            if (globalStatesToRemove.get(key).persist && // Is state persisted
                _this.persistentStorage.removeState && // Is removeState Implemented
                _this.persistentStorage.loadState(key, EMPTY) !== EMPTY // Is state to remove available
            ) {
                _this.persistentStorage.removeState(key);
            }
        });
        if (fn) {
            // Run global state re-initialization
            fn();
        }
        globalStatesToRemove.forEach(function (oldState, key) {
            // Unsubscribe from an old state 
            oldState.unsubscribe();
            // Notify subscribers to a store that a global state has been removed
            if (_this.states.has(key)) {
                var newGlobalState = _this.getState(key);
                _this.onStoreUpdate(key, newGlobalState.getValue());
            }
            // Rerender all components depending on this global state
            oldState.state.refresh();
        });
    };
    Store.prototype.useState = function (key, config) {
        if (config === void 0) { config = {}; }
        var globalState = this.getState(key, config);
        return (0, useGlobalState_1.useGlobalState)(globalState, config);
    };
    Store.prototype.useReducer = function (reducer, key, config) {
        if (config === void 0) { config = {}; }
        var globalState = this.getState(key, config);
        return (0, useGlobalStateReducer_1.useGlobalStateReducer)(reducer, globalState, config);
    };
    return Store;
}());
exports.Store = Store;
function createStore() {
    // Create a store for key based global state
    return new Store();
}
exports.createStore = createStore;
