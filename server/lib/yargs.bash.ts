#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { initRepository } from '../controllers/init.controller.js';
import { addFiles } from '../controllers/add.controller.js';
import { commitFiles } from '../controllers/commit.controller.js';
import { pushToRemote } from '../controllers/push.controller.js';
import { pullCommits } from '../controllers/pull.controller.js';
import { revertChanges } from '../controllers/revert.controller.js';


const argv = yargs(hideBin(process.argv))
  .command('init', 'initializes a .horizon repository', {}, initRepository)
  .command('add <file_name...>', 'adds files to the staging area', (yargs)=>{
     yargs.positional('file_name', {
        describe: 'the files to be added',
        type:"string",
        required:true
      }
    )
  }, addFiles)
  .command('commit', 'commits the staged files', {}, commitFiles)
  .command('push', 'pushes the committed files to the remote repository', {}, pushToRemote)
  .command('pull', 'pulls the committed files from the remote repository', {}, pullCommits)
  .command('revert', 'reverts the committed files', {}, revertChanges)
  .demandCommand(1, 'You need at least one command before moving on')
  .help().argv;
