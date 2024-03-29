const token = localStorage.getItem('token');
const groups = document.getElementById('groups');
const otherGroups = document.getElementById('otherGroups');

const backendAPIs = 'http://localhost:3000/group';

//getting all groups on screen
window.addEventListener('DOMContentLoaded', async() => {
    const response = await axios.get(`${backendAPIs}/getGroup`, {headers : {'Authorization' : token} });
    // console.log(response.data);

    if(!response.data.groups.length){
       groups.style.display = "none";
    }

    const groupsId = [];
    response.data.groups.forEach(ele => {
        groupsId.push(ele.id);
        groups.innerHTML += `
        <div  class="group-name" id="${ele.id}">${ele.name}
            <button class="exit-group">Exit Group</button>
        </div>
        `
    });

    const result = await axios.post(`${backendAPIs}/getAllGroups` , {groupsId : groupsId});
    console.log(result.data.AllOtherGroups);
    if(!result.data.AllOtherGroups.length){
        return otherGroups.style.display = "none";
     }

    result.data.AllOtherGroups.forEach(ele => {
        otherGroups.innerHTML += `
        <div  class="other-group-name" id="${ele.id}">${ele.name}
            <button class="join">JOIN</button>
        </div>
        `
    })
})

async function createGroup(event){
   try{
    event.preventDefault();
    const group_name = {groupName : event.target.groupName.value};
    event.target.groupName.value="";
    const response = await axios.post(`${backendAPIs}/createGroup`,group_name,{headers : {'Authorization' : token}});
    if(response.status === 201){
        if(groups.style.display == 'none'){
            groups.style.display = 'block';
         }   
        console.log('response is : ',response) 
        groups.innerHTML += `
        <div  class="group-name" id="${response.data.id}">${response.data.name}
            <button class="exit-group">Exit Group</button>
        </div>
        `
        alert('Group has created successfully !');
    } else{
        throw new Error('Failed to create new group');
    }
   } catch(err){
        console.log(err);
        alert(err.response.data.message);
   }  
}

// deleting a group or moving to chat window
groups.addEventListener('click' , async (e) => {
    
    if(e.target.classList.contains('group-name')){
       // console.log(e.target.innerText);
        const id = e.target.id;
        const name = e.target.innerText.split(" ")[0];
        
        localStorage.setItem('groupId', id);
        localStorage.setItem('groupName', name);
        return window.location.href = '../messages/index.html';
    }

    if(e.target.classList.contains('exit-group')){
        if(confirm(`Are you sure ?`)){
            try{
                const name = e.target.parentNode.innerText.split(' ')[0];
                const id = e.target.parentNode.id;
                const response = await axios.get(`${backendAPIs}/exitGroup/${id}`, { headers : {'Authorization' : token} });
                 //console.log('Response after deleting group',response.data);
            //     const message = response.data.message;
            //     if(response.status === 200){
            //         e.target.parentNode.remove();
            //         alert(message);
            //     } else if(response.status === 400){
            //         alert(response.data.message);
            //         throw new Error(response.data.message);
            //     }
            // }catch(err){
            //      console.log(err);
            //     alert(err);
            // }
            if(response.status === 200){
                e.target.parentNode.remove();
                alert(response.data.message);

                otherGroups.innerHTML += `
                    <div  class="other-group-name" id="${id}">${name}
                        <button class="join">JOIN</button>
                    </div>
                    `
            }    
    
        }catch(err){
            // console.log(err);
            alert(err.response.data.message);
        }
        }
    }
})


//for joining any other group.
otherGroups.addEventListener('click' , async (e) => {
    if(e.target.classList.contains('join')){
        //console.log('innertext',e.target.parentNode.innerText);
        const name = e.target.parentNode.innerText.split(' ')[0];
        //console.log('name',name);
        const id = e.target.parentNode.id;
        const result = await axios.get(`${backendAPIs}/join/${id}` , { headers : {'Authorization' : token} });
        // console.log(result);

        e.target.parentNode.remove();

        groups.innerHTML += `
        <div  class="group-name" id="${id}">${name}
            <button class="exit-group">Exit Group</button>
        </div>
        `
        if(groups.style.display == "none"){
            groups.style.display = "block";
        }

        alert(result.data.message);
    }
})

function logout(){
    if(confirm('Are you sure ?')){
        localStorage.clear();
        return window.location.href = '../login/login.html';
    }
}