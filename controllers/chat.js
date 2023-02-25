const Chats =  require('../models/chat');
//const uuid = require('uuid');
const User = require('../models/user');
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
         //const id = uuid.v4();
         const data = await Chats.create({ message, userId:req.user.id, name:req.user.name});
         return res.status(201).json({message: data, success: true});
      }
   } catch(err) {
      console.log(err);
      return res.status(500).json({message: err, success: false});
   }
}


const getMessage = async (req,res) => {
   try{
         const allChats = await Chats.findAll({
            attributes: ['message', 'userId', 'name']
         })
         return res.status(201).json({allChats: allChats , success: true});
      } catch(err) {
      console.log(err);
      return res.status(500).json({message: err, success: false});
   }
}

module.exports = {postMessage, getMessage}