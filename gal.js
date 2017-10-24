#! /usr/bin/env node

const fs = require('fs');
const shell = require('shelljs');
const commandLineArgs = require('command-line-args');
const commandLineCommands = require('command-line-commands');

const configPath = './config.json';
const config = require(configPath);

config.remote = "master";
console.log(config);

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log('Complete!');

const validCommands = [null, 'config'];
const {command, argv} = commandLineCommands(validCommands);



if (command === null) {
  const optionDefinitions = [
    {
      name: ''
    }
  ]
}