import { 
  forgotPasswordSchema,
  loginUserSchema,
  registerUserSchema, 
  setPasswordSchema, 
  verifyEmailSchema, 
  verifyPasswordSchema, 
  verifyResetPasswordSchema, 
  verifyUserSchema,
} from "../validators/auth.validators.js";

import {
  clearUserSession,
  comparePassword,
  createUser,
  getUserByEmail,
  hashPassword,
  authenticateUser, 
  findUserById, 
  getAllShortLinks, 
  findVerificationEmailToken, 
  verifyUserEmailAndUpdate, 
  clearVerifyEmailTokens, 
  sendNewVerifyEmailLink,
  updateUserByName,
  updateUserPassword,
  findUserByEmail,
  createResetPasswordLink,
  getResetPasswordToken,
  clearResetPasswordToken,
  getUserWithOauthId,
  createUserWithOauth,
  linkUserWithOauth
} from "../services/auth.services.js";

import { getHtmlFromMjmlTemplate } from "../lib/get-html-from-mjml-templae.js";
import { sendEmail } from "../lib/resend-email.js";
import { decodeIdToken, generateCodeVerifier, generateState } from "arctic";
import { OAUTH_EXCHANGE_EXPIRY } from "../config/constants.js";
import { google } from "../lib/oauth/google.js";
import { github } from "../lib/oauth/github.js";


export const getRegisterPage = (req, res) => {               // 1️⃣. Get "register.ejs" file & 'render'
  // video : 83. step 3. Pass errors
  res.render("../views/auth/register", { errors: req.flash("errors") }); //🟢 path of register file ([step 3️⃣. give path of ejs file])
};

export const postRegister = async (req, res) => {            // 1️⃣. Register
  try {
    if (req.user) res.redirect("/");

    const { data, error } = registerUserSchema.safeParse(req.body); // video 86. step 2.
    if (error) {
      const errors = error.errors[0].message;
      req.flash("errors", errors);
      res.redirect("/register");
    }
    const { name, email, password } = data;

    const userExists = await getUserByEmail(email);
    if (userExists) {
      req.flash("errors", "User already exists..!");          // video : 83 step 2
      return res.redirect("/register");
    }

    const hashedPassword = await hashPassword(password);      // video : 78
    const [user] = await createUser({ name, email, password: hashedPassword });
    console.log("User Register: ", user);

    // res.status(201).redirect("/login");

    await authenticateUser({ req, res, user, name, email });  // video 95. authenticate user

    await sendNewVerifyEmailLink({ email, userId: user.id }); // video 108. send verifyemail during register

    // res.redirect("/");
    res.redirect('/verify-email');                            // video 108. after register goto verify email
  } catch (error) {
    console.error(error);
    res.status(201).send("❌ Internal server error from registerLogin..");
  }
};


export const getLoginPage = (req, res) => {                  // 2️⃣. Get 'login.ejs' file and 'render'
  res.render("auth/login", { errors: req.flash("errors") });
};
 
export const postLogin = async (req, res) => {               // 2️⃣. Login
  const { data, error } = loginUserSchema.safeParse(req.body); // video 86. step 2.
  if (error) {
    const errors = error.errors[0].message;
    req.flash("errors", errors);
    res.redirect("/login");
  }

  const { email, password } = data;
  const user = await getUserByEmail(email);

  if (!user) {
    req.flash("errors", "Invalid Email or Password"); // video 83. step 2
    return res.redirect("/login");
  }

  if(!user.password) {
    req.flash(
      "errors",
      "You have created account using social login, Please login with your social account."
    )
    return res.redirect('/auth/login')
  }

  const isPasswordValid = await comparePassword(password, user.password); // video : 78
  if (!isPasswordValid) {
    req.flash("errors", "Invalid Email or Password"); // video 83. step 2
    return res.redirect("/login");
  }

  await authenticateUser({ req, res, user }); // video 95. authenticate user

  res.redirect("/");
};


