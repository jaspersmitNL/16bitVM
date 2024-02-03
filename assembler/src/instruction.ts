export type OperandType = "register" | "memory" | "literal" | "label";
export type Operand = {
    type: OperandType,
    value: number
    label?: string
}

export type Instruction = {
    opcodeName: string,
    opcode: number,
    operands: Operand[]
    line: number
    label:string
    address: number
}


function getOperandLength(operand: Operand): number {
    switch (operand.type) {
        case "register":
            return 1;
        case "memory":
            return 2;
        case "literal":
            return 2;
        case "label":
            return 2;
    }
}

export function getInstructionLength(instruction: Instruction): number {
    let length = 1;
    for(let operand of instruction.operands) {
        length += getOperandLength(operand);
    }
    return length;
}
