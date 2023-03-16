async function signup(event){
    try{
        event.preventDefault();

        const userDetails = {
            name: event.target.name.value,
            email: event.target.email.value,
            password: event.target.password.value,
            phNo: event.target.PhoneNumber.value
        }
    
        document.getElementById('name').value="";
        document.getElementById('email').value="";
        document.getElementById('password').value="";
        document.getElementById('phNo').value="";
        
        const response = await axios.post('http://13.127.223.190:3000/user/signup',userDetails,{Credentials: "include"});
        if(response.status === 201){
            alert(response.data.message);
            console.log(response.data);
            window.location.href='../login/login.html';
        }
        else {
            throw new Error(" Failed to Sign Up");
        }
    } catch(err) {
        alert(err.response.data.message); 
      //document.body.innerHTML +=`<div style="color:red;">${err}</div>`;
    }
}