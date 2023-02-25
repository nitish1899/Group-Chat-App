const token = localStorage.getItem('token');
const userName = localStorage.getItem('userName');
const parent = document.getElementById('user');
const child = `<li id=${userName}>${userName} joined</li>`
parent.innerHTML = parent.innerHTML + child; 

async function sendMessage(event){
    event.preventDefault();
    const newMessageDetails = {
      message: event.target.message.value
    }

    const response = await axios.post('http://localhost:3000/message/sendMessage', newMessageDetails, { headers: {"Authorization" : token}});
    console.log(response.data.message);
    addNewChatToUI(response.data.message);
}

function addNewChatToUI(chat){
const parentNode = document.getElementById('message');
const childNode = `<li>${chat.name} :${chat.message}</li>`
parentNode.innerHTML = parentNode.innerHTML + childNode; 
}

window.addEventListener("load", async ()=>{
  const response = await axios.get(`http://localhost:3000/message/getMessage`, { headers: {"Authorization" : token}});
  console.log("Nitish this is response\n");
  console.log(response.data.allChats);
 
  if(response.status === 201){
    for(var i=0;i<response.data.allChats.length;i++){
      addNewChatToUI(response.data.allChats[i]);
    }
  } 
})