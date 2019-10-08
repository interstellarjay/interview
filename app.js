const express = require("express");
const app = express();
const axios = require("axios");
const mongoose = require("mongoose");
const { User } = require("./models/User");

/* @TODO - Use router */

// Connect to local mongo database named interview
mongoose.connect("mongodb://localhost:27017/interview", {
	useNewUrlParser: true
});

app.get("/users/all", async (req, res) => {
	let docs;
	try {
		docs = await User.find({});
	} catch (error) {
		return res.status(400).send({ error });
	}

	return res.status(200).send(docs);
});

app.post("/users/:username", async (req, res) => {
	// Username from request
	const _username = req.params.username;

	// Fetch data from Instagram
	let result;
	try {
		result = await axios.get(`https://www.instagram.com/${_username}/`);
	} catch (error) {
		return res.status(404).send({ error });
	}

	// Crawl the response
	const regex = /window\._sharedData = (.*);<\/script>/.exec(result.data)[1];
	const parsedResult = JSON.parse(regex);

	// Extract user information
	const user = parsedResult.entry_data.ProfilePage[0].graphql.user;
	const fullName = user.full_name;
	const followers = user.edge_follow.count;
	const userData = { fullName, followers };

	// Exit if the user already exists in db
	const isUserAlreadyInDatabase = await User.find({ fullName: fullName });
	if (isUserAlreadyInDatabase.length > 0) {
		return res
			.status(400)
			.send({ error: "User already exists", isUserAlreadyInDatabase });
	}

	// Save user details in db
	let doc;
	try {
		doc = await User.create(userData);
	} catch (error) {
		return res.status(400).send({ error });
	}

	// Return the data
	return res.status(200).send(doc);
});

//Listen on port
app.listen(8080);
