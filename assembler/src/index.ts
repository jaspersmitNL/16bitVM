import {isSimpleOpcode, opcodeByName} from "./opcode.ts";
import {getInstructionLength, type Instruction} from "./instruction.ts";
import {strContains} from "./util.ts";
import {Memory} from "./memory.ts";


let startAddress = 0;
let address = startAddress;
let lineNumber = 0;
let labelOpen: boolean = false;
let labelToUse: string = "";
let instructions: Instruction[] = [];

const memory = new Memory();


function getLabelAddress(label: string): number {
    for (let i = 0; i < instructions.length; i++) {
        if (instructions[i].label === label) {
            console.log("resolved label", label, "to address", instructions[i].address)
            return instructions[i].address;
        }
    }
    throw new Error("Label not found: " + label);

}

function parseNumber(value: string) {
    let prefix = value[0];
    let result = 0;
    let rest = value.substring(1);


    if (prefix === "$") {
        result = parseInt(rest, 16);
    } else if (prefix === "#") {
        result = parseInt(rest);
    } else if (prefix === "R") {
        result = parseInt(rest);
        //check if we are one of our registers
        if (result < 0 || result > 8) {
            throw new Error("Invalid register number: " + result);
        }
    }

    return result;

}


function moveInstruction(label: string, line: string[]): Instruction | null {
    if (line.length !== 3) {
        throw new Error("Invalid number of operands for MOV, expected 2, got " + (line.length - 1));
    }
    let left: any = line[1];
    let right: any = line[2];

    //MoveLiteral, MoveRegister, MoveRegisterMem, MoveMemRegister
    if (left[0] === "R" && (right[0] === "$" || right[0] === "#")) {
        left = parseNumber(left);
        right = parseNumber(right);
        return {
            opcodeName: "MoveLit",
            opcode: opcodeByName("MoveLit"),
            operands: [{type: "register", value: left}, {type: "literal", value: right}],
            line: lineNumber,
            label: label,
            address: 0
        }
    }
    if (left[0] === "R" && right[0] === "R") {
        left = parseNumber(left);
        right = parseNumber(right);
        return {
            opcodeName: "MoveReg",
            opcode: opcodeByName("MoveReg"),
            operands: [{type: "register", value: left}, {type: "register", value: right}],
            line: lineNumber,
            label: label,
            address: 0
        }
    }
    if (left[0] === "R" && right[0] === "[") {
        left = parseNumber(left);
        right = parseNumber(right.substring(1, right.length - 1));
        return {
            opcodeName: "MoveRegMem",
            opcode: opcodeByName("MoveRegMem"),
            operands: [{type: "register", value: left}, {type: "memory", value: right}],
            line: lineNumber,
            label: label,
            address: 0
        }
    }
    if (left[0] === "[" && right[0] === "R") {
        left = parseNumber(left.substring(1, left.length - 1));
        right = parseNumber(right);
        return {
            opcodeName: "MoveMemReg",
            opcode: opcodeByName("MoveMemReg"),
            operands: [{type: "memory", value: left}, {type: "register", value: right}],
            line: lineNumber,
            label: label,
            address: 0
        }
    }


    return null;
}

function arithmeticInstruction(label: string, line: string[]): Instruction | null {
    const opcode = line[0];
    if (line.length !== 3) {
        throw new Error("Invalid number of operands for " + opcode + ", expected 2, got " + (line.length - 1));
    }

    let left: any = line[1];
    let right: any = line[2];

    if (left[0] !== "R" || right[0] !== "R") {
        throw new Error("Invalid operands for " + opcode + ", expected two registers, got " + left + " and " + right);
    }

    left = parseNumber(left);
    right = parseNumber(right);

    return {
        opcodeName: opcode,
        opcode: opcodeByName(opcode),
        operands: [{type: "register", value: left}, {type: "register", value: right}],
        line: lineNumber,
        label: label,
        address: 0
    }
}

