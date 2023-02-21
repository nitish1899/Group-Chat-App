async function login(event) {
    try{
        event.preventDefault();
        loginCredentials = {
            Email: event.target.email.value,
            Password: event.target.password.value
        }
    
        document.getElementById('email').value = "";
        document.getElementById('password').value = "";
    
        const response =await axios.post('http://localhost:3000/user/login',loginCredentials,{Credentials: "include"});
        if(response.status === 201){
            alert(response.data.message);
                console.log(response.data);
        } else {
            throw new Error(" Failed to Login");
        }
    } catch(err) {
        document.body.innerHTML=`<div style="color:red">${err}</div>`
    }
    
}