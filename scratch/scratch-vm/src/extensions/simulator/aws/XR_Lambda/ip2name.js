'use strict';

function encodeIPtoName(ipaddress) {
    let name = '';
    if (ipaddress) {
        name = String(ipaddress);
        name = name.replace(/[.]/g, '-');
        name = `drone-${name}`;
    }
    return name;
}

function tests() {
    let testdata = [
        undefined,
        null,
        NaN,
        0,
        '',
        1,
        '.',
        'a',
        '1.2.3.4',
        '120.210.144.199',
    ];

    for (let address of testdata) {
        let name = encodeIPtoName(address);
        console.log(address, `"${name}"`);
    }
}


if (require.main === module) {
    tests();
}