function render_dn(e) {
    var output = document.getElementById("output");
    var input = document.getElementById("input").value;

    var chunks = input.split(/\s+/g);

    output.textContent = "";
    var dns = [];
    for(var i = 0; i < chunks.length; i++) {
        dns.push(encode(chunks[i].match(tokenMap.regex)));
    }

    output.innerText = dns.join(" ");
}

var tokenMap = {
    "consonants": {
        "k":  0x0915, "kh":  0x0916, "g":  0x0917, "gh":  0x0918, "\"n": 0x0919,
        "c":  0x091a, "ch":  0x091b, "j":  0x091c, "jh":  0x091d, "~n":  0x091e,
        ".t": 0x091f, ".th": 0x0920, ".d": 0x0921, ".dh": 0x0922, ".n":  0x0923,
        "t":  0x0924, "th":  0x0925, "d":  0x0926, "dh":  0x0927, "n":   0x0928,
        "p":  0x092a, "ph":  0x092b, "b":  0x092c, "bh":  0x092d, "m":   0x092e,

        "y":   0x092f, "r":  0x0930, "l": 0x0932, "v": 0x0935,
        "\"s": 0x0936, ".s": 0x0937, "s": 0x0938, "h": 0x0939,
    },

    "vowels": {
        "a":  [0x0905, null  ], "A":  [0x0906, 0x093e],
        "i":  [0x0907, 0x093f], "I":  [0x0908, 0x0940],
        "u":  [0x0909, 0x0941], "U":  [0x090a, 0x0942],
        ".r": [0x090b, 0x0943], ".R": [0x0960, 0x0944],
        ".l": [0x090c, 0x0962], ".L": [0x0961, 0x0963],
        "e":  [0x090f, 0x0947], "ai": [0x0910, 0x0948],
        "o":  [0x0913, 0x094b], "au": [0x0914, 0x094c],
    },

    "misc": {
        ".m": 0x0902, ".h": 0x0903, "|": 0x0964, "||": 0x0965,
        ".o": 0x0950, ".a": 0x093d, "&": 0x094d,
        "0": 0x0966, "1": 0x0967, "2": 0x0968, "3": 0x0969, "4": 0x096a,
        "5": 0x096b, "6": 0x096c, "7": 0x096d, "8": 0x096e, "9": 0x096f,
    },
};

var invtable = {};

with(tokenMap) {
    tokenMap.everything = {};
    tokens = [];

    for(var k in consonants) {
        invtable[consonants[k]] = k;
        consonants[k] = String.fromCharCode(consonants[k]);
        everything[k] = consonants[k];
        tokens.push(k);
    }
    for(var k in vowels) {
        invtable[vowels[k][0]] = k;
        vowels[k] = [String.fromCharCode(vowels[k][0]), vowels[k][1]? String.fromCharCode(vowels[k][1]): ""];
        everything[k] = vowels[k][0];
        tokens.push(k);
    }
    for(var k in misc) {
        invtable[misc[k]] = k;
        misc[k] = String.fromCharCode(misc[k]);
        everything[k] = misc[k];
        tokens.push(k);
    }

    tokens.sort(function(a, b) { return b.length - a.length });
    tokens = tokens.map(function(x) { p = x.replace(".", "\\."); q = p.replace(/\|/g, "\\|"); return "(" + q + ")"; });
    tokenMap.regex = new RegExp(tokens.join("|") + "|.", "g");

    tokenMap.virama = misc["&"];
}

function encode(ts) {
    if(!ts) { return ""; }

    var out = "";
    var seenCons = false;
    for(var i = 0; i < ts.length; i++) {
        var t = ts[i];
        if(tokenMap.consonants[t]) {
            out += (seenCons? tokenMap.virama: "") + tokenMap.consonants[t];
            seenCons = true;
        }
        else if(tokenMap.vowels[t]) {
            out += tokenMap.vowels[t][seenCons? 1: 0];
            seenCons = false;
        }
        else if(tokenMap.misc[t]) {
            out += tokenMap.misc[t];
        }
        else {
            if(seenCons) {
                out += tokenMap.virama;
            }
            out += t;
            seenCons = false;
        }
    }

    if(seenCons) {
        out += tokenMap.virama;
    }

    return out;
}

function make_table(tblspec) {
    var table = document.createElement("table");

    for(var i = 0; i < tblspec.length; i++) {
        var row = make_row(tblspec[i], true);
        table.appendChild(row);
        var row = make_row(tblspec[i], false);
        table.appendChild(row);
    }

    return table;
}

function make_row(rowspec, devnagp) {
    var row = document.createElement("tr");

    if(devnagp) {
        /*row.setAttributeNS(row.namespaceURI, "class", "devnag");*/
        row.setAttribute("class", "devnag");
    }
    else {
        /*row.setAttributeNS(row.namespaceURI, "class", "roman");*/
        row.setAttribute("class", "roman");
    }

    for(var i = 0; i < rowspec.length; i++) {
        var cellspec = rowspec[i];
        if(cellspec && devnagp) {
            if(cellspec == 0x094d // virama
            || cellspec == 0x0902 // anusvara
            || cellspec == 0x0903 /* visarga */) {
                cellspec = String.fromCharCode(0x0915) + String.fromCharCode(cellspec);
            }
            else {
                cellspec = String.fromCharCode(cellspec);
            }
        }
        else if(cellspec && !devnagp) {
            cellspec = invtable[cellspec];
        }

        var cell = make_cell(cellspec);
        row.appendChild(cell);
    }

    return row;
}

function make_cell(text) {
    var elem = document.createElement("td");
    if(!text) return elem;

    var child = document.createTextNode(text);
    elem.appendChild(child);

    return elem;
}

var tbl = [
    /* Consonants. */
    [0x0915, 0x0916, 0x0917, 0x0918, 0x0919, 0x0905, 0x0906],
    [0x091a, 0x091b, 0x091c, 0x091d, 0x091e, 0x0907, 0x0908],
    [0x091f, 0x0920, 0x0921, 0x0922, 0x0923, 0x0909, 0x090a],
    [0x0924, 0x0925, 0x0926, 0x0927, 0x0928, 0x090b, 0x0960],
    [0x092a, 0x092b, 0x092c, 0x092d, 0x092e, 0x090c, 0x0961],
    /* Semivowels, sibilants. */
    [0x092f, 0x0930, 0x0932, 0x0935,   null, 0x090f, 0x0910],
    [0x0936, 0x0937, 0x0938, 0x0939,   null, 0x0913, 0x0914],
    /* Misc. */
    [0x0950, 0x093d, 0x0964, 0x0965, 0x094d, 0x0902, 0x0903]
];

window.onload = function() { document.getElementById("alphabet").appendChild(make_table(tbl)); };
