const chats =  require('../models/chat');
const archivedChat = require('../models/archievedChat');

const allChats = chats.findAll({
    attributes : ['message','userId','groupId','createdAt']
})

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