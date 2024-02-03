
//fibonacci
let R1 = 0;
let R2 = 1;
let R3 = 0;
while (R3 < 100) {
    R3 = R1 + R2;
    R1 = R2;
    R2 = R3;
    console.log(R3);
}