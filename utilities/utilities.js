exports.utilities = {
	generateCSRFToken: function() {
		/*
			Function that generates a string of length 40 representing a token
			for each individual client that is logged in.
			In: none
			Out: token (string)
		*/
		let token = "";
		let availableCharacters = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

		for (let i = 65; i <= 90; i++) {
			availableCharacters.push(String.fromCharCode(i));
		}

		for (let i = 97; i <= 122; i++){
			availableCharacters.push(String.fromCharCode(i));
		}

		while (token.length < 40) {
			token += availableCharacters[Math.floor(Math.random() * (availableCharacters.length - 1))]
		}

		console.log(token);

		return token;
	}
}