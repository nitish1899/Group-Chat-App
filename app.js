const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require("dotenv").config(); // At first, we need to require dotenv and then we will require sequelize because we are using dotenv in database.js
const sequalize = require('./util/database');
const errorController = require('./controllers/error');

const app = express();
app.use(cors({
    origin:" http://127.0.0.1:5555",
    credentials: true
}));

app.use(express.static('public'));
app.use(bodyParser.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));

const signupRoutes = require('./routes/user');
const forgotPasswordRoutes = require('./routes/forgotPassword');
const chatRoutes = require('./routes/chat');
const groupRoutes = require('./routes/group');

const User = require('./models/user');
const ForgotPassword = require('./models/forgotPassword');
const Chats = require('./models/chat');
const Group = require('./models/group');
const UserGroup = require('./models/userGroup');

User.hasMany(ForgotPassword);
ForgotPassword.belongsTo(User);

User.hasMany(Chats);
Chats.belongsTo(User);

Group.hasMany(Chats);
Chats.belongsTo(Group);

User.belongsToMany(Group, {through: UserGroup});
Group.belongsToMany(User, {through: UserGroup});

app.use('/user',signupRoutes);
app.use('/password',forgotPasswordRoutes);
app.use('/message', chatRoutes);
app.use('/group',groupRoutes);

app.use(errorController.get404);

// {force : true}

sequalize.sync()
.then(result =>{
    app.listen(process.env.PORT);
})
.catch(err =>{
    console.log(err);
})
