use std::convert::Into;
use crate::memory::Memory;
use crate::instruction::Instruction;
use crate::instruction::Instruction::HLT;

pub enum Register {
    R0 = 0,
    R1 = 1,
    R2 = 2,
    R3 = 3,
    R4 = 4,
    R5 = 5,
    R6 = 6,
    R7 = 7,

    ACC = 8, //accumulator
}

impl From<Register> for u8 {
    fn from(v: Register) -> Self {
        v as u8
    }
}


pub struct VM {
    pub memory: Memory,
    pub registers: [u16; 9],
    pub stack: [u16; 256],
    pub pc: usize,
    pub sp: usize,
    pub zf: u8,
}

impl VM {
    pub fn new(memory: Memory) -> VM {
        VM {
            memory,
            registers: [0; 9],
            stack: [0; 256],
            pc: 0,
            sp: 0,
            zf: 0,
        }
    }

    pub fn run(&mut self) {
        loop {
            let instruction = self.fetch();
            if instruction == HLT.into() {
                break;
            }
            self.cycle(instruction.into());
        }
    }

    pub fn cycle(&mut self, instruction: Instruction) {
        let debug = false;
        match instruction {
            Instruction::NOP => {}
            Instruction::MoveLit => {
                let register = self.fetch() as usize;
                let value = self.fetch_word();
                self.registers[register] = value;

                if debug { println!("MoveLit R{} 0x{:x}", register, value) }
            }
            Instruction::MoveReg => {
                let from = self.fetch() as usize;
                let to = self.fetch() as usize;
                self.registers[to] = self.registers[from];
                if debug { println!("MoveReg R{} R{}", from, to) }
            }
            Instruction::MoveRegMem => {
                let from = self.fetch() as usize;
                let address = self.fetch_word() as usize;
                self.registers[from] = self.memory.read_word(address);
                if debug { println!("MoveRegMem R{} 0x{:x}", from, address) }
            }
            Instruction::MoveMemReg => {
                let from = self.fetch() as usize;
                let address = self.fetch_word() as usize;
                self.memory.write_word(address, self.registers[from]);
                if debug { println!("MoveMemReg R{} 0x{:x}", from, address) }
            }
            Instruction::Add => {
                let val1 = self.registers[self.fetch() as usize];
                let val2 = self.registers[self.fetch() as usize];
                self.registers[Register::ACC as usize] = val1 + val2;
                println!("Add R{} R{} > {}", val1, val2, val1 + val2)
            }
            Instruction::Sub => {
                let val1 = self.registers[self.fetch() as usize];
                let val2 = self.registers[self.fetch() as usize];
                self.registers[Register::ACC as usize] = val1 - val2;
                if debug { println!("Sub R{} R{}", val1, val2) }
            }
            Instruction::Mul => {
                let val1 = self.registers[self.fetch() as usize];
                let val2 = self.registers[self.fetch() as usize];
                self.registers[Register::ACC as usize] = val1 * val2;
                if debug { println!("Mul R{} R{}", val1, val2) }
            }
            Instruction::PushLit => {
                let value = self.fetch_word();
                self.push(value);
                if debug { println!("PushLit 0x{:x}", value) }
            }
            Instruction::PushReg => {
                let register = self.fetch() as usize;
                self.push(self.registers[register]);
                if debug { println!("PushReg R{} 0x{:x}", register, self.registers[register]) }
            }
            Instruction::Pop => {
                let register = self.fetch() as usize;
                self.registers[register] = self.pop();
                if debug { println!("Pop R{} 0x{:x}", register, self.registers[register]) }
            }
            Instruction::Print => {
                let register = self.fetch() as usize;
                println!("Print R{} 0x{:x}", register, self.registers[register])
            }
            Instruction::Cmp => {
                let val1 = self.registers[self.fetch() as usize];
                let val2 = self.registers[self.fetch() as usize];
                self.zf = if val1 == val2 { 1 } else { 0 };
                if debug { println!("Cmp R{} R{}", val1, val2) }
            }
            Instruction::CmpNot => {
                let val1 = self.registers[self.fetch() as usize];
                let val2 = self.registers[self.fetch() as usize];
                self.zf = if val1 != val2 { 1 } else { 0 };
                if debug { println!("CmpNot R{} R{}", val1, val2) }
            }
            Instruction::Lt => {
                let val1 = self.registers[self.fetch() as usize];
                let val2 = self.registers[self.fetch() as usize];
                self.zf = if val1 < val2 { 1 } else { 0 };
                if debug { println!("Lt R{} R{}", val1, val2) }
            }
            Instruction::Gt => {
                let val1 = self.registers[self.fetch() as usize];
                let val2 = self.registers[self.fetch() as usize];
                self.zf = if val1 > val2 { 1 } else { 0 };
                if debug { println!("Gt R{} R{}", val1, val2) }
            }
            Instruction::Jmp => {
                self.pc = self.fetch_word() as usize;
                if debug { println!("Jmp 0x{:x}", self.pc) }
            }
            Instruction::JmpZ => {
                let address = self.fetch_word() as usize;
                if self.zf == 1 {
                    self.pc = address;
                }
                if debug { println!("JmpZ 0x{:x}", address) }
            }
            Instruction::JmpNZ => {
                let address = self.fetch_word() as usize;
                if self.zf == 0 {
                    self.pc = address;
                }
                if debug { println!("JmpNZ 0x{:x}", address) }
            }

            HLT => {}
        }
    }

    fn fetch(&mut self) -> u8 {
        let byte = self.memory.read_byte(self.pc);
        self.pc += 1;
        byte
    }
    fn fetch_word(&mut self) -> u16 {
        let word = self.memory.read_word(self.pc);
        self.pc += 2;
        word
    }
    fn push(&mut self, value: u16) {
        if self.sp == 256 {
            panic!("Stack overflow");
        }
        self.stack[self.sp] = value;
        self.sp += 1;
    }
    fn pop(&mut self) -> u16 {
        if self.sp == 0 {
            panic!("Stack underflow");
        }
        self.sp -= 1;
        self.stack[self.sp]
    }
}