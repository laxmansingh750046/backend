import { Router } from "express";
import { 
     changeCurrentPassword,
     getCurrentUser,
     getUserChannelProfile,
     getWatchHistory,
     loginUser, 
     logoutUser,
     refreshAccessToken, 
     registerUser,
     updateEmail,
     updateFullname, 
     updateUserAvatar, 
     updateUserCoverImage, 
     updateUsername
 } 
 from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"; 
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/register").post(
     upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },{
            name: "coverImage",
            maxCount: 1
        }
     ]), 
     registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/change-fullname").post(verifyJWT,updateFullname);
router.route("/change-username").post(verifyJWT,updateUsername);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/change-email").post(verifyJWT,updateEmail);
router.route("/change-avatar").patch(verifyJWT, upload.single("avatar"),updateUserAvatar);
router.route("/change-coverimage").patch(verifyJWT, upload.single("coverImage"),updateUserCoverImage);
router.route("/u/:username").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT,getWatchHistory);

export default router;
