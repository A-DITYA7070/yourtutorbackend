import express from 'express';
import { login, 
        logout, 
        register,
        getMyProfile, 
        changePassword,
        updateProfile,
        updateProfilePicture,
        forgetPassword,
        resetPassword,
        addToPlayList,
        removeFromPlayList,
        getAllUsers,
        updateUserRole,
        deleteUser,
        deleteMyProfile
} from '../controllers/userControllers.js';
import { authorizeAdmin, isAuthenticated } from '../middlewares/auth.js';
import singleUpload from '../middlewares/multer.js';

const router = express.Router();
router.route("/register").post(singleUpload,register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/me").get(isAuthenticated,getMyProfile);
router.route("/me").delete(isAuthenticated,deleteMyProfile);
router.route("/changepassword").put(isAuthenticated,changePassword);
router.route("/updateprofile").put(isAuthenticated,updateProfile);
router.route("/updateprofilepicture").put(isAuthenticated,singleUpload,updateProfilePicture);
router.route("/forgetpassword").post(forgetPassword);
router.route("/resetpassword/:token").put(resetPassword);

//  playlist..
router.route("/addtoplaylist").post(isAuthenticated,addToPlayList);
router.route("/removefromplaylist").delete(isAuthenticated,removeFromPlayList);

// Admin routes..
router.route("/admin/users").get(isAuthenticated,authorizeAdmin,getAllUsers);

router.route("/admin/user/:id")
.put(isAuthenticated,authorizeAdmin,updateUserRole)
.delete(isAuthenticated,authorizeAdmin,deleteUser);

export default router;