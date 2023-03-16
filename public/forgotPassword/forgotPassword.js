async function resetPassword(event) {
    try{
        event.preventDefault();
        const emailId = {email : event.target.email.value};
        const response = await axios.post('http://localhost:3000/password/forgotPassword',emailId);
        if(response.status === 201){
            document.body.innerHTML += `<div class="cointener my-form">Reset Password Link  ${response.data}</div>`
        } else{
            throw new Error('Failed to reset password');
        }
    } catch(err){
        console.log(err);
        document.querySelector('form').innerHTML += `<div style="color:red;">${err} <div>`;
    }  
}