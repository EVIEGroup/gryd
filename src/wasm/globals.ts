// @ts-nocheck
export const globalWASM = `
@external("console", "log")
@global()
declare function log(description: string, value: string): void;

@external("process", "address")
@global()
declare function address(): string;

@external("process", "random")
@global()
declare function random(): string;

@external("process", "value")
@global()
declare function numberValue(): i32;

@external("process", "contractAddress")
@global()
declare function contractAddress(): string;

@external("process", "updateState")
@global()
declare function updateState(key: string, value: string): string;

@external("process", "getState")
@global()
declare function getState(key: string): string;

@global()
namespace Test {
    export function stringify<T = Nullable | null>(data: T): string {
        if(isString(data)) {
            // log("TEST", <string>data);
            return <string>data;
        }
    }
}
`