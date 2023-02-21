const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const User = require('../models/user');
require("dotenv").config();

function isStringInvalid(string){
    if(string == undefined || string.length === 0){
        return true;
    } else {
        return false;
    }
}

exports.postSignUp = async (req,res) => {
    try{
        const {name,email,password,phNo} = req.body;
        if(isStringInvalid(name) || isStringInvalid(email) || isStringInvalid(password) || isStringInvalid(phNo)){
            return res.status(400).json({ message: 'Bad parameters. Something is missing', success: false});
        }
        const saltRounds = 10;
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err){
                console.log(err);
                throw new Error(err);
            }
            bcrypt.hash(password, salt, async function(err, hash) {
                if(err){
                    console.log(err);
                    throw new Error(err);
                }

                const user = await User.findAll({where: {email: email }}); 
                //console.log(user);
                if(user.length > 0){
                    res.status(201).json({message : 'User already exist'});
                } else{
                        //console.log(req.body);
                        const data = await User.create({name:name, email:email, password:hash, phNo:phNo });
                        res.status(201).json({message: 'Successfully created new user'});
                    }
            })
        })
    }
    catch(err) {
        console.log(err);
        res.status(500).json({error:err});
  }
}
