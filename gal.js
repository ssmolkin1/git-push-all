#! /usr/bin/env node

const fs = require('fs');
const shell = require('shelljs');
const commandLineArgs = require('command-line-args');
const commandLineCommands = require('command-line-commands');

const configPath = './config.json';
const config = require(configPath);

const validCommands = [null, 'config'];
const {command, argv} = commandLineCommands(validCommands);

// Utility requires git to run
if (!shell.which('git')) {
  shell.echo('Sorry, this script requires git. Please install git and try again.');
  shell.exit(1);
}

// Config command sets default configs
if (command === 'config') {
  const optionDefinitions = [
    {
      name: 'message',
      alias: 'm',
      type: String,
      defaultOption: true,
      multiple: true    // takes an array of values...
    },
    {
      name: 'remote',
      alias: 'r',
      type: String
    }
  ];

  const options = commandLineArgs(optionDefinitions, {argv});
  
  if (options.message) {
    config.message = options.message.join(' ');   // ...which are joined, thereby obviating the need to put quotes around the commit message
  }
  if (options.remote) {
    config.remote = options.remote;
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
} 
// If no command, run gal with options
else {
  const currentBranch = shell.exec('git branch | grep \\*', {silent:true}).stdout.slice(2);

  const optionDefinitions = [
    {
      name: 'message',
      alias: 'm',
      type: String,
      defaultOption: true,
      defaultValue: config.message,
      multiple: true
    },
    {
      name: 'remote',
      alias: 'r',
      type: String,
      defaultValue: config.remote
    },
    {
      name: 'branch',
      alias: 'b',
      type: String,
      defaultValue: currentBranch
    }
  ];
  
  const options = commandLineArgs(optionDefinitions, {argv});

  shell.exec(`git add -A &&
    git commit -m "${options.message.join(' ')}" &&
    git push -u ${options.remote} ${options.branch}`);
}

// CommandLineArgs and CommandLineOptions auto throw errors on invalid commands or options