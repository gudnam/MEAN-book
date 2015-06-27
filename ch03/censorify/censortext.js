var censoredWords = ["sad", "bad", "mad"];
var customCensoredWords = [];
function censor(inStr) {
	for (index in censoredWords) {
		inStr = inStr.replace(censoredWords[index], '****');
	}

	for (index in customCensoredWords) {
		inStr = inStr.replace(customCensoredWords[index], '****');
	}

	return inStr;
}

function addCensoredWord(word) {
	customCensoredWords.push(word);
}

function getCensoredWords() {
	return censoredWords.concat(customCensoredWords);
}

exports.censor = censor;
exports.addCensoredWord = addCensoredWord;
exports.getCensoredWords = getCensoredWords;