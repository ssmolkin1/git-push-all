#! /usr/bin/env node

const fs = require('fs');
const shell = require('shelljs');
const commandLineArgs = require('command-line-args');
const commandLineCommands = require('command-line-commands');

const configPath = './config.json';
const config = require(configPath);

const validCommands = [null, 'config'];
const {command, argv} = commandLineCommands(validCommands);



if (command === null) {
  const optionDefinitions = [
    {
      name: 'message',
      alias: 'm',
      type: String
    },
    {
      name: 'remote',
      alias: 'r',
      type: String
    },
    {
      name: 'branch',
      alias: 'b',
      type: String
    }
  ];
  
  const options = commandLineArgs(optionDefinitions, {argv});

  const currentBranch = shell.exec('git branch | grep \\*', {silent:true}).stdout.slice(2);

  function gal(message = config.message, remote = config.remote, branch = currentBranch) {
    shell.exec(`git add -A &&
      git commit -m "${message}" &&
      git push -u ${remote} ${branch}`);
  }
  
  gal(options.message, options.remote, options.branch);
}
  

// fs.writeFileSync(configPath, JSON.stringify(config, null, 2));