function stackInstruction(label: string, line: string[]): Instruction | null {
    const opcode = line[0];
    if (line.length !== 2) {
        throw new Error("Invalid number of operands for " + opcode + ", expected 1, got " + (line.length - 1));
    }

    let operand: any = line[1];
    if (opcode === "PUSH") {
        if (operand[0] === "R") {
            operand = parseNumber(operand);
            return {
                opcodeName: "PushReg",
                opcode: opcodeByName("PushReg"),
                operands: [{type: "register", value: operand}],
                line: lineNumber,
                label: label,
                address: 0
            }
        } else if (operand[0] === "$" || operand[0] === "#") {
            operand = parseNumber(operand);
            return {
                opcodeName: "PushLit",
                opcode: opcodeByName("PushLit"),
                operands: [{type: "literal", value: operand}],
                line: lineNumber,
                label: label,
                address: 0
            }
        }
    } else if (opcode === "POP") {
        if (operand[0] !== "R") {
            throw new Error("Invalid operand for POP, expected register, got " + operand);
        }
        operand = parseNumber(operand);
        return {
            opcodeName: "Pop",
            opcode: opcodeByName("Pop"),
            operands: [{type: "register", value: operand}],
            line: lineNumber,
            label: label,
            address: 0
        }
    }

    return null;
}

function jumpInstruction(label: string, line: string[]): Instruction | null {
    if (line.length !== 2) {
        throw new Error("Invalid number of operands for JMP, expected 1, got " + (line.length - 1));
    }

    let left: any = line[1];

    return {
        opcodeName: "Jmp",
        opcode: opcodeByName("Jmp"),
        operands: [{type: "label", value: -1, label: left}],
        line: lineNumber,
        label: label,
        address: 0
    }

}

function handleLine(label: string, line: string[]): Instruction | null {
    const opcode = line[0];

    if (isSimpleOpcode(opcode)) {
        return {
            opcodeName: opcode,
            opcode: opcodeByName(opcode),
            operands: [],
            line: lineNumber,
            label: label,
            address: 0
        };
    }

    if (opcode === "MOV") {
        return moveInstruction(label, line);
    }

    if (opcode === "ADD" || opcode === "SUB" || opcode === "MUL") {
        return arithmeticInstruction(label, line);
    }

    if (opcode === "PUSH" || opcode === "POP") {
        return stackInstruction(label, line);
    }

    if (opcode === "PRINT") {
        let left: any = line[1];
        if (left[0] !== "R") {
            throw new Error("Invalid operand for PRINT, expected register, got " + left);
        }
        left = parseNumber(left);
        return {
            opcodeName: "Print",
            opcode: opcodeByName("Print"),
            operands: [
                {type: "register", value: left}
            ],
            line: lineNumber,
            label: label,
            address: 0
        };
    }

    if (opcode === "JMP") {
        return jumpInstruction(label, line);
    }

    return null;
}

function parseLine(line: string): Instruction | null {
    if (line.startsWith(";") || line.length < 1) {
        return null;
    }
    const labelLine: string[] = line.split(":");
    let label: string = labelLine[0];

    if (strContains(line, ":") && labelLine[1].trim().length <= 1) {
        if (labelOpen) {
            throw new Error("Label not closed");
        }
        labelToUse = label;
        labelOpen = true;
        return null;
    } else if (!strContains(line, ":")) {
        if (labelOpen) {
            label = labelToUse;
            labelOpen = false;
        } else {
            label = "";
        }
    } else {
        if (labelOpen) {
            throw new Error("Label not closed");
        }
        line = labelLine[1].trim();
    }

    return handleLine(label, line.replace(",", " ").split(" "));
}

function encodeInstruction(instruction: Instruction) {
    memory.write_byte(instruction.opcode);
    if (instruction.operands.length > 0) {
        for (let operand of instruction.operands) {
            switch (operand.type) {
                case "register":
                    memory.write_byte(operand.value);
                    break;
                case "memory":
                    memory.write_word(operand.value);
                    break;
                case "literal":
                    memory.write_word(operand.value);
                    break;
                case "label":
                    memory.write_word(getLabelAddress(operand.label!));
                    break;
            }
        }
    }
}

async function assembleFile(path: string) {
    let lines = (await Bun.file(path).text()).replaceAll("\r", "").split("\n");

    for (let line of lines) {
        line = line.trim();
        line = line.toUpperCase();
        let result = parseLine(line);
        if (result !== null) {
            instructions.push(result);
        }
        lineNumber++;
    }

    //calculate addresses for instructions
    for (let i = 0; i < instructions.length; i++) {
        instructions[i].address = address;// -1?
        address += getInstructionLength(instructions[i]);
    }
    await Bun.write("ast.json", JSON.stringify(instructions, null, 4));

    for (let instruction of instructions) {
        encodeInstruction(instruction);
    }

    await memory.write_to_file("../program.bin", 1024);
}


await assembleFile("../program.asm");