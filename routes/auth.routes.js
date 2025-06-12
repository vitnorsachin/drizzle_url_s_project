// step 2️⃣. Create routes
import { Router } from "express";
import * as authControllers from "../controllers/auth.controller.js";
import multer from "multer"; 
import path from 'path'; 

const router = Router();

router
  .route("/register")
  .get(authControllers.getRegisterPage)
  .post(authControllers.postRegister);

router
  .route("/login")
  .get(authControllers.getLoginPage)
  .post(authControllers.postLogin);

router.route("/profile").get(authControllers.getProfilePage);                            // vidoe 96

router.route("/verify-email").get(authControllers.getVerifyEmailPage);                   // video 100

router.route("/resend-verification-link").post(authControllers.resendVerificationLink);  // video 101

router.route("/verify-email-token").get(authControllers.verifyEmailToken);               // video 105



const avatarStorage = multer.diskStorage({              // v 127
  destination: (req, file, cb) => {
    cb(null, "public/uploads/avatar");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}_${Math.random()}${ext}`);
  },
});

const avatarFileFilter = (req, file, cb) => {            // v 127
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const avatarUpload = multer({                           // v 127
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5mb
});


router.route("/edit-profile")                                  // video 112. step 1. for edit profile name
  .get(authControllers.getEditProfilePage)
  .post(avatarUpload.single("avatar"), authControllers.postEditProfile); // v 127
  // .post(authControllers.postEditProfile);


router.route("/change-password")
  .get(authControllers.getChangePasswordPage)                 // video 114. step 1 change password
  .post(authControllers.postChangePassword);                  // video 115. step 1


router.route("/reset-password")
  .get(authControllers.getResetPasswordPage)                 // video 117. step 1. forgot password
  .post(authControllers.postResetPassword);                  // video 118. reset password link & and store db


router.route("/reset-password/:token")
  .get(authControllers.getResetPasswordTokenPage)            // video 121.
  .post(authControllers.postResetPasswordToken);             // video 122.


router.route("/google")
  .get(authControllers.getGoogleLoginpage);                  // video 124. google login page

router.route("/google/callback")
  .get(authControllers.getGoogleLoginCallback);              // video 124


router.route("/github")
  .get(authControllers.getGithubLoginPage);                  // video 125. github login page

router.route("/github/callback")
  .get(authControllers.getGithubLoginCallback);              // video 125


router.route("/set-password")
  .get(authControllers.getSetPasswordPage)                   // video 126.
  .post(authControllers.postSetPassword);
  
  
router.route("/logout").get(authControllers.logoutUser);

export const authRoutes = router;