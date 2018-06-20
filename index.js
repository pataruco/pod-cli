#!/usr/bin/env node
"use strict";
exports.__esModule = true;
var program = require("commander");
var add_folder_1 = require("./commands/add-folder");
var update_1 = require("./commands/update");
program
    .command('add-folder')
    .description('Optimise images and upload it to S3')
    .action(function (dir) {
    add_folder_1.addFolder(dir);
});
program
    .command('update')
    .description('Update pod pictures manifest')
    .action(function () {
    update_1.update();
});
program.parse(process.argv);
