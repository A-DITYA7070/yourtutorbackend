import express from 'express';
import { addLectures, deleteCourse, deleteLecture, getAllCourses, getCourseLectures } from '../controllers/courseControllers.js';
import { createcourse } from '../controllers/courseControllers.js';
import singleUpload from '../middlewares/multer.js';
import { authorizeAdmin, isAuthenticated } from '../middlewares/auth.js';
import { authorizeSubscribers } from '../middlewares/auth.js';

const router = express.Router();

// get all course...
router.route("/courses").get((getAllCourses));

// create course only admin..

router.route("/createcourse").post(isAuthenticated,authorizeAdmin,singleUpload,createcourse);

// get lectures of the course
// add lectures..
// delete course..
router.route("/course/:id")
 .get(isAuthenticated,authorizeSubscribers,getCourseLectures)
 .post(isAuthenticated, authorizeAdmin, singleUpload,addLectures)
 .delete(isAuthenticated,authorizeAdmin,deleteCourse);

//  delete lectures of the course..

router.route("/lecture")
  .delete(isAuthenticated,authorizeAdmin,deleteLecture);

export default router;