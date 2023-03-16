const backendAPIs = 'http://13.127.223.190:3000/user';

async function login(event) {
    try{
        event.preventDefault();
        loginDetails = {
            email: event.target.email.value,
            password: event.target.password.value
        }
        
        document.getElementById('email').value = "";
        document.getElementById('password').value = "";
    
        const response = await axios.post(`${backendAPIs}/login`, loginDetails,{Credentials: "include"});
        if(response.status === 201){
            alert(response.data.message);
            console.log(response.data.message);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userName', response.data.name);
            localStorage.setItem('email',response.data.email);
            window.location.href = '../group/group.html';
        } else {
            throw new Error(" Failed to Login");
        }
    } catch(err) {
        document.body.innerHTML=`<div style="color:red">${err}</div>`
    }
    
}