export const logoutUser = async (req, res) => {              // video 82. For User Logout..
  await clearUserSession(req.user.sessionId);
  res.clearCookie("access_token"); // video 93.
  res.clearCookie("refresh_token");
  res.redirect("/login");
};


export const getProfilePage = async (req, res) => {          // video 81. For get Profile
  if (!req.user) return res.send(`<h2 style="color: red; text-align: center;">Not logged In.</h2>`);

  const user = await findUserById(req.user.id);// video. 96
  if(!user) return res.redirect('/login');

  const userShortLinks = await getAllShortLinks(user.id);

  res.render("auth/profile", {
    user: {
      id           : user.id,
      name         : user.name,
      email        : user.email,
      isEmailValid : user.isEmailValid,         // video 97
      hashPassword : Boolean(user.password),
      createdAt    : user.createdAt,
      links        : userShortLinks,
      avatarUrl: user.avatarUrl,                // video 126
    },
  });
};


export const getVerifyEmailPage = async (req, res) => {      // video 100
  if(!req.user) return res.redirect("/");

  const user = await findUserById(req.user.id);
  if(!user || user.isEmailValid) return res.redirect("/");
  
  return res.render("auth/verify-email", {email: req.user.email});
}


export const resendVerificationLink = async (req, res) => {  // video 101
  if(!req.user) return res.redirect("/");
  const user = await findUserById(req.user.id);
  if(!user || user.isEmailValid) return res.redirect("/");

  await sendNewVerifyEmailLink({ email: req.user.email, userId: req.user.id }); // video 108. send mail after registration

  res.redirect('/verify-email');
};


export const verifyEmailToken = async (req, res) => {        // video 105. verify "email" & "token"
  const { data, error } = verifyEmailSchema.safeParse(req.query);

  if (error) {
    return res.send("Verifiaction link invalid or expired..!");
  }

  // const token = await findVerificationEmailToken(data);    // for without joins
  const [token] = await findVerificationEmailToken(data);     // video 107. for joins

  console.log("verifyEmailToken ~ token: ", token);
  if(!token) res.send("Verifiaction link invalid or expired..");

  await verifyUserEmailAndUpdate(token.email);

  clearVerifyEmailTokens(token.userId).catch(console.error);

  return res.redirect('/profile');
}

 
export const getEditProfilePage = async (req, res) => {      // video 112. step 2 Edit prifile name
  if(!req.user) return res.redirect("/");

  const user = await findUserById(req.user.id);
  console.log("User : ", user);
  if(!user) return res.status(404).send("User not found");

  res.render("auth/edit-profile", { 
    name: user.name, 
    avatarUrl: user.avatarUrl,                              // video 127
    errors: req.flash("errors"), 
  });
}

export const postEditProfile = async (req, res) => {         // video 112. step 2
  if(!req.user) return res.redirect("/");
  
  const { data, error } = verifyUserSchema.safeParse(req.body);
  if(error){
    const errorMessages = error.errors.map((err) => err.message);
    req.flash("errors", errorMessages);
    return res.redirect("/edit-profile");
  }

  // await updateUserByName({ userId: req.user.id, name: data.name });
  
  const fileUrl = req.file ? `uploads/avatar/${req.file.filename}` : undefined;  // video 127
  await updateUserByName({
    userId: req.user.id,
    name: data.name,
    avatarUrl: fileUrl,
  });

  res.redirect("/profile");
}


export const getChangePasswordPage = async (req, res) => {   // video 114
  if(!req.user) return res.redirect("/");
  res.render("auth/change-password", { errors: req.flash("errors"), success: req.flash("success")});
}

export const postChangePassword = async (req, res) => {      // video 115
  const { data, error } = verifyPasswordSchema.safeParse(req.body);
  if(error){
    const errorMessages = error.errors.map((err) => err.message);
    req.flash("errors", errorMessages);
    return res.redirect("/change-password");
  }

  const { currentPassword, newPassword } = data;

  const user = await findUserById(req.user.id);              // video 116
  if(!user) return res.status(404).send("User not found");

  const isPasswordValid = await comparePassword(currentPassword, user.password);
  if(!isPasswordValid){
    req.flash("error", "Current Password that you entered is invalid");
    return res.redirect("/change-password");
  }

  await updateUserPassword({ userId: user.id, newPassword });  // video 116
  req.flash("success", "Password is changed.");

  return res.redirect("/change-password");
} 


