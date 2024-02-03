export class Memory {
    private buffer: number[] = [];

    public write_byte(byte: number) {
        this.buffer.push(byte);
    }

    public write_word(word: number) {
        this.buffer.push(word & 0xff);
        this.buffer.push((word >> 8) & 0xff);
    }

    public async write_to_file(path: string, totalSize: number) {

        let bytes = new Uint8Array(totalSize).fill(0);
        for (let i = 0; i < this.buffer.length; i++) {
            bytes[i] = this.buffer[i];
        }


        await Bun.write(path, bytes);
    }
}