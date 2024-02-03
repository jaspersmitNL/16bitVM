export const opcodes = {
    NOP: 0x00,
    HLT: 0x01,

    //move literal to register
    MoveLit: 0x10,
    //move from register to register
    MoveReg: 0x11,
    //move from memory to register
    MoveRegMem: 0x12,
    //move from register to memory
    MoveMemReg: 0x13,

    //add two registers and store in accumulator
    Add: 0x14,
    //subtract two registers and store in accumulator
    Sub: 0x15,
    //multiply two registers and store in accumulator
    Mul: 0x16,

    //push literal to stack
    PushLit: 0x1A,
    //push register to stack
    PushReg: 0x1B,
    //pop from stack to register
    Pop: 0x1C,
    Print: 0x1D,

    //compare two registers if equal set zero flag to 1
    Cmp: 0x1E,
    CmpNot: 0x1F,
    Lt: 0x20,
    Gt: 0x21,


    //jump to address
    Jmp: 0x30,
    //jump to address if zero flag is set
    JmpZ: 0x31,
    //jump to address if zero flag is not set
    JmpNZ: 0x32,
}

export const simpleOpcodes = [
    "NOP",
    "HLT",
];


export function opcodeByName(name: string): number {

    const keys = Object.keys(opcodes);
    for (let i = 0; i < keys.length; i++) {
        if (keys[i].toUpperCase() === name.toUpperCase()) {
            return (opcodes as any)[keys[i]];
        }
    }

    throw new Error("Invalid opcode name: " + name);
}

export function opcodeByValue(value: number): string {
    const keys = Object.keys(opcodes);
    for (let i = 0; i < keys.length; i++) {
        if ((opcodes as any)[keys[i]] === value) {
            return keys[i];
        }
    }

    throw new Error("Invalid opcode value: " + value);
}

export function isSimpleOpcode(opcode: string): boolean {
    return simpleOpcodes.includes(opcode);
}