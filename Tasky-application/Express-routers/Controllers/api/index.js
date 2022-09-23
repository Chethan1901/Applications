import express from "express";
import fs from "fs/promises";
import bcrypt from "bcrypt";
import config from "config";

import generateToken from "../../middleware/auth/generateToken.js";
import { randomString, sendEmail, sendSMS } from "../../utils/index.js"

const router = express.Router();

router.post("/login", loginValidation(), errorMiddleware, async (req, res) => {
    try {
        let { email, password } = req.body;
  
        let fileData = await fs.readFile("data.json");
        fileData = JSON.parse(fileData);

        let userFound = fileData.find((ele) => ele.email == email)
        if (!userFound) {
            return res.status(401).json({ "error": "Invalid Credentials " });
        }
        let matchPassword = await bcrypt.compare(password, userFound.password)
        if (!matchPassword) {
            return res.status(401).json({ "error": "Invalid Credentials " });
        }

        let payload = {
            user_id: userFound.user_id,
            role: "user"
        }

     
        const token = generateToken(payload);

        res.status(200).json({ success: "Login is Successful", token })


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" })
    }
})


router.post("/signup", registerValidation(), errorMiddleware, async (req, res) => {
    try {
        let { firstname, lastname, email, password, password2, address, phone } = req.body;
       
        let fileData = await fs.readFile("data.json");
        fileData = JSON.parse(fileData);
      

        let emailFound = fileData.find((ele) => ele.email == email)
        if (emailFound) {
            return res.status(409).json({ error: "User Email Already Registered. Please Login" });
        }

        let phoneFound = fileData.find((ele) => ele.phone == phone)
        if (phoneFound) {
            return res.status(409).json({ error: "User Phone Already Registered. Please Login." })
        }

 
        password = await bcrypt.hash(password, 12);


        let user_id = randomString(16);
        let userData = { user_id, firstname, lastname, email, password, address, phone };
        userData.tasks = []
        userData.isVerified = {
            phone: false,
            email: false
        }
        let phoneToken = randomString(20);
        let emailToken = randomString(20);
        userData.verifyToken = {
            phoneToken,
            emailToken
        }

       
        fileData.push(userData);
        await fs.writeFile("data.json", JSON.stringify(fileData));
        res.status(200).json({ success: "User Signed Up Succesfully" });
        sendSMS({
            body: `Thank you for Signing Up. Please click on the given link to verify your phone. ${config.get("URL")}/api/verify/mobile/${phoneToken}`,
            to: phone
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" })
    }
})


router.get("/", (req, res) => {
    try {
        res.status(200).json({ "success": "Router GET is UP" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ "error": "Interval Server Error" });

    }
})


export default router;