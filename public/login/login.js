async function login(event) {
    try{
        event.preventDefault();
        loginDetails = {
            email: event.target.email.value,
            password: event.target.password.value
        }
        
        document.getElementById('email').value = "";
        document.getElementById('password').value = "";
    
        // const response = await axios.post('http://localhost:3000/user/login',loginCredentials,{Credentials:"include"});
        const response = await axios.post('http://localhost:3000/user/login', loginDetails,{Credentials: "include"});
        if(response.status === 201){
            alert(response.data.message);
            console.log(response.data.message);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userName', response.data.name);
            window.location.href = '../chat/chat.html';
        } else {
            throw new Error(" Failed to Login");
        }
    } catch(err) {
        document.body.innerHTML=`<div style="color:red">${err}</div>`
    }
    
}