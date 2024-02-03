mod memory;
mod vm;
mod instruction;

use crate::vm::{Register, VM};
use crate::memory::Memory;

fn main() {
    println!("Hello, world!");

    let mut vm = VM::new(Memory::from_file("program.bin"));

    vm.run();

    println!("-------------------------");
    //print the registers
    for i in 0..8 {
        println!("R{}: 0x{:x}", i, vm.registers[i]);
    }
    println!("ACC: 0x{:x}", vm.registers[Register::ACC as usize]);


}