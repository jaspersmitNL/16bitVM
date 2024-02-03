
#[derive(Debug, Clone, Copy)]
#[repr(u8)]
pub enum Instruction {
    NOP = 0x00,
    HLT = 0x01,

    //move literal to register
    MoveLit = 0x10,
    //move from register to register
    MoveReg = 0x11,
    //move from memory to register
    MoveRegMem = 0x12,
    //move from register to memory
    MoveMemReg = 0x13,

    //add two registers and store in accumulator
    Add = 0x14,
    //subtract two registers and store in accumulator
    Sub = 0x15,
    //multiply two registers and store in accumulator
    Mul = 0x16,

    //push literal to stack
    PushLit = 0x1A,
    //push register to stack
    PushReg = 0x1B,
    //pop from stack to register
    Pop = 0x1C,
    Print = 0x1D,

    //compare two registers if equal set zero flag to 1
    Cmp = 0x1E,
    CmpNot = 0x1F,
    Lt = 0x20,
    Gt = 0x21,


    //jump to address
    Jmp = 0x30,
    //jump to address if zero flag is set
    JmpZ = 0x31,
    //jump to address if zero flag is not set
    JmpNZ = 0x32,
}

impl From<Instruction> for u8 {
    fn from(v: Instruction) -> Self {
        v as u8
    }
}

impl From<u8> for Instruction {
    fn from(v: u8) -> Self {
        match v {
            0x00 => Instruction::NOP,
            0x01 => Instruction::HLT,
            0x10 => Instruction::MoveLit,
            0x11 => Instruction::MoveReg,
            0x12 => Instruction::MoveRegMem,
            0x13 => Instruction::MoveMemReg,
            0x14 => Instruction::Add,
            0x15 => Instruction::Sub,
            0x16 => Instruction::Mul,
            0x1A => Instruction::PushLit,
            0x1B => Instruction::PushReg,
            0x1C => Instruction::Pop,
            0x1D => Instruction::Print,

            0x1E => Instruction::Cmp,
            0x1F => Instruction::CmpNot,
            0x20 => Instruction::Lt,
            0x21 => Instruction::Gt,
            0x30 => Instruction::Jmp,



            _ => panic!("Unrecognized instruction 0x{:x}", v),
        }
    }
}