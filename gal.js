#! /usr/bin/env node

const fs = require('fs');
const shell = require('shelljs');
const commandLineArgs = require('command-line-args');
const commandLineCommands = require('command-line-commands');

const configPath = './config.json';
const config = require(configPath);

const currentBranch = shell.exec('git branch | grep \\*', {silent:true}).stdout.slice(2);

shell.exec(`git add -A &&
  git commit -m "gal-commit" &&
  git push -u ${config.remote} ${currentBranch}`);

/* fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log('Complete!');

const validCommands = [null, 'config'];
const {command, argv} = commandLineCommands(validCommands);



if (command === null) {
  const optionDefinitions = [
    {
      name: ''
    }
  ]
} */