const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

function generateAccessToken(id, email, name) {
    return jwt.sign({ userId : id , email: email, name: name}, process.env.TOKEN_SECRET);
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

exports.postLogin = async (req,res) => {
    try{   
        const {email,password} = req.body;
        console.log(email, password)
        if(isStringInvalid(email) || isStringInvalid(password)){
            return res.status(400).json({ message: 'Bad parameters. Something is missing', success: false});
        }
        const user = await User.findAll({where: {email: email }});
       // console.log(user)
        if(user.length >0){
            bcrypt.compare(password,user[0].password,(err,result) =>{
                if(err){
                    return res.status(500).json({ message : 'Something went wrong', success:false})
                } else if(result == true){
                    return res.status(201).json({ message: 'Login Successful', success: true, name: user[0].name, token : generateAccessToken(user[0].id, user[0].email, user[0].name)});
                } else {
                    return res.status(401).json({ message : 'Password is incorrect',  success: false});
                }
            })
        } else {
            return res.status(404).json({message : 'User does not exist', success: false});
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({error:err});
  }  
}
