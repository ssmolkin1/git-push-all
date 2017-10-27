#! /usr/bin/env node

const fs = require('fs');
const shell = require('shelljs');
const commandLineArgs = require('command-line-args');
const commandLineCommands = require('command-line-commands');

const configPath = `${__dirname}/config.json`;
const config = require(configPath);

const validCommands = [null, 'config', 'store', 's', 'b'];
const {command, argv} = commandLineCommands(validCommands);

// Utility requires git to work
if (!shell.which('git')) {
  console.log('Sorry, it looks like you don\'t have git installed yet. Gal is made for git, so it won\'t help you unless you have that first. Please install git and try again.');
  shell.exit(1);
}

// b command checks branch
if (command === 'b') {
  shell.exec('git branch');
}
// s command just runs git status
else if (command === 's') {
  shell.exec('git status');
}
// store command sets up credential storage using libsecret. Requires curl and only works on Debian-based Linux distros (uses apt repository)
else if (command === 'store') {
  shell.config.silent = true;
  
  if (!shell.which('apt')) {
    console.log('Sorry, gal can only set up your credential storage if you are running a Debian-based Linux distribution.');
    shell.exit(1);
  }
  
  console.log('Initializing git credential storage with libsecret');

  // checks if you have a libsecret folder in your git credentials file and mkdir if not
  var storePath = '/usr/share/doc/git/contrib/credential';
  if (shell.ls(storePath).indexOf('libsecret') < 0) {
    // checks for curl, otherwise cannot continue
    if (!shell.which('curl')) {
      console.log('You are not set up yet to store git credentials using libsecret. Gal can set this up for you, but curl is required to install the necessary files. Please install curl and try again.');
      shell.exit(1);
    }
    console.log(`Making credential storage folder: ${storePath}/libsecret`);
    shell.exec(`sudo mkdir ${storePath}/libsecret`);
    console.log('Done!');
  } 
  
  storePath += '/libsecret'; 
  const libsecretContents = shell.ls(storePath);
    
  // checks if you have the Makefile and curl if not
  if (libsecretContents.indexOf('Makefile') < 0) {
    if (!shell.which('curl')) {
      console.log('You are not set up yet to store git credentials using libsecret. Gal can set this up for you, but curl is required to install the necessary files. Please install curl and try again.');
      shell.exit(1);
    }
    console.log(`Downloading Makefile...`);
    shell.exec(`sudo curl -o ${storePath}/Makefile https://raw.githubusercontent.com/git/git/master/contrib/credential/libsecret/Makefile`);
    console.log('Done!');
  }

  // checks if you have the C file and curl if not
  if (libsecretContents.indexOf('git-credential-libsecret.c') < 0) {
    if (!shell.which('curl')) {
      console.log('You are not set up yet to store git credentials using libsecret. Gal can set this up for you, but curl is required to install the necessary files. Please install curl and try again.');
      shell.exit(1);
    }
    console.log('Downloading C file...');
    shell.exec(`sudo curl -o ${storePath}/git-credential-libsecret.c https://raw.githubusercontent.com/git/git/master/contrib/credential/libsecret/git-credential-libsecret.c`);
    console.log('Done!');
  }

  if (libsecretContents.indexOf('git-credential-libsecret.o') < 0) {
    console.log('Checking for latest libsecret dev file and installing or updating to latest if needed...');
    shell.exec('sudo apt install libsecret.*dev -y');    
    console.log('Done!');
    
    console.log('Building...');
    shell.exec(`sudo make -C ${storePath}`);
    console.log('Done!');
  }

  console.log('Setting up credential storage...');
  shell.exec('git config --global credential.helper /usr/share/doc/git/contrib/credential/libsecret/git-credential-libsecret');
  console.log('Done!\nGit credential storage using libsecret is now set up. Next time you enter your GitHub credentials, they will be securely saved and you will never need to enter them again on this machine!');
}
// Config command sets default configs
else if (command === 'config') {
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
  
  if (!options.message && !options.remote) {
    console.log(JSON.stringify(config, null, 2));
  } else {
    if (options.message) {
      config.message = options.message.join(' ');   // ...which are joined, thereby obviating the need to put quotes around the commit message
    }
    if (options.remote) {
      config.remote = options.remote;
    }
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }
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
    },
    {
      name: 'commit-only',
      alias: 'c',
      type: Boolean
    },
    {
      name: 'add-only', 
      alias: 'a',
      type: Boolean
    },
    {
      name: 'push-only', 
      alias: 'p',
      type: Boolean
    },
    {
      name: 'add-commit-only', 
      alias: 'o',
      type: Boolean
    },
    {
      name: 'status', 
      alias: 's',
      type: Boolean
    },
    {
      name: 'pull', 
      alias: 'l',
      type: Boolean
    }
  ];

  const options = commandLineArgs(optionDefinitions, {argv});
  
  if (options.pull) {
    shell.exec(`git pull ${options.remote} ${options.branch}`);
  } else {
    if (!options['push-only'] && !options['commit-only']) {
      shell.exec(`git add -A`);
    }
    if (!options['add-only']) {
      if (!options['push-only']) {
        shell.exec(`git commit -m "${options.message.join(' ')}"`);
      } 
      if (!options['commit-only'] && !options['add-commit-only']) {
        shell.exec(`git push -u ${options.remote} ${options.branch}`);
      }
    }    
  }
   
  if (options.status) {
    shell.exec(`git status`);
  }
}