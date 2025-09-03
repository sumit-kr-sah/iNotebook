//express setup
const express = require("express");

//router setup
const router = express.Router();

//model schema imported
const User = require("../models/User");

const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//middleware imported
const fetchuser = require("../middleware/fetchuser");


//Route 1-----------------------------------------------------------
//Create a user With post at /api/auth/createuser  -no login required
router.post(
  "/createuser",
  [
    // email must be email form
    body("email", "enter valid email").isEmail(),
    // name must be at least 3 chars long
    body("name", "enter valid name").isLength({ min: 3 }),
    // password must be at least 5 chars long
    body("password", "enter valid passsword").isLength({ min: 5 }),
  ],

  async (req, res) => {
    let success = false;
    //if there are errors return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // console.log(req.body); //prints body in terminal
    // res.send(req.body); //prints body in thunderclint response

    try {
      //check user with this email already exist
      const email = req.body.email;
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ success, error: "this email already exist" });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
        profilePic: req.body.profilePic || "",
      });

      const jwt_secret = "adarshiscoder";
      const data = {
        user: {
          id: user.id,
        },
      };
      const jwt_token = jwt.sign(data, jwt_secret);
      // console.log(jwt_token);
      success = true;
      //this sends files to mongo db
      res.json({ success, jwt_token });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some Code error in Route 1 of auth.js");
    }
  }
);

//Route 2-----------------------------------------------------
// authenticate a user with post at /api/auth/login -no login required
router.post(
  "/login",
  [
    // email must be email form
    body("email", "enter valid email").isEmail(),
    // password must be at least 5 chars long
    body("password", "passwod can't be black").exists(),
  ],

  async (req, res) => {
    let success = false;
    //if there are errors return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // get email and password from body
    const { email, password } = req.body; 

    try {
      //get email form db and compare it with body email
      let user = await User.findOne({ email:email });
      if (!user) {
        return res.status(400).json({ success, error: "Enter correct mail" });
      }

      //get password from db and comapre its hash to body password
      const comppass = await bcrypt.compare(password, user.password);
      if (!comppass) {
        return res.status(400).json({ success, error: "wrong password" });
      }

      //token is created
      const data = {
        user: {
          id: user.id,
        },
      };
      const jwt_secret = "adarshiscoder";
      const jwt_token = jwt.sign(data, jwt_secret);
      // console.log(jwt_token);

      success = true;
      res.json({ success, jwt_token });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some Code error in Route 2 of auth.js ");
    }
  }
);

//Route 3---------------------------------------------------
// get logged in user details using post at /api/auth/getuser  login required
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userid = req.user.id;
    const user = await User.findById(userid).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some Code error in Route 3 in auth.js");
  }
});

//Route 4---------------------------------------------------
// Update user name - login required
router.put("/updateprofile", fetchuser, [
  // name must be at least 3 chars long
  body("name", "Name must be at least 3 characters").isLength({ min: 3 }),
], async (req, res) => {
  try {
    const { name, profilePic } = req.body;
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    // Find and update user
    const userid = req.user.id;
    const user = await User.findById(userid);
    
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    
    // Update user fields
    if (name) user.name = name;
    if (profilePic !== undefined) user.profilePic = profilePic;
    
    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(userid).select("-password");
    res.json({ success: true, user: updatedUser });
    
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Server error while updating profile" });
  }
});

//Route 5---------------------------------------------------
// Change password - login required
router.put("/changepassword", fetchuser, [
  // current password validation
  body("currentPassword", "Current password is required").exists(),
  // new password validation
  body("newPassword", "New password must be at least 5 characters").isLength({ min: 5 }),
], async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    // Find user
    const userid = req.user.id;
    const user = await User.findById(userid);
    
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Current password is incorrect" });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    res.json({ success: true, message: "Password updated successfully" });
    
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Server error while changing password" });
  }
});

//Route 6---------------------------------------------------
// Update profile picture - login required
router.put("/updateprofilepic", fetchuser, async (req, res) => {
  try {
    const { profilePic } = req.body;
    
    if (!profilePic) {
      return res.status(400).json({ success: false, error: "Profile picture is required" });
    }
    
    // Find user
    const userid = req.user.id;
    const user = await User.findById(userid);
    
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    
    // Update profile picture
    user.profilePic = profilePic;
    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(userid).select("-password");
    res.json({ success: true, user: updatedUser });
    
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Server error while updating profile picture" });
  }
});

//Route 7---------------------------------------------------
// Get another user's details by ID (for messaging) - login required
router.get("/user/:userId", fetchuser, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Find user by ID
    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    
    res.json(user);
    
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Server error while fetching user" });
  }
});

//Route 8---------------------------------------------------
// Get all users (for messaging contacts) - login required
router.get("/allusers", fetchuser, async (req, res) => {
  try {
    // Find all users except the current user
    const users = await User.find({ _id: { $ne: req.user.id } }).select("-password");
    
    res.json(users);
    
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Server error while fetching users" });
  }
});

module.exports = router;
