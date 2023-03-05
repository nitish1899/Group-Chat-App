const Group = require('../models/group');
const UserGroup = require('../models/userGroup');
const User = require('../models/user');
const Chat = require('../models/chat');

const {Sequelize, Op} = require('sequelize');

function isStringInvalid(string){
    if(string == undefined || string.length === 0){
        return true;
    } else {
        return false;
    }
}

const createGroup = async (req,res) => {
    try{
        const {groupName} = req.body;
        const adminName = req.user.name;
        if(!isStringInvalid(groupName)) {
           const Newgroup = await req.user.createGroup({groupName, createdBy: adminName}, {through : {isAdmin: true}});
           res.status(201).json({name: Newgroup.groupName , id: Newgroup.id, success: true});
        } else {
            throw new Error('Group name is invalid.');
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({err, success:false})
    }
}

const getGroups= async (req, res) => {
    try{
        const arrayOfGroups = await req.user.getGroups({
            attributes : ["id" , "groupName"]
        });
        //console.log('Array of groups :',arrayOfGroups);
        const groups = arrayOfGroups.map(ele => {
            return {id : ele.id, name: ele.groupName};
        });
       //console.log('groups are : ',groups);
        //console.table(groups);
        res.status(200).json({success : true, groups});
    }catch(err) {
        console.log(err);
        res.status(500).json({success : false , message : `Something went wrong !`});
    }
}

const deleteGroup = async (req, res, next) => {
    try{
        const {id} = req.params; // This is group id.
       // console.log(req.params, req.user.id);
        const memberIsAdmin = await UserGroup.findOne({where : {groupId: id, userId : req.user.id , isAdmin: true}});
        if(!memberIsAdmin){
            return res.status(404).json({success : false ,message : `Only Admin can delete group !`});
        } else{
            const group = await Group.destroy({where : { id : id}});
            return res.status(200).json({success : true ,message : `Group has beeen deleted sucessfully`});
        }
    }catch(err){
        console.log(err);
        return res.status(500).json({success: false, message : `Something went wrong !`});
    }
}

const joinGroup = async (req, res) => {
    try{
       //console.log(req.params);
        const update = await UserGroup.create({
            groupId : req.params.id,
            userId : req.user.id,
            isAdmin : false
        })
        res.status(200).json({success: true , message : `Congratulations ! Now you are in the group`});
    }catch(err){
        console.log(err);
        res.status(500).json({success:false , message: `Something went wrong !`});
    }  
}

const getAllGroups = async (req, res) => {
    try{
       // console.log(req.body);
        const {groupsId} = req.body;
        const allOtherGroups = await Group.findAll({
            where: { id: { [Sequelize.Op.notIn]: groupsId} },
            attributes : ['id' , 'groupName']
        })
        const AllOtherGroups = allOtherGroups.map(ele => {
            return {id : ele.id, name: ele.groupName};
        });
        //console.table(AllOtherGroups);
        res.status(200).json({success:true , AllOtherGroups});
    }catch(err){
        console.log(err);
        res.status(500).json({success:false , message: `Something went wrong !`});
    }
}

module.exports = {
    createGroup,
    getGroups, 
    deleteGroup, 
    joinGroup, 
    getAllGroups
};