const token = localStorage.getItem('token');
const groupId = localStorage.getItem('groupId');
const groupName = localStorage.getItem('groupName');
let userEmail = localStorage.getItem('email');
let username = localStorage.getItem('userName');

const backendAPIs = 'http://localhost:3000/message';

const chat = document.getElementById('chat');
//const groupList = document.getElementById('contacts');
// const userName = document.getElementById('username');
// const groupname = document.getElementById('groupname');

let flag = true;

//At every 2 sec getting all messages , storing it in local storage and showing it  on frontend.
// setInterval(async () => {
//   await dom();
// }, 2000);

//whenever page get refresh, we are sending last messageId of perticular group to backend and getting all messages of respective group.
window.addEventListener('DOMContentLoaded', dom());

async function dom(){
  document.getElementById('groupname').innerText = groupName;
  document.getElementById('username').innerText = username;

  let message = JSON.parse(localStorage.getItem(`messages${groupId}`));

  if (message == undefined || message.length == 0) {
      lastMessageId = 0;
  } else {
      lastMessageId = message[message.length - 1].id;
  }


    const response = await axios.get(`${backendAPIs}/getMessage/${groupId}?lastMessageId=${lastMessageId}`,{ headers: { 'Authorization': token } });
  
  
   //console.log(response.data);
  const backendArray = response.data.arrayOfMessages;
   console.log(backendArray);
  if(flag == false && backendArray.length==0){
      return ;
  }else{
      chatArray = [];
      chat.innerHTML = ""; 
      //const dateOfUser = date(backendArray[0].createdAt);
      //chat.innerHTML += `<h3 style="align-items: center;">${dateOfUser}<h3>`;
  }

  if (message) {
      chatArray = message.concat(backendArray);
  } else {
      chatArray = chatArray.concat(backendArray);
  }
  

  if (chatArray.length > 20) {
      chatArray = chatArray.slice(chatArray.length - 20);
  }

  const localStorageMessages = JSON.stringify(chatArray);

  localStorage.setItem(`messages${groupId}`, localStorageMessages);

  // console.log(`messages===>`, JSON.parse(localStorage.getItem(`messages${groupId}`)));

  //display all messages on frontend.
  chatArray.forEach(ele => {
      // console.log(ele.message);
      if (ele.currentUser) {
          showMyMessageOnScreen(ele);
      } else {
          showOtherMessgeOnScreen(ele);
      }
  });
  
  flag = false;
  // scroll the chat to vertical position 
  if(backendArray.length){
      chat.scrollTo(0, chat.scrollHeight);
  }
}

//function to show other's messages on screen.
function showOtherMessgeOnScreen(obj) {
    const timeForUser = time(obj.createdAt);

    if(obj.message.indexOf('https://') == 0 || obj.message.indexOf('http://') == 0){
        chat.innerHTML += `
        <li class="you">
            <div class="entete">
                <span class="status green"></span>
                <h2>${obj.name}</h2>
            </div>
            <div class="triangle"></div>
            <div class="message">
                <a href="${obj.message}">${obj.message}</a>
                <br><div class="float-end"> </small><small><small><small>${timeForUser}</small></small></small></div>
            </div>
        </li>
      `
    }else{
        chat.innerHTML += `
        <li class="you">
            <div class="entete">
                <span class="status green"></span>
                <h2>${obj.name}</h2>
            </div>
            <div class="triangle"></div>
            <div class="message">
                ${obj.message}
                <br><div class="float-end"> </small><small><small><small>${timeForUser}</small></small></small></div>
            </div>
        </li>
      `
    }    
}

//function to show my messages on screen.
function showMyMessageOnScreen(obj) {
    const timeForUser = time(obj.createdAt);
    if(obj.message.indexOf('https://') == 0 || obj.message.indexOf('http://') == 0){
        chat.innerHTML += `
            <li class="me">
            <div class="entete">
              <h2>${username}</h2>
              <span class="status blue"></span>
            </div>
            <div class="triangle"></div>
            <div class="message">
                <a href="${obj.message}">Link</a>
                <br><div class="float-end"> </small><small><small><small>${timeForUser}</small></small></small></div>
            </div>
          </li>
          `
    }else{
        chat.innerHTML += `
            <li class="me">
            <div class="entete">
              <h2>${username}</h2>
              <span class="status blue"></span>
            </div>
            <div class="triangle"></div>
            <div class="message">
              ${obj.message}
              <br><div class="float-end"> </small><small><small><small>${timeForUser}</small></small></small></div>
            </div>
          </li>
          `
    }
}


//whenever sending messages in group.
async function sendMessage(event){
    try {
        event.preventDefault();
        const message = event.target.message.value;
        const response = await axios.post(`${backendAPIs}/sendMessage/${groupId}`, { message: message }, { headers: { 'Authorization': token } });
        console.log(response.data);
        showMyMessageOnScreen(response.data.data);
        event.target.message.value = "";

    } catch (err) {
        console.log(err);
        if (err.response.status == 400) {
            err.target.message.value = null;
            return alert(err.response.data.message);
        }
        return document.body.innerHTML += `<div class="error">Something went wrong !</div>`;
    }
}

//to add user inside group by searching his email in input box.
async function AddNewUser(event){
    try {
        event.preventDefault();
        const email = event.target.email.value;
        const response = await axios.post(`${backendAPIs}/addUser/${groupId}`, { email: email }, { headers: { 'Authorization': token } });

        console.log(response);

        alert(response.data.message);
    } catch (err) {
        console.log(err);
        alert(err.response.data.message);
    }

    event.target.email.value = "";
}


  //convert string to getting time in 11:06 PM formet.
