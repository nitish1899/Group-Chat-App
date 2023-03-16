/*

const Chats =  require('../models/chat');
const User = require('../models/user');
const {Op} = require('sequelize');

function isStringValid(string){
   if(string == undefined || string.length === 0 ){
      return true;
   }
   return false;
}

const postMessage = async (req,res) => {
   try{
      const {message} = req.body;
      if(isStringValid(message)) {
         return res.status(404).json('Message is not found');
      } else {
         const data = await Chats.create({ message, userId:req.user.id, name:req.user.name});
         const Message= {message: data.message, id: data.id, name: data.name};
         return res.status(201).json({Message, success: true});
      }
   } catch(err) {
      console.log(err);
      return res.status(500).json({message: err, success: false});
   }
}


const getMessage = async (req,res) => {
   try{ const {lastmsgId} = req.query ;
         const lastmsg = await Chats.findAll({
            where: { id : { [Op.gt] : lastmsgId } },
            attributes: ['id', 'message', 'name']
         })
         console.log("last message is : ",lastmsg);
         return res.status(201).json({lastmsg , success: true});
      } catch(err) {
      console.log(err);
      return res.status(500).json({message: err, success: false});
   }
}

module.exports = {postMessage, getMessage}
*/

const Chat = require('../models/chat');
const User = require('../models/user');
const Group = require('../models/group');
const UserGroup = require('../models/userGroup');

const { Sequelize, Op } = require("sequelize");

function isStringValid(string){
   if(string == undefined || string.length === 0 ){
      return true;
   }
   return false;
}

const sendMessage = async (req, res) => {
    try {
        console.log(req.body);
        const { message } = req.body;
        const { groupId } = req.params;

        if(isStringValid(message)) {
         return res.status(404).json('Message not found');
      } else {
        const isUserInGroup = await UserGroup.findOne({ where: { userId: req.user.id, groupId: groupId } });
        if (!isUserInGroup) {
            return res.status(400).json({ success: false, message: 'You are no longer in group now !' });
        }

        let result = await req.user.createChat({
            message: message,
            groupId: groupId,
        })

        const data = { message: result.message, createdAt: result.createdAt };

        return res.status(200).json({ success: true, data });
      }

    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'Something went wrong !' })
    }
}


const getMessage = async (req, res) => {
    try {
        let msgId = req.query.lastMessageId;
        let { groupId } = req.params;
        console.log(`msgId`, msgId);
        console.log(`groupid is ==> ${groupId}`);

        let messages = await Chat.findAll({
            attributes: ['id' , 'message' , 'createdAt'],
            where : {
                groupId : groupId,
                id : { [Op.gt]: msgId}
            },
            include : [
                {model : User, attributes: ['name' , 'id']}
            ]
        });

        
        console.table(JSON.parse(JSON.stringify(messages)));
        
        const arrayOfMessages = messages.map(ele => {
            if(ele.user.id == req.user.id){
                return { id : ele.id , message : ele.message , createdAt : ele.createdAt, name: ele.user.name, currentUser: 'same user'};
            }
            return { id : ele.id , message : ele.message , createdAt : ele.createdAt, name: ele.user.name};
        })
        // console.table(arrayOfMessages);


        res.status(200).json({ success: true, arrayOfMessages });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: `Something went wrong` });
    }

}



const addUser = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const { email } = req.body;

        if(isStringValid(email)) {
         return res.status(500).json({ success: false, message: `Bad request !` });
      } else {
         const checkUserIsAdmin = await UserGroup.findOne({ where: { userId: req.user.id, groupId: groupId } });
         if (!checkUserIsAdmin.isAdmin) {
             return res.status(500).json({ success: false, message: `Only admin can add users !` });
         }
 
         if (req.user.email == email) {
             return res.status(500).json({ success: false, message: `Admin is already in group !` });
         }
 
         const user = await User.findOne({ where: { email: email } });
         if (!user) {
             return res.status(500).json({ success: false, message: `User doesn't exist !` });
         }
         const alreadyInGroup = await UserGroup.findOne({ where : {userId : user.id, groupId: groupId}});
         if(alreadyInGroup){
             return res.status(500).json({ success: false, message: `User is already in group !` });
         }
 
         const data = await UserGroup.create({
             userId: user.id,
             groupId: groupId,
             isAdmin: false
         })
 
         res.status(200).json({ success: true, message: 'User successfully added !', data });
      }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: `Something went wrong !` });
    }
}

const getUsers = async (req, res, next) => {
    try{
        const { groupId } = req.params;
        const data = await UserGroup.findAll({
            attributes: ['userId' , 'isAdmin'],
            where: { groupId: groupId } });
       // console.log('usergroup dta atre ',data);
        const users = data.map(element => {
            const ele = JSON.parse(JSON.stringify(element));
            return { id: ele.userId, isAdmin: ele.isAdmin };
        });
        //console.log('users of my group are',users);
        const userDetails = [];
        let adminEmail = [];

        for (let i = 0; i < users.length; i++) {
            const user = await User.findOne({ where: { id: users[i].id } });
            userDetails.push({ name: user.name, isAdmin: users[i].isAdmin, email: user.email });
            if (users[i].isAdmin) {
                adminEmail.push(user.email);
            }
        }

        res.status(200).json({ success: true, userDetails, adminEmail });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Something went wrong !' })
    }
}


