var fs = require('fs');
var path = require('path');
var optparse = require('optparse');
var operations = require('./operations.js');

/* Define command-line options */

var switches = [
    ['-h', '--help', 'Shows help sections'],
    ['-v', '--version', 'Shows the version'],
    ['--show-trace', 'Causes Nix to print out a stack trace in case of Nix expression evaluation errors'],
    ['-K', '--keep-failed', 'Specifies that in case of a build failure, the temporary directory should not be deleted'],
    ['-o', '--out-link FILE', 'Change the name of the symlink to the output path created from result to outlink'],
    ['-A', '--attr NAME', 'Selects an instance of the top-level packages module'],
    ['--no-out-link', 'Do not create a symlink to the output path'],
    ['--eval-only', 'Causes the tool to only generate a Nix expression without evaluating it'],
    ['--async', 'Indicates whether the deployment modules are defined asynchronously'],
    ['--format', 'Indicates whether to nicely format to expression (i.e. generating whitespaces) or not']
];

var parser = new optparse.OptionParser(switches);

/* Set some variables and their default values */

var help = false;
var version = false;
var showTrace = false;
var keepFailed = false;
var outLink = null;
var attr = null;
var noOutLink = false;
var evalOnly = false;
var executable = "";
var filename = null;
var async = false;
var format = false;

/* Define process rules for option parameters */

parser.on(function(arg, value) {
    process.stderr.write(arg + ": invalid option\n");
    process.exit(1);
});

parser.on('help', function(arg, value) {
    help = true;
});

parser.on('version', function(arg, value) {
    version = true;
});

parser.on('show-trace', function(arg, value) {
    showTrace = true;
});

parser.on('keep-failed', function(arg, value) {
    keepFailed = true;
});

parser.on('out-link', function(arg, value) {
    outLink = value;
});

parser.on('attr', function(arg, value) {
    attr = value;
});

parser.on('no-out-link', function(arg, value) {
    noOutLink = true;
});

parser.on('eval-only', function(arg, value) {
    evalOnly = true;
});

parser.on('async', function(arg, value) {
    async = true;
});

parser.on('format', function(arg, value) {
    format = true;
});


/* Define process rules for non-option parameters */

parser.on(1, function(opt) {
    executable = opt;
});

parser.on(2, function(opt) {
    filename = opt;
});

/* Do the actual command-line parsing */

parser.parse(process.argv);

/* Display the help, if it has been requested */

if(help) {
    function displayTab(len, maxlen) {
        for(var i = 0; i < maxlen - len; i++) {
            process.stdout.write(" ");
        }
    }

    process.stdout.write("Usage: nijs-build [options] -A package pkgs.js\n\n");

    process.stdout.write("Converts a given CommonJS module defining a Nix expression in a semi-abstract\n");
    process.stdout.write("syntax into a Nix expression and builds it using `nix-build'\n\n");

    process.stdout.write("Options:\n");

    var maxlen = 20;

    for(var i = 0; i < switches.length; i++) {

        var currentSwitch = switches[i];

        process.stdout.write("  ");

        if(currentSwitch.length == 3) {
            process.stdout.write(currentSwitch[0] + ", "+currentSwitch[1]);
            displayTab(currentSwitch[0].length + 2 + currentSwitch[1].length, maxlen);
            process.stdout.write(currentSwitch[2]);
        } else {
            process.stdout.write(currentSwitch[0]);
            displayTab(currentSwitch[0].length, maxlen);
            process.stdout.write(currentSwitch[1]);
        }

        process.stdout.write("\n");
    }

    process.exit(0);
}

/* Display the version, if it has been requested */

if(version) {
    var versionNumber = fs.readFileSync(path.join("..", "..", "version"));
    process.stdout.write(executable + " (nijs "+versionNumber+")\n\n");
    process.stdout.write("Copyright (C) 2012-2015 Sander van der Burg\n");
    process.exit(0);
}

/* Verify the input parameters */

if(filename === null) {
    process.stderr.write("No packages CommonJS module is specified!\n");
    process.exit(1);
}

if(attr === null) {
    process.stderr.write("No package has been selected!\n");
    process.exit(1);
}

/* Perform the desired operation */

if(evalOnly) {
    operations.evaluateModule({
        filename : filename,
        attr : attr,
        async : async,
        format : format
    });
} else {
    operations.nijsBuild({
        filename : filename,
        attr : attr,
        showTrace : showTrace,
        keepFailed : keepFailed,
        outLink : outLink,
        noOutLink : noOutLink,
        async : async,
        format : format
    });
}
