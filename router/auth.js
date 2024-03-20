const axios = require('axios');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch')
require('dotenv').config()

const clientID = process.env.CLIENTID
const clientSecret = process.env.CLIENTSECRET
const redirectURI = process.env.REDIRECTURI

async function codeTokenExchange(request){
    const url = `https://www.googleapis.com/oauth2/v4/token?code=${request.query.code}&client_id=${clientID}&client_secret=${clientSecret}&grant_type=authorization_code&redirect_uri=${redirectURI}`;
	const data = await fetch(url, {
		method: 'POST',
		headers: {'Content-Type': 'application/x-www-form-urlencoded'}
	});
	const response = await data.json();
	return response;
}

async function retrieveUserData(accessToken, idToken){
	const url = `https://www.googleapis.com/oauth2/v3/userinfo`;
	const userInfo = await axios.get(url, {
		headers: {
			'Authorization': `Bearer ${accessToken}`,
		}
	})
	// const decoded = jwt.decode(idToken)
	return userInfo.data;
}

module.exports = {
	codeTokenExchange,
	retrieveUserData
}