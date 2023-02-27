import { SFC, ForwardRef as infernoForwardRefType } from 'inferno';
import type { RefObject } from './container';
export declare function forwardRef<T = Record<string, unknown>, P = Record<string, unknown>>(render: (props: T, ref: RefObject<P>) => InfernoElement<T>): SFC<T> & infernoForwardRefType;
