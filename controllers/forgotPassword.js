const User = require('../models/user');
const ForgotPassword = require('../models/forgotPassword');
const uuid = require('uuid');
const sgMail =  require('@sendgrid/mail');
const bcrypt = require('bcrypt');

const forgotPassword = async (req,res) => {
  try{
      const {email} = req.body;
      const user = await User.findOne({where: {email: email}});
      if(user){
        const id = uuid.v4();
        try{
          await ForgotPassword.create({id, active: true, userId: user.id});
        } catch(err){
          throw new Error(err);
        }

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            to: 'nkword1899@gmail.com',
            from: 'nkword1899@gmail.com',
            subject: 'Reset password ',
            text: 'Click on given link and enter your new password',
            html: `<a href="http://localhost:3000/password/resetPassword/${id}">Reset password</a>`,
        }
        const response = await sgMail.send(msg)
        try{
        return res.status(201).send(`<a href="http://localhost:3000/password/resetPassword/${id}">Reset password</a>`);
        }
        catch(err){
            throw new Error(err);
        }
      } else{
           throw new Error('User doesnt exist')
      }

  } catch(err){
    console.error(err)
    return res.status(500).json({ message: err, sucess: false });
  }
}

const resetPassword = async (req,res) => {
    try{
        const id = req.params.id;
        const forgotpasswordrequest = await ForgotPassword.findOne({where: {id}});
        if(forgotpasswordrequest){
            forgotpasswordrequest.update({active: false});
            res.status(200).send(`<html>
                                    <script>
                                        function formsubmitted(e){
                                            e.preventDefault();
                                            console.log('called')
                                        }
                                    </script>
                                    <form action="/password/updatePassword/${id}" method="get">
                                        <label for="newpassword">Enter New password</label>
                                        <input type="password" name="newpassword" required></input>
                                        <button>reset password</button>
                                    </form>
                                </html>`
                                )
            res.end();                     
        } else{
            throw new Error('Request for reset password failed. Try again.')
        }
    } catch(err){
      console.log(err);
      res.status(500).json({message: err, sucess: false});
    }
}

const updatePassword = async (req,res) => {
    try{
        const {newpassword} = req.query;
        const {resetPasswordid} = req.params;
        const resetpasswordrequest = await ForgotPassword.findOne({where:{id:resetPasswordid}});
        const user = await User.findOne({where: { id: resetpasswordrequest.userId}});
        if(user){
            // Encrypt the newpassword
            const saltRounds =10;
            bcrypt.genSalt(saltRounds, (err, salt) => {
                if(err){
                    console.log(err);
                    throw new Error(err);
                }
                bcrypt.hash(newpassword, salt, async (err, hash) => {
                    if(err){
                        console.log(err);
                        throw new Error(err);
                    }
                   const response = await user.update({password: hash});
                   res.status(201).json('Password updated successfully');
                })
            })
        } else{
            return res.status(404).json({ message: 'No user Exists', success: false})
        }
    } catch(err){
        console.log(err);
        res.status(500).json({message:err, success: false});
    }
}

module.exports = {
                  forgotPassword,
                  resetPassword,
                  updatePassword
                };