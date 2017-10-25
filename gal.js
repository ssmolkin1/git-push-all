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
      defaultOption: true
    },
    {
      name: 'remote',
      alias: 'r',
      type: String
    }
  ];

  const options = commandLineArgs(optionDefinitions, {argv});
  
  if (options.message) {
    config.message = options.message;
  }
  if (options.remote) {
    config.remote = options.remote;
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
} 
// If no command, run gal with options
else {
  const optionDefinitions = [
    {
      name: 'message',
      alias: 'm',
      type: String,
      defaultOption: true
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

// CommandLineArgs and CommandLineOptions auto throw errors on invalid commands or options