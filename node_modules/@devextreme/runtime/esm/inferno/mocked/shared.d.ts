export declare const ERROR_MSG = "a runtime error occured! Use Inferno in development environment to find the error.";
export declare function isNullOrUndef(o: any): o is undefined | null;
export declare function isInvalid(o: any): o is null | boolean | undefined;
export declare function isFunction(o: any): o is Function;
export declare function isNull(o: any): o is null;
export declare function throwError(message?: string): void;
