import { Component } from 'inferno';
import { createRecorder, renderChild } from './recorder';
import { EffectsHost } from './effects_host';
export class HookContainer extends Component {
    constructor() {
        super(...arguments);
        // eslint-disable-next-line react/state-in-constructor
        this.state = {};
    }
    componentWillMount() {
        EffectsHost.increment();
    }
    componentDidMount() {
        if (this.recorder) {
            this.recorder.componentDidMount();
        }
        EffectsHost.decrement();
    }
    shouldComponentUpdate(nextProps, nextState, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context) {
        if (!this.recorder) {
            return true;
        }
        const result = this.recorder.shouldComponentUpdate(nextProps, nextState, context);
        if (result) {
            EffectsHost.increment();
        }
        return result;
    }
    componentDidUpdate() {
        if (this.recorder) {
            this.recorder.componentDidUpdate();
        }
        EffectsHost.decrement();
    }
    componentWillUnmount() {
        this.dispose();
    }
    getHook(dependencies, fn) {
        if (!this.recorder) {
            this.recorder = createRecorder(this);
        }
        return this.recorder.getHook(dependencies, fn);
    }
    getContextValue(consumer) {
        return this.context[consumer.id];
    }
    dispose() {
        if (this.recorder) {
            this.recorder.dispose();
        }
        this.state = {};
        this.recorder = undefined;
    }
    render() {
        return this.recorder
            ? this.recorder.renderResult
            : renderChild(this, this.props, this.context);
    }
}
