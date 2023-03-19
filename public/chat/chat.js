const token = localStorage.getItem('token');
const userName = localStorage.getItem('userName');
const messageList = document.getElementById('message');
const user = document.getElementById('user');
const child = `<li id=${userName}>${userName} joined</li>`
user.innerHTML = user.innerHTML + child; 

const backendAPIs = 'http://localhost:3000/message';

async function sendMessage(event){
    event.preventDefault();
    const newMessageDetails = {
      message: event.target.message.value
    }
    document.getElementById('Message').value="";
    const response = await axios.post(`${backendAPIs}/sendMessage`, newMessageDetails, { headers: {"Authorization" : token}});
    showMessages();
}

async function showMessages(){
  try{
    let lastmsgId = 0;
    let oldMessage ;
    if(localStorage.getItem('messages')){
        console.log('true')
      if(JSON.parse(localStorage.getItem('messages')).length !== 0){
       //console.log('before push operation', oldMessage);
        oldMessage = JSON.parse(localStorage.getItem('messages'));
       // console.log('after push operation',oldMessage);
        lastmsgId = oldMessage[oldMessage.length-1].id;
      }
    } else{
      console.log('false');
    }
   // console.log('oldMessages : ',oldMessage);

    const response = await axios.get(`${backendAPIs}/getLastMessage?lastmsgId=${lastmsgId}`, { headers: {"Authorization" : token}});
    if(response.status === 201){
     // console.log("current response",response.data.lastmsg);
      let newMessage = response.data.lastmsg;
      let Messages;
      let lastTenMessages = [];
      if(oldMessage){
          Messages = [...oldMessage , ...newMessage] ;
          if(Messages.length>10){
            for(let i= Messages.length-10 ; i < Messages.length ; i++){
                lastTenMessages.push(Messages[i]);
            }
            localStorage.setItem('messages',JSON.stringify(lastTenMessages));
          } else {
           // console.log('updated messages',Messages);
            localStorage.setItem('messages',JSON.stringify(Messages));
          }
      } else {
        localStorage.setItem('messages',JSON.stringify(newMessage));
      }
    
      messageList.innerHTML = ""; 
      let Message = JSON.parse(localStorage.getItem('messages'));
      Message.forEach((msg) => {
        const childNode = `<li>${msg.name} :${msg.message}</li>`
        messageList.innerHTML = messageList.innerHTML + childNode; 
      })
   }
  } catch(err) {
    console.log(err);
  }
}

window.addEventListener("load", async ()=>{
  showMessages();
}) 