export const getResetPasswordPage = async (req, res) => {     // video 117. step 2.
  res.render("auth/forgot-password", { 
    formSubmitted: false,
    formSubmitted: req.flash("formSubmitted")[0],
    errors: req.flash("errors"),
  });
}

export const postResetPassword = async (req, res) => {        // video 118 step 2
  const { data, error } = forgotPasswordSchema.safeParse(req.body);

  if(error){
    const [errorMessages] = error.errors.map((err) => err.message);
    req.flash("errors", errorMessages);
    return res.redirect("/reset-password");
  }
  
  const user = await findUserByEmail(data.email);
  if (user) {  
    const resetPasswordLink = await createResetPasswordLink({ userId: user.id });  // video 119

    const html = await getHtmlFromMjmlTemplate("reset-password-email", {           // video 120
      name: user.name,
      link: resetPasswordLink,
    });

    sendEmail({
      to      : user.email,
      subject : "Reset Your Password",
      html    : html
    })
  }

  req.flash("formSubmitted", true);
  res.redirect("/reset-password");
}


export const getResetPasswordTokenPage = async (req, res) => {// video 121
  const { token } = req.params;
  const passwordResetData = await getResetPasswordToken(token);
  if(!passwordResetData) return res.render("auth/wrong-reset-password-token");
  
  return res.render("auth/reset-password", {
    formSubmitted: req.flash("formSubmitted")[0],
    errors: req.flash("errors"),
    token,
  })
}

export const postResetPasswordToken = async (req, res) => {   // video 122
  const {token} = req.params;
  const passwordResetData = await getResetPasswordToken(token);
  if(!passwordResetData) {
    req.flash("errors", "Password Token is not matching");
    return res.render("auth/wrong-reset-password-token");
  };

  const { data, error } = verifyResetPasswordSchema.safeParse(req.body);
  if(error){
    const errorMessages = error.errors.map((err) => err.message );
    req.flash("errors", errorMessages[0]);
    res.redirect(`/reset-password/${token}`);
  }

  const { newPassword } = data;
  const user = await findUserById(passwordResetData.userId);

  await clearResetPasswordToken(user.id);

  await updateUserPassword({ userId:user.id, newPassword })

  return res.redirect("/login");
}


export const getGoogleLoginpage = async (req, res) => {       // video 124
  if(req.user) return res.redirect("/");

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
    "email",
  ])

  const cookieConfig = {
    httpOnly : true,
    secure   : true,
    maxAge   : OAUTH_EXCHANGE_EXPIRY,
    sameSite : "lax"
  }

  res.cookie("google_oauth_state", state, cookieConfig);
  res.cookie("google_code_verifier", codeVerifier, cookieConfig);

  res.redirect(url.toString());
}


export const getGoogleLoginCallback = async (req, res) => {     // video 124
  const { code, state } = req.query;
  console.log(code, state);

  const {
    google_oauth_state: storedState,
    google_code_verifier: codeVerifier,
  } = req.cookies;

  if (
    !code ||
    !state ||
    !storedState ||
    !codeVerifier ||
    state !== storedState
  ) {
    req.flash(
      "errors",
      "Couldn't login with Google because of invalid login attempt. Please try again!"
    );
    return res.redirect("/login");
  }

  let tokens;
  try {
    // arctic will verify the code given by google with code verifier internally
    tokens = await google.validateAuthorizationCode(code, codeVerifier);
  } catch {
    req.flash(
      "errors",
      "Couldn't login with Google because of invalid login attempt. Please try again!"
    );
    return res.redirect("/login");
  }

  console.log("token google: ", tokens);

  const claims = decodeIdToken(tokens.idToken());
  console.log("claim: ", claims);

  const { sub: googleUserId, name, email, picture } = claims;

  //! there are few things that we should do
  // Condition 1: User already exists with google's oauth linked
  // Condition 2: User already exists with the same email but google's oauth isn't linked
  // Condition 3: User doesn't exist.

  // if user is already linked then we will get the user
  let user = await getUserWithOauthId({
    provider: "google",
    email,
  });

  // if user exists but user is not linked with oauth
  if (user && !user.providerAccountId) {
    await linkUserWithOauth({
      userId: user.id,
      provider: "google",
      providerAccountId: googleUserId,
      // avatarUrl: picture,
    });
  }

  // if user doesn't exist
  if (!user) {
    user = await createUserWithOauth({
      name,
      email,
      provider: "google",
      providerAccountId: googleUserId,
      // avatarUrl: picture,
    });
  }
  await authenticateUser({ req, res, user, name, email });

  res.redirect("/");
}


