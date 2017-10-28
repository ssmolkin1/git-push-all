#! /usr/bin/env node

const shell = require('shelljs');

// Utility requires git to work
if (!shell.which('git')) {
  console.log('Sorry, it looks like you don\'t have git installed yet. Gal is made for git, so it won\'t help you unless you have that first. Please install git and try again.');
  shell.exit(1);
}

const fs = require('fs');
const commandLineArgs = require('command-line-args');
const commandLineCommands = require('command-line-commands');
const getUsage = require('command-line-usage');

const configPath = `${__dirname}/config.json`;
const config = require(configPath);

const currentBranch = shell.exec('git branch | grep \\*', {silent:true}).stdout.slice(2);

const validCommands = [null, 'config', 's', 'b', 'M', 'store'];
const {command, argv} = commandLineCommands(validCommands);

// If no command, run gal with options
if (command === null) {

  const optionDefinitions = [
    {
      name: 'message',
      alias: 'm',
      type: String,
      defaultOption: true,
      defaultValue: config.message,
      multiple: true,
      description: 'Set commit message. Default option. Default message is stored in config.'
    },
    {
      name: 'remote',
      alias: 'r',
      type: String,
      defaultValue: config.remote,
      description: 'Set remote. Default remote is stored in config.'
    },
    {
      name: 'branch',
      alias: 'b',
      type: String,
      defaultValue: currentBranch,
      description: 'Set branch. Default is the current branch.'
    },
    {
      name: 'commit-only',
      alias: 'c',
      type: Boolean,
      description: 'Commit only.'
    },
    {
      name: 'add-only', 
      alias: 'a',
      type: Boolean,
      description: 'Add only.'
    },
    {
      name: 'push-only', 
      alias: 'p',
      type: Boolean,
      description: 'Push only.'
    },
    {
      name: 'add-commit-only', 
      alias: 'o',
      type: Boolean,
      description: 'Add and commit only, do not push.'
    },
    {
      name: 'status', 
      alias: 's',
      type: Boolean,
      description: 'Run \'git status\' after all other operations are finished.'
    },
    {
      name: 'pull', 
      alias: 'l',
      type: Boolean,
      description: 'Run \'git pull\'. Defaults to remote set in config and the current branch.'
    },
    {
      name: 'version', 
      alias: 'v',
      type: Boolean,
      description: 'Prints the version of gal.'
    },
    {
      name: 'help', 
      alias: 'h',
      type: Boolean,
      description: 'Prints this help page.'
    }
  ];

  const options = commandLineArgs(optionDefinitions, {argv});
  
  if (options.help) {
    printHelpPage(command, optionDefinitions);
  } else if (options.version) {
    console.log(require('./package.json').version);
  } else if (options.pull) {
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
// Config command sets default configs
else if (command === 'config') {
  const optionDefinitions = [
    {
      name: 'message',
      alias: 'm',
      type: String,
      defaultOption: true,
      multiple: true,    // takes an array of values...
      description: 'Sets the default commit message.'
    },
    {
      name: 'remote',
      alias: 'r',
      type: String,
      description: 'Set the default remote.'
    },
    {
      name: 'help', 
      alias: 'h',
      type: Boolean,
      description: 'Prints this help page.'
    }
  ];

  const options = commandLineArgs(optionDefinitions, {argv});
  
  if (options.help) {
    printHelpPage(command, optionDefinitions);
  } else if (!options.message && !options.remote) {
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
// s command just runs git status
else if (command === 's') {
  const optionDefinitions = [
    {
      name: 'help', 
      alias: 'h',
      type: Boolean,
      description: 'Prints this help page.'
    }
  ];

  const options = commandLineArgs(optionDefinitions, {argv});
  
  if (options.help) {
    printHelpPage(command, optionDefinitions);
  } else {
    shell.exec('git status');
  }
}
// b command checks branch
else if (command === 'b') {
  const optionDefinitions = [
    {
      name: 'help', 
      alias: 'h',
      type: Boolean,
      description: 'Prints this help page.'
    }
  ];

  const options = commandLineArgs(optionDefinitions, {argv});
  
  if (options.help) {
    printHelpPage(command, optionDefinitions);
  } else {
    shell.exec('git branch');
  }
}
// m command merges two branches and pushes to remote
else if (command === 'M') {
  const optionDefinitions = [
    {
      name: 'from', 
      alias: 'f',
      type: String,
      defaultOption: currentBranch,
      description: 'Branch being merged from. Defaults to current branch.'
    },
    {
      name: 'into', 
      alias: 't',
      type: String,
      defaultOption: 'master',
      description: 'Branch being merged into. Defaults to master.'
    },
    {
      name: 'remote', 
      alias: 'r',
      type: String,
      defaultOption: config.remote,
      description: 'Branch being merged into. Defaults to master.'
    },
    {
      name: 'no-push', 
      alias: 'n',
      type: Boolean,
      description: 'Do not push following merge.'
    },
    {
      name: 'help', 
      alias: 'h',
      type: Boolean,
      description: 'Prints this help page.'
    }
  ];

  const options = commandLineArgs(optionDefinitions, {argv});
  
  if (options.help) {
    printHelpPage(command, optionDefinitions);
  } else {
    shell.exec(`git checkout ${options.into} &&
    git merge ${options.from}`);

    if (!options['no-push']) {
      shell.exec(`git push -u ${options.remote} ${options.into}`);
    }
  }
}
// store command sets up credential storage using libsecret. Requires curl and only works on Debian-based-based Linux distros (uses apt repository)
else if (command === 'store') {
  const optionDefinitions = [
    {
      name: 'help', 
      alias: 'h',
      type: Boolean,
      description: 'Prints this help page.'
    }
  ];

  const options = commandLineArgs(optionDefinitions, {argv});
  
  if (options.help) {
    printHelpPage(command, optionDefinitions);
  } else {
    shell.config.silent = true;
  
    if (!shell.which('apt')) {
      console.log('Sorry, gal can only set up your credential storage if you are running a Debian-based-based Linux distribution.');
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
}
 
// Helper function to generate help page
function printHelpPage(command, optionDefinitions) {
  const commandList = {
    store: {
      name: 'store',
      summary: "Automatically sets up git credential storage with libsecret (on Linux Debian-based distros only)."
    },
    config: {
      name: 'config',
      summary: 'Set the default remote and commit message.'
    },
    s: {
      name: 's',
      description: 'Runs \'git status\'.'
    },
    b: {
      name: 'b',
      description: 'Runs \'git branch\'.'
    },
    M: {
      name: 'M',
      description: 'Merges two branches and pushes the merged branch.'
    } 
  };

  const sections = [    // Universal template
    {
    header: `Usage: gal` + (command ? ` ${command}` : '') + ` <options>`,
    content: commandList[command] ? commandList[command].summary : 'Adds, commits and pushes your entire branch.'
    },
    {
      header: 'Options',
      optionList: optionDefinitions
    },
    {
      content: 'See \'gal <command> -h\' for help with ' + (command ? 'another command or \'gal -h\' for a full list of commands.' : 'a specific command.')  
    }
  ];

  if (!command) {   // Show title and command list only for 'gal -h'
    sections.unshift({
      header: 'Git-push-all',
      content: 'A git utility to quickly commit and push your entire branch. Also automates setup of git credential storage with libsecret (on Linux Debian-based distros only).'
      });

    const commandDescriptions = [];

    for (x in commandList) {
      commandDescriptions.push(commandList[x]);
    }
    
    sections.splice(sections.length - 1, 0, {
      header: 'Command List',
      content: commandDescriptions
    })
  } 
  
  console.log(getUsage(sections));
}