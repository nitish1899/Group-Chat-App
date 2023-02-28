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