pub struct Memory {
    size: usize,
    data: Vec<u8>,
}

impl Memory {
    pub fn new(size: usize) -> Memory {
        Memory {
            size,
            data: vec![0; size],
        }
    }
    pub fn write_byte(&mut self, address: usize, value: u8) -> usize {
        self.data[address] = value;
        1
    }
    pub fn read_byte(&self, address: usize) -> u8 {
        self.data[address]
    }
    pub fn write_word(&mut self, address: usize, value: u16) ->usize {

        //little endian
        self.data[address] = value as u8;
        self.data[address + 1] = (value >> 8) as u8;
        2
    }
    pub fn read_word(&self, address: usize) -> u16 {
        //little endian
        self.data[address] as u16 | ((self.data[address + 1] as u16) << 8)
    }

    pub fn hexdump(&self, from: usize, to: usize) {
        for (i, byte) in self.data[from..to].iter().enumerate() {
            println!("0x{:x}: 0x{:x}", from + i, byte);
        }
    }

    pub fn write_file(&self, filename: &str) {
        use std::fs::File;
        use std::io::Write;
        let mut file = File::create(filename).unwrap();
        for byte in self.data.iter() {
            file.write_all(&[*byte]).unwrap();
        }
    }

    pub fn read_file(&mut self, filename: &str) {
        use std::fs::File;
        use std::io::Read;
        let mut file = File::open(filename).unwrap();
        file.read_exact(&mut self.data).unwrap();
    }

    pub fn from_file(filename: &str) -> Memory {
        use std::fs::File;
        use std::io::Read;
        let mut file = File::open(filename).unwrap();
        let mut data = Vec::new();
        file.read_to_end(&mut data).unwrap();
        Memory {
            size: data.len(),
            data,
        }
    }

}