export const getGithubLoginPage = async (req, res) => {         // video 125
  if(req.user) return res.redirect("/");

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = github.createAuthorizationURL(state, ['user:email']);

  const cookieConfig = {
    httpOnly : true,
    secure   : true,
    maxAge   : OAUTH_EXCHANGE_EXPIRY,
    sameSite : "lax"
  }

  res.cookie("github_oauth_state", state, cookieConfig);

  res.redirect(url.toString());
}

export const getGithubLoginCallback = async (req, res) => {     // video 125
  const { code, state } = req.query;
  const { github_oauth_state: storedState } = req.cookies;

  function handleFailedLogin() {
    req.flash(
      "errors",
      "Couldn't login with GitHub because of invalid login attempt. Please try again!"
    );
    return res.redirect("/login");
  }

  if (!code || !state || !storedState || state !== storedState) {
    return handleFailedLogin();
  }

  let tokens;
  try {
    tokens = await github.validateAuthorizationCode(code);
  } catch {
    return handleFailedLogin();
  }

  const githubUserResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokens.accessToken()}`,
    },
  });
  if (!githubUserResponse.ok) return handleFailedLogin();
  const githubUser = await githubUserResponse.json();
  const { id: githubUserId, name } = githubUser;

  const githubEmailResponse = await fetch(
    "https://api.github.com/user/emails",
    {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
      },
    }
  );
  if (!githubEmailResponse.ok) return handleFailedLogin();

  const emails = await githubEmailResponse.json();
  const email = emails.filter((e) => e.primary)[0].email; // In GitHub we can have multiple emails, but we only want primary email
  if (!email) return handleFailedLogin();

  // there are few things that we should do
  //! Condition 1: User already exists with github's oauth linked
  //! Condition 2: User already exists with the same email but google's oauth isn't linked
  //! Condition 3: User doesn't exist.

  let user = await getUserWithOauthId({
    provider: "github",
    email,
  });

  if (user && !user.providerAccountId) {
    await linkUserWithOauth({
      userId: user.id,
      provider: "github",
      providerAccountId: githubUserId,
    });
  }

  if (!user) {
    user = await createUserWithOauth({
      name,
      email,
      provider: "github",
      providerAccountId: githubUserId,
    });
  }

  await authenticateUser({ req, res, user, name, email });

  res.redirect("/");
};


export const getSetPasswordPage = async (req, res) => {         // video 126
  if(!req.user) return res.redirect("/");

  return res.render('auth/set-password', {
    errors: req.flash("errors"),
  });
};


export const postSetPassword = async (req, res) => {            // video 126
  if (!req.user) return res.redirect("/");

  const { data, error } = setPasswordSchema.safeParse(req.body);

  if (error) {
    const errorMessages = error.errors.map((err) => err.message);
    req.flash("errors", errorMessages);
    return res.redirect("/set-password");
  }

  const { newPassword } = data;

  const user = await findUserById(req.user.id);
  if (user.password) {
    req.flash(
      "errors",
      "You already have your Password, Instead Change your password"
    );
    return res.redirect("/set-password");
  }

  await updateUserPassword({ userId: req.user.id, newPassword });

  return res.redirect("/profile");
}