const getCourses = require("../models/courseDetail_model");
const getComment = require("../models/getComment_model");
const updateComment = require("../models/updateComment_model");
const deleteComment = require("../models/deleteComment_model");
const getTest = require("../models/test_model")
const getCourseList = require("../models/courseList_model");
const getCourse = require("../models/getCourses_model");
const saveComment = require("../models/comment_model");
const saveLog = require("../models/saveError_model");
const getLog = require("../models/getLog_model");
const getUser = require("../models/getUser_model");
const countDB = require("../models/dbCount_model");


const departments = require("../data/class_ids_names.json");
const e = require("express");
const department_and_IDs = require("../data/class_ids_names.json");
const ObjectId = require('mongodb').ObjectID;

module.exports = class Courses{
  getCourseInfo(req,res,next){
    

    const query = req.params;
    getCourse(query.teacher, query.subject).then(result=>{
      
      if (result.length===0) {
        res.redirect("/courses");
      } else {
        getCourses(query).then(result => {

          let isLogin = typeof(req.session.passport) !== 'undefined'
    
        if (isLogin) result.me = req.session.passport.user;
    
          if(req.isAuthenticated()) result.department = departments[req.user.profile.email.substr(2,2)];
    
          res.render("courses_details",result);
          //res.json(result);
        }, (err) => {
          
          console.log(err);
        })
      }
    })
    
    
  }

  getCoursesInfo(req,res){
    getCourseList(req).then(result => {
      res.render("courses",result)
    }, (err) => {
      console.log(err);
    })
  }
  printCourses(req,res){
    res.render("courses_async");
  }

  getCourseInfoJSON(req,res){
    getCourseList(req).then(result =>{
      res.json(result.queryCourses.docs)
    }, (err) =>{
      console.log(err);
    })
  }

  getMyComment(req, res) {
    if(typeof(req.session.passport) !== 'undefined'){
      getComment(req.params.teacher, req.params.subject, req.session.passport.user ).then(result=>{
        res.json(result)
      }, (err) => {
          console.log(err);
      })
    }
    else{
      res.status(403).send("need login.");
    }
  }
  updateMyComment(req, res) {
    updateComment(req).then( done=>{

      res.redirect("/courses/" + req.params.teacher + "/" + req.params.subject);
    })
  }
  deleteMyComment(req, res) {
    deleteComment(req).then( done=>{
      res.redirect("/courses/" + req.params.teacher + "/" + req.params.subject);
    })
  }
  postComment(req,res){
    saveComment(req).then(done => {
      if(done) res.redirect("/courses/" + req.params.teacher + "/" + req.params.subject);
      else res.redirect("/auth/login");
    }, (err)=> {
      saveLog(err).then(done=>{
        if (done) {
          res.send('別再亂玩server拉')
          console.log(err);
        } else console.log("log error")
      })
      
    })
  }
  getCourseLog(req, res) {
    let isLogin = typeof(req.session.passport) !== 'undefined'
    
    if (isLogin) {
      countDB().then(dbs_counts=>{
        getLog().then(results=>{
          let itemsProcessed = 0;
          if (results.length===0) res.render("log",{data:[], dbs_counts:dbs_counts});
          else {
            for (let i=0; i<results.length; i++) {
              getUser(results[i].userID).then(found=>{
                itemsProcessed++
                let departmentID = found[0].profile.email.slice(2,4)
                results[i].userID = department_and_IDs[departmentID]
                if (itemsProcessed===results.length) {
                  res.render("log",{data:results, dbs_counts:dbs_counts});
                }
              })
            }
          }
        })
      })
      
      
    } else res.redirect("/auth/login");
  }
  

  test(req,res){res.send("just controller test");}
  testModel(req,res){
    const query = req.params;
    getTest(query).then(result => {
      res.json(result);
    }, (err) => {
      console.log(err);
    })
  }
};
