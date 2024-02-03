data = []
program = []
output = []

label_open = False
label_to_use = ""

OPCODES = {
    "NOP": 0x00,
    "HLT": 0x01,
    "MOV_LIT": 0x10,

    "MOV_REG": 0x11,
    "MOV_REG_MEM": 0x12,
    "MOV_MEM_REG": 0x13,
}


def compile_file(path):
    file = open(path, "r")
    line_number = 1
    for line in file:
        # print(line)
        line = line.upper()
        line = line.split(";")  # getting rid of comments
        line[0] = line[0].replace("\n", "")  # removing return line
        line[0] = line[0].replace("\r", "")
        line[0] = line[0].strip()
        if len(line[0]) > 0:
            parse_line(line[0], line_number)
        line_number = line_number + 1




def parse_line(line, line_number):
    global label_open
    global label_to_use
    label_line = line.split(":")
    label = label_line[0]
    if ":" in line and len(label_line[1]) <= 1:
        if label_open:
            print(f"Error: Label already open line: {line_number}")
            exit()
        label_open = True
        label_to_use = label
    elif ":" not in line:
        if label_open:
            label = label_to_use
            label_open = False
        else:
            label = ""
    else:
        if label_open:
            print(f"Error: Label already open line: {line_number}")
            exit()
        line = label_line[1].strip()
    line = line.split(" ")
    operations = encode(line, line_number)
    if not (operations is None):
        program.append(create_line(label, operations))
    return


def encode(line, line_number):
    print("Encoding line: ", line)
    opcode = line[0]

    # simple instructions with no arguments
    simple_instructions = ["NOP", "HLT"]

    if opcode in simple_instructions:
        return [OPCODES[opcode]]

    if opcode == "MOV":
        if len(line) != 3:
            print(f"Error: Invalid number of arguments for MOV line: {line_number}")
            exit()
        # left should always be a register
        if not line[1][0] == "R":
            print(f"Error: Invalid argument for MOV line: {line_number}")
            exit()
        left = parse_number(line[1], line_number)
        # right can be a register, or a memory address, or a literal
        if line[2][0] == "R":
            right = parse_number(line[2], line_number)
            print("MOV_REG", left, right)
            return [OPCODES["MOV_REG"], left, right]
        elif line[2][0] == "[":
            right = parse_number(line[2][1:-1], line_number)
            print("MOV_REG_MEM", left, right)
            return [OPCODES["MOV_REG_MEM"], left, right]
        else:
            right = parse_number(line[2], line_number)
            print("MOV_LIT", left, right)
            return [OPCODES["MOV_LIT"], left, right]




    return None


def create_line(label, operations):
    return [label, operations]


def parse_number(string, line_number):
    prefix = string[0]
    string = string[1:]
    result = 0

    if prefix == "$":
        result = int(string, 16)  # hex
    elif prefix == "#":
        result = int(string)  # decimal
    elif prefix == "R":
        result = int(string)  # register

    if result > 65535:
        print(f"Error: Number too large line: {line_number}")
        exit()

    return result


if __name__ == "__main__":
    compile_file('program.asm')
    print(program)
