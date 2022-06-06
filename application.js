const express = require('express');
const jwt = require('jsonwebtoken');

const application = express();

const port = 3000;

const users = [];

const authenticate = (request, response, next) => {
	const token = request.headers.authorization;
	if (!token) {
		response.status(403).send('Authorization token missing');
	} else {
		try {
			const decodedToken = jwt.verify(token, 'tokenKey');
			request.session = decodedToken;
		} catch (error) {
			response.status(401).send('Invalid token');
		}
	}

	return next();
}

application.use(express.json());

application.get('/', (request, response) => {
	response.json(users);
})

application.post('/signup', (request, response) => {
	const { username, password, fullName } = request.body;
	const existingUser = users.find(item => item.username === username)
	if (existingUser) {
		response.status(400).send('User already exists');
	} else {
		users.push({ username, password, fullName });
		const token = jwt.sign({ username }, 'tokenKey', { expiresIn: 1 });
		response.status(201).send(token);
	}
})

application.post('/signin', (request, response) => {
	const { username, password } = request.body;
	const existingUser = users.find(item => item.username === username)
	if (!existingUser) {
		response.status(400).send('User does not exist');
	} else {
		if (existingUser.password !== password) {
			response.status(400).send('User does not exist');
		} else {
			const token = jwt.sign({ username }, 'tokenKey', { expiresIn: '0s' });
			response.status(201).send(token);
		}
	}
})

application.get('/testing-authentication', authenticate, (request, response) => {
	response.json(request.session);
})

application.listen(port, () => { console.log(`Example application running at port ${port}`) })
