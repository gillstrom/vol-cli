#!/usr/bin/env node
'use strict';
const chalk = require('chalk');
const cliCursor = require('cli-cursor');
const firstRun = require('first-run');
const indentString = require('indent-string');
const meow = require('meow');
const progressControl = require('progress-control');
const toDecimal = require('to-decimal');
const toPercent = require('to-percent');
const vol = require('vol');

const cli = meow(`
	Usage
	  $ vol (Interactive CLI)
	  $ vol <level>
	  $ vol mute

	Examples
	  $ vol 65
`);

const updateBar = (level, bar) => vol.set(level).then(() => {
	const str = toPercent(level) + '%';
	const maxLength = 4;

	bar.update(level, {level: indentString(str, maxLength - str.length, ' ')});
});

const getBar = (level, text) => {
	const bar = progressControl(text, {total: 10}, {
		up() {
			level = Math.min(Math.round((level + 0.1) * 10) / 10, 1);
			updateBar(level, bar);
		},
		down() {
			level = Math.max(Math.round((level - 0.1) * 10) / 10, 0);
			updateBar(level, bar);
		}
	});

	return bar;
};

const main = level => {
	if (!process.stdin.isTTY) {
		console.log(level);
		return;
	}

	let text = '[:bar] :level';

	if (firstRun()) {
		text += `    ${chalk.dim('Use up/down arrows')}`;
	}

	const bar = getBar(level, text);

	cliCursor.hide();
	updateBar(level, bar);
};

if (cli.input.length === 0) {
	vol.get().then(level => main(level));
} else {
	vol.set(cli.input[0] === 'mute' ? 0 : toDecimal(cli.input[0]));
}
