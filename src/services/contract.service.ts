import { HttpService } from "./http.service";
import { NodeVM, VMScript } from "vm2";
import ts from "typescript";
import crypto from 'crypto';
import { Crypto } from "../helpers/crypto";

export class ContractService {
    vm: NodeVM;
    hashes = new Map();
    state: any = {};

    constructor() {
        this.vm = new NodeVM({ 
            sandbox: { 
                updateState: (key: string, value: any) => this.updateState(key, value), 
                getState: (key: string) => this.getState(key), 
                process: { title: 'Decentranet' }, 
                eval: null 
            },
            eval: false, 
            wasm: false,
            require: {
                external: false,
                builtin: ['http-service'],
                context: 'sandbox',
                mock: {
                    'http-service': { HttpService },
                    'crypto': { Crypto }
                }
            }
        });
    }

    updateState(key: string, value: any) {
        this.state[key] = value;
    }

    getState(key: string) {
        return this.state[key];
    }

    compile(script: string) {
        const res = ts.transpileModule(script, { reportDiagnostics: true, compilerOptions: { module: 1 } });
        return new VMScript(res.outputText);
    }
    
    find(hash: string) {
        if(this.hashes.has(hash)) {
            return this.hashes.get(hash);
        } else {
            throw new Error('Cannot find deployed script');
        }
    }

    deploy(script: string) {
        const hash = Crypto.hash(script);
        let compiledScript: VMScript = this.compile(script);
        this.hashes.set(hash, new (this.vm.run(compiledScript)).default);
        return hash;
    }

    deployedContracts() {
        return Object.keys(this.hashes);
    }
    
    callContract(payload: { hash: string, params: any, method: string }) {
        const deploymentClass = this.find(payload.hash);
        const methodParams = payload.params ? payload.params : [];
        const response = deploymentClass[payload.method](...methodParams);
        return response;
    }
}