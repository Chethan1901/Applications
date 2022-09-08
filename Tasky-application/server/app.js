import express from "express";
import fs from "fs/promises";
const app = express();
const port = 5000;
// JSON Body Parser
app.use(express.json());
app.get("/",(req,res) => {
    res.status(200).json({succes: "Welcome to Tasky Application"});
})

app.post("/api/signup", async (req,res) =>{
   try{
    //  console.log(req.body);
    let { firstname, lastname, email, password, password2, address, phone} = req.body;
    let body = req.body;
    if(!email || !firstname || !lastname || !phone || !address || !password || !password2){
        return res.status(400).json({ "error" :"Some Fields are Missing"});
    }
    if (password !== password2){
        return res.status(400).json({ "error" : "Password are Not Same"});
    }
    let filedata = await fs.readFile("data.json");
    filedata = JSON.parse(filedata);
    filedata.push(body);
    await fs.writeFile("data.json",JSON.stringify(filedata));
    res.status(200).json({ success : "User Signed Up Successfully"});
   } catch (error) {
    console.error(error);
    res.status(500).json({ error : "Internal Server Error"})
   }
})
app.listen(port,() =>{
    console.log("Server Started at Port ", port);
})