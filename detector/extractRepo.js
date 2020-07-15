
// only supports form: 'git@github.com:pvinis/test-repo.git'

const extractRepo = (url) => {
	const [_first, rest] = url.split(':')
	const [name, _second] = rest.split('.gi')
	return name
}

module.exports = {extractRepo}
