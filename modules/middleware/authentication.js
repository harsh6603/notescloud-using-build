const jwt =require("jsonwebtoken")
// SECRET="swaminarayanNilkanthHariGhanshyam"
SECRET = process.env.JWT_SECRET;
exports.authenticateUser = (req,res,next) => {
    const token=req.header("token");
    if(!token)
    {   
        res.status(401).send("Please authenticate using a valid token.");
    }
    try{
        const check=jwt.verify(token,SECRET);
        req.userID=check.id;
        req.userName=check.name;
        next();
    }
    catch(err)
    {
        res.status(401).send("Please authenticate using a valid token.");
    }
}