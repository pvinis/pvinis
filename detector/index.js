#!/usr/bin/env node

const fs = require('fs')
// const spawn = require('cross-spawn')
const { spawn } = require('child_process')
const BadWords = require('bad-words')

const { extractRepo } = require('./extractRepo')


const filter = new BadWords()
const tmpFile = fs.readFileSync('/tmp/pvinis-commits', 'utf8')

const [url, ...commitLines] = tmpFile.split('\n')

const commits = commitLines.map(line => {
	const [hash, message] = line.split('::::')
	return { hash, message }
})
// console.log({commits})

const repo = extractRepo(url)
// console.log({repo})


let stop = false
commits.map(commit => {
	if (stop) { return } // ew
	if (commit.message === '' || commit.hash === '') { return }

	// console.log(`orig: ${commit.message}`)
	const isNaughty = filter.clean(commit.message) !== commit.message
	if (isNaughty) {
		console.log('you naaaasty')
		fs.writeFileSync(
			'/tmp/pvinis-commits-data.json',
			JSON.stringify({ repo, message: commit.message, hash: commit.hash}),
		)
		// const a = spawn('~/Source/pvinis/pvinis/scripts/delayed-update.sh', { detached: true })
		// spawn('ls > /tmp/pvinis-commits-data.json')
		spawn(`${process.env.HOME}/Source/pvinis/pvinis/scripts/update.sh`, {detached: true, stdio: "ignore"})
		stop = true
	} else {
		// console.log('clean')
		try {
			fs.unlinkSync('/tmp/pvinis-commits-data.json')
		} catch(err) {}
	}
})
