const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
	{
		fullName: String,
		followers: Number
	},
	{ collection: "users" }
);

const User = mongoose.model("User", UserSchema);

module.exports = {
	User
};
