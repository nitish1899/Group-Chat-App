const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require("dotenv").config();
const sequalize = require('./util/database');
const errorController = require('./controller/error');

const app = express();
app.use(cors());


//app.use(express.static('public'));
app.use(bodyParser.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));

const signupRoutes = require('./routes/user');

app.use('/user',signupRoutes);

app.use(errorController.get404);

// {force : true}

sequalize.sync()
.then(result =>{
    app.listen(process.env.PORT);
})
.catch(err =>{
    console.log(err);
})
