const {employee,emppersonaldetails}= require('../models/employee');
const bcrypt = require('bcrypt');
const handlebars = require('handlebars');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const moment = require('moment')
require('dotenv').config(); 
const fs = require('fs');
const register = async(req,res)=>{
    const { name,designation,email,age,username,password,role,DOB,address,city,phoneNo} = req.body;
    try {
       const details = await emppersonaldetails.create({
        DOB,
        address,
        city,
        phoneNo
       })
      const newUser = await employee.create({ 
        name,
        designation,
        email,
        age,
        username,
        password,
        role,
        personaldetails:details._id
     });
      const templateFile = fs.readFileSync('./assets/email.html', 'utf-8');
      const template = handlebars.compile(templateFile);
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_PASSWORD
        }
    });
    const mailOptions = {
        from: process.env.GMAIL_EMAIL,
        to: email, 
        subject: 'Registration Confirmation',
        html: template({name})
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
    const scheduledTime = moment();
        scheduledTime.add(30,'minutes')
        const cronexp = ` ${scheduledTime.minutes()} ${scheduledTime.hours()} * * *`;
            const thankyoumail = {
            from: process.env.GMAIL_EMAIL,
            to: email,
            subject: 'Thank you for registering!',
            html: `Thank you  ${name} for registering with us.`
                };
                const cronjob= cron.schedule(cronexp, async () => {
        await transporter.sendMail(thankyoumail, (error, info) => {
             if (error) {
                console.error('Error sending thank you email:', error);
            } else {
                console.log('Thank you email sent:', info.response);
            }cronjob.stop();
            });
        });
    res.status(201).json({ id: newUser.id, username });
    }
     catch (error) {
      console.error(error);
      res.status(500).send('Error registering user');
    }}
    const getempbyid = async(req,res)=>{
        try{
            const id = req.params.id
            const emp = await employee.findById(id).populate({path:'personaldetails',select:'phoneNo'});
            console.log(emp.pen)
            res.json(emp);
        } catch (error) {
            res.status(500).json({ message: "An error occurred", error:error.message });
        }
    }
    const getempbycity = async(req,res)=>{
        try{
            const city = req.params.city
            console.log("Requested city:", city); 
            const emp = await employee.findBycity(city)//.populate('personaldetails')
            console.log("Found employees:", emp); 
            if (!emp) {
                return res.status(404).json({ message: "Employee not found for the specified city." });
            }
           console.log(emp);
            res.json(emp);
        } catch (error) {
            res.status(500).json({ message: "An error occurred", error:error.message });
        }
    }
    
    
const getallemployees = async (req, res, next) => {
    try {
        
        const response = await employee.find().populate({path:'personaldetails',select:'city'})
          //console.log(response)
     
          res.json(response);
         // await response.populate('personaldetails').execPopulate();
          
         
      
    } catch (error) {
        res.status(500).json({ message: "An error occurred", error:error.message });
    }
};
const getbyrolequerymethod = async (req, res, next) => {
    try {
        const  response= await employee.find().byRole('admin');
        res.json({ response});
    } catch (error) {
        res.status(500).json({ message: "An error occurred", error });
    }
};
const getbyusernamestaticmethod = async (req, res, next) => {
    try {
        const username = req.params.username
        console.log("Username:", username);
        const  response= await employee.findByusername(username).populate({path:'personaldetails',select:'address'});
        console.log("Employee:", employee);
        res.json( response);
    } catch (error) {
        res.status(500).json({ message: "An error occurred", error:error.message });
    }
};
const getemployees = async (req, res, next) => {
    try {
        const ageFilter = { age: { $gt: 25 } };
        const  response= await employee.find(ageFilter).sort({ name: -1 });
        res.json({ response});
    } catch (error) {
        res.status(500).json({ message: "An error occurred", error });
    }
};
const show = (req,res,next)=>{
    const employeeid = req.params.employeeid
    employee.findById(employeeid)
    
    .then(response =>{
        res.json({response})
    })
    .catch(error =>{
        res.json({message:"an error occured",error})
    })
}

const update = (req,res,next)=>{
    try{
    const employeeid = req.body.employeeid
    const updateddata={
        name :req.body.name,
        designation :req.body.designation,
        email:req.body.email,
        age :req.body.age,
        username:req.body.username,
        role :req.body.role,
    }
    employee.findByIdAndUpdate(employeeid,{$set:updateddata})
        res.json({message:'employee updateded successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user');
      }}
      const delete1 = async (req, res, next) => {
        const employeeid = req.body.employeeid;
        try {
            const deletedEmployee = await employee.findOneAndDelete({ _id: employeeid });
            if (!deletedEmployee) {
                return res.status(404).json({ message: 'Employee not found' });
            }
            res.json({ message: 'Employee deleted successfully', deletedEmployee });
        } catch (error) {
            res.status(500).json({ message: "An error occurred", error });
        }
    }

    

module.exports ={getempbyid,getempbycity,getallemployees,getbyrolequerymethod,getbyusernamestaticmethod,getemployees,show,register,update,delete1 }