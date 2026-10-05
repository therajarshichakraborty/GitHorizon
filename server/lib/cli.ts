#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { initRepository } from '../controllers/init.controller.js';
import { addFiles } from '../controllers/add.controller.js';
import { commitFiles } from '../controllers/commit.controller.js';
import { pushToRemote } from '../controllers/push.controller.js';
import { pullCommits } from '../controllers/pull.controller.js';
import { revertChanges } from '../controllers/revert.controller.js';

export const argv = yargs(hideBin(process.argv))
  .command('init', 'initializes a .horizon repository', {}, initRepository)
  .command(
    'add <file_name...>',
    'adds files to the staging area',
    yargs => {
      yargs.positional('file_name', {
        describe: 'the files to be added',
        type: 'string',
        required: true,
      });
    },
    addFiles,
  )
  .command(
    'commit',
    'commits the staged files',
    yargs => {
      yargs.option('message', {
        alias: 'm',
        describe: 'commit message',
        type: 'string',
        demandOption: true,
      });
    },
    commitFiles,
  )
  .command(
    'push [remote] [branch]',
    'pushes the committed files to the remote repository',
    yargs => {
      yargs
        .positional('remote', {
          describe: 'the remote repository',
          type: 'string',
          default: 'origin',
        })
        .positional('branch', {
          describe: 'the branch to push to',
          type: 'string',
          default: 'main',
        });
    },
    pushToRemote,
  )
  .command(
    'pull [remote] [branch]',
    'pulls the committed files from the remote repository',
    yargs => {
      yargs
        .positional('remote', {
          describe: 'the remote repository',
          type: 'string',
          default: 'origin',
        })
        .positional('branch', {
          describe: 'the branch to pull from',
          type: 'string',
          default: 'main',
        });
    },
    pullCommits,
  )
  .command(
    'revert <commit_id>',
    'reverts the committed files',
    yargs => {
      yargs.positional('commit_id', {
        describe: 'the commit ID to revert to',
        type: 'string',
        required: true,
      });
    },
    revertChanges,
  )
  .demandCommand(1, 'You need at least one command before moving on')
  .help().argv;
