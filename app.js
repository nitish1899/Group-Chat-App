const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require("dotenv").config(); // At first, we need to require dotenv and then we will require sequelize because we are using dotenv in database.js
const sequalize = require('./util/database');
const path = require('path');
const errorController = require('./controllers/error');
const chats =  require('./models/chat');
const archivedChat = require('./models/archievedChat');

const app = express();
app.use(cors({
    origin:"*",
    credentials: true
}));

//app.use(express.static('public')); // To serve static files
// express.static is a middleware function in express. Here public specify the root directory from which to serve static assets.
// express looks up the files relative to static directory , so the name of the static directory is not part of the URL

app.use(bodyParser.json({ extended: false })); // body object will only include string or array
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

app.use((req,res) => {
    console.log('Requested URL: ',req.url);
    res.sendFile(path.join(__dirname, `public/${req.url}`));
})

app.use(errorController.get404);

// {force : true} // This will drop table if exists before trying to create the table - if we force ,existing table will be overwritten
// {force : false} // This will not drop the table, but create the table if not exist .
// {alter : true , force : false} // This will keep existing data and update the schema.

// The Sequelize instance method sync() is used to synchronise your Sequelize model with your database tables.
sequalize.sync({force : false})
.then(result =>{
    app.listen(process.env.PORT);
})
.catch(err =>{
    console.log(err);
})

var CronJob = require('cron').CronJob;
var Job = new CronJob('1 1 3 * * *', 
                async function() {
                    //console.log(" Hello");
                    const allChats = await chats.findAll({
                        attributes : ['message','userId','groupId','createdAt']
                    })
                    console.log("allchats type is ",allChats);
                    console.log("allchats are ====> ", JSON.parse(JSON.stringify(allChats)));

                    allChats.forEach( msg => {
                        const durationofmsg = (new Date().getTime()) - ((msg.createdAt).getTime());
                        console.log('Date ==> createdAt format : ', durationofmsg );
                        const hour = Math.ceil(durationofmsg/(1000*60*60));
                        if(hour < 24) {
                            moveMsgToArchievedChat(msg);
                            chats.destroy({
                                where :{ message : msg.message, userId : msg.userId, groupId : msg.groupId}
                            })
                        }
                    });

                    async function moveMsgToArchievedChat(msg){
                        const response = await archivedChat.create({message : msg.message, userId : msg.userId, groupId : msg.groupId});
                    }
                },
                null,
                true,
                'America/Los_Angeles'
            );