function time(string) {
    const time_object = new Date(string);
    return time_object.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
}

//convert string to getting date/Today/Yesterday.
function date(string) {
    const today = new Date();
    const date_object = new Date(string);

    const today_date = `${today.getDate()}-${(today.getMonth() + 1)}-${today.getFullYear()}`;
    const yesterday_date = `${today.getDate() - 1}-${(today.getMonth() + 1)}-${today.getFullYear()}`;
    const gettingDate = `${date_object.getDate()}-${(date_object.getMonth() + 1)}-${date_object.getFullYear()}`;

    if (today_date == gettingDate) {
        return 'Today';
    } else if (gettingDate == yesterday_date) {
        return 'Yesterday'
    }
    
    return date_object.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}  

//burger button functionallity
const allName = document.getElementById('group');

const burgerButton = document.querySelector(".burger-button");
const burgerMenu = document.querySelector(".burger-menu");

burgerButton.addEventListener("click", function() {
    burgerButton.classList.toggle("active");
    burgerMenu.classList.toggle("active");
    openBox();
});


//getting all users and admin details.
let numOfUsers;
async function openBox() {
    const users = await axios.get(`${backendAPIs}/getUsers/${groupId}`);
    // console.log(users.data);
    numOfUsers = users.data.userDetails.length;

    allName.innerHTML = `
    <li class="names"><u>User(${numOfUsers})</u><span style="float:right;"><u>Admin Status</u></span></li>
    `
    if (users.data.adminEmail.includes(userEmail)) {
        users.data.userDetails.forEach(user => {
            displayNameForAdmin(user);
        })
    } else {
        users.data.userDetails.forEach(user => {
            displayNameForOther(user);
        })
    }

}

//if user is an Admin
function displayNameForAdmin(user) {
    if (user.isAdmin) {
        allName.innerHTML += `
        <li class="names" id="name${user.email}">${user.name}<button class="delete" onClick="deleteUser('${user.email}')">X</button><button id="admin${user.email}" class="userButton float-end" onClick="removeAdmin('${user.email}')">remove admin</button></li>
        `
    } else {
        allName.innerHTML += `
        <li class="names" id="name${user.email}">${user.name}<button class="delete" onClick="deleteUser('${user.email}')">X</button><button id="admin${user.email}" class="userButton float-end" onClick="makeAdmin('${user.email}')">make admin</button></li>
        `
    }
    if (user.email == userEmail) {
        document.getElementById(`name${userEmail}`).style.color = "rgb(186, 244, 93)";
    }
}

//if user is not Admin.
function displayNameForOther(user) {
    if (user.isAdmin) {
        allName.innerHTML += `
        <li class="names" id="name${user.email}">${user.name}</button><button class="userButton">✔️</button></li>
        `
    } else {
        allName.innerHTML += `
        <li class="names" id="name${user.email}">${user.name}</li>
        `
    }

    if (user.email == userEmail) {
        document.getElementById(`name${userEmail}`).style.color = "rgb(186, 244, 93)";
        document.getElementById(`name${userEmail}`).innerHTML += `
        <button class="delete" onClick="deleteUser('${userEmail}')">X</button>
        `
    }
}

//making another user as an Admin.
async function makeAdmin(email) {
    // console.log(email);
    try {
        const response = await axios.post(`${backendAPIs}/makeAdmin/${groupId}`, { email: email }, { headers: { 'Authorization': token } });
        console.log('make admin response',response);
        document.getElementById(`admin${email}`).innerText = 'remove admin';
        document.getElementById(`admin${email}`).setAttribute('onClick', `removeAdmin('${email}')`);

        alert(response.data.message);
    } catch (err) {
        console.log(err);
        alert(err.response.data.message);
    }

}

//delete user from the group.
async function deleteUser(email) {
    if (confirm('Are you sure')) {
        try {
            //console.log(email);
            const response = await axios.post(`${backendAPIs}/deleteUser/${groupId}`, { email: email }, { headers: { 'Authorization': token } });
            //console.log(response);
            allName.removeChild(document.getElementById(`name${email}`));
            
            numOfUsers = +numOfUsers - 1;
            allName.firstElementChild.firstElementChild.innerText = `User(${numOfUsers})`;

            alert(response.data.message);
        } catch (err) {
            console.log(err);
            alert(err.response.data.message);
        }
    }
}

//delete admin functionallity from any Admin user.
async function removeAdmin(email) {
    try {
        if(confirm(`Are you sure ?`)){
            //console.log(email);
            const response = await axios.post(`${backendAPIs}/removeAdmin/${groupId}`, { email: email }, { headers: { 'Authorization': token } });
            //console.log(response);
            document.getElementById(`admin${email}`).innerText = 'make admin';
            document.getElementById(`admin${email}`).setAttribute('onClick', `makeAdmin('${email}')`);
    
            alert(response.data.message);
        }
    } catch (err) {
        console.log(err);
        alert(err.response.data.message);
    }
}

const menu = document.getElementById('features');

menu.addEventListener('click' , async (e) => {
    if(e.target.classList.contains('LogOut')){
        if(confirm('Are you sure ?')){
            localStorage.clear();
            return window.location.href = '../login/login.html';
        }
    }

    if(e.target.classList.contains('NewGroup')){
        window.location.href="../group/group.html";
    }

})

// const divContainer = document.querySelector('.groupDetails');
// let isClicked = true;
// async function showOrHide(){
//     if(isClicked){
//         divContainer.style.display = 'block';
//         isClicked = false;
//     } else {
//         divContainer.style.display = 'none';
//         isClicked = true;
//     }

// } 