const makeAdmin = async (req, res, next) => {
   try{
    console.log(req.body);
    const { email } = req.body;
    const { groupId } = req.params;

    if(isStringValid(email)) {
      return res.status(400).json({ success: false, message: `Bad request !` });
   } else {

        const checkUserIsAdmin = await UserGroup.findOne({ where: { groupId: groupId, userId: req.user.id } });
        if (checkUserIsAdmin.isAdmin == false) {
            return res.status(400).json({ success: false, message: `Only Admin have this permission !` });
        }

        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return res.status(400).json({ success: false, message: `this user doesn't exist in database !` });
        }

        // console.log(user);
        const data = await UserGroup.update({
            isAdmin: true
        }, { where: { groupId: groupId, userId: user.id } });


        res.status(200).json({ success: true, message: `Now ${user.name} is Admin of this group !` });
      }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'Something went wrong !' });
    }
}



const deleteUser = async (req, res, next) => {
   try{
    console.log(req.body, req.params);
    const { groupId } = req.params;
    const { email } = req.body;


        const checkUser = await UserGroup.findOne({ where: { groupId: groupId, userId: req.user.id } });
        if (!checkUser) {
            return res.status(400).json({ success: false, message: `You are no longer in group !` });
        }

        const allAdmins = await UserGroup.findAll({ where: { groupId: groupId, isAdmin: true } });
        
        //if user try to delete himself.
        // if (req.user.email == email && !checkUser.isAdmin) {
        //     await checkUser.destroy();
        //     return res.status(200).json({ success: true, message: `User has been deleted from group !` });
        // }

        //check whether user is not an admin.
        if (checkUser.isAdmin == false) {
            return res.status(400).json({ success: false, message: `Only admin can delete members from groups !` });
        }

        if (req.user.email == email) {
            if(allAdmins.length>1){
                await checkUser.destroy();
                return res.status(200).json({ success: true, message: `User has been deleted from group !` });
            }else{
                return res.status(400).json({ success: false, message: `Make another user as an Admin !` });
            }
        }

        const user = await User.findOne({ where: { email: email } });
        const usergroup = await UserGroup.findOne({ where: { userId: user.id, groupId: groupId } });

        if (usergroup) {
            usergroup.destroy();
            return res.status(200).json({ success: true, message: `User ${user.name} is deleted successfully !` });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: `Something went wrong !` });
    }

}


const removeAdmin = async (req, res, next) => {
    console.log(req.body, req.params);
    const { email } = req.body;
    const { groupId } = req.params;
    try {

        const checkUserIsAdmin = await UserGroup.findOne({ where: { groupId: groupId, userId: req.user.id } });
        if (checkUserIsAdmin.isAdmin == false) {
            return res.status(500).json({ success: false, message: `Only Admin have this permission !` });
        }

        const user = await User.findOne({ where: { email: email } });
        const allAdmins = await UserGroup.findAll({ where: { groupId: groupId, isAdmin: true } });

        if (allAdmins.length == 1) {
            return res.status(500).json({ success: false, message: `make another user as an Admin !` })
        }

        const data = await UserGroup.update({
            isAdmin: false
        }, { where: { userId: user.id, groupId: groupId } });

        res.status(200).json({ success: true, message: `User ${user.name} is no longer admin now !` });
    } catch (err) {
        console.log(err);
        res.status(400).json({ success: false, message: `Something went wrong !` });
    }

}

const AWS = require('aws-sdk');

updloadToS3 = (file, filename) => {
    let s3Bucket = new AWS.S3({
        accessKeyId: process.env.IAM_USER_KEY,
        secretAccessKey: process.env.IAM_USER_SECRET,
    })
    var params = {
        Bucket: process.env.BUCKET_NAME,
        Key: filename,
        Body: file,
        ACL: 'public-read'
    }
    return new Promise((resolve, reject) => {
        s3Bucket.upload(params, (err, s3responce) => {
            if (err) {
                console.log(`Something went wrong`, err);
                reject(err);
            } else {
                console.log(`work has done ===>`, s3responce);
                resolve(s3responce.Location);
            }
        })
    })
}

const sendFile = async (req, res, next) => {
    try{
        console.log(req.body);
        console.log(req.params);
        console.log(req.file);
        const { groupId } = req.params;
        if(!req.file){
           return res.status(400).json({ success: false, message: `Please choose file !` });
        }
    
        let type = (req.file.mimetype.split('/'))[1];
        console.log('type', type)
        const file = req.file.buffer;
        const filename = `GroupChat/${new Date()}.${type}`;
        console.log(`file ===>`, file );
        console.log('filename ====>', filename);
        const fileUrl = await updloadToS3(file,filename);
        console.log('fileUrl =============>',fileUrl);
    
        let result = await req.user.createChat({
            message: fileUrl,
            groupId: groupId
        })
        const data = { message: result.message, createdAt: result.createdAt };
        res.status(200).json({ success: true, data });
    }catch(err){
        console.log(err);
        res.status(400).json({ success: false, message: `Something went wrong !` });
    }
}

module.exports = {
    sendMessage, 
    getMessage,
    getUsers,
    addUser,
    makeAdmin,
    deleteUser,
    removeAdmin,
    sendFile
}