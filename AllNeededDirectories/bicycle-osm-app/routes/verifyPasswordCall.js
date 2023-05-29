require('dotenv').config();


/*
In order to apply changes to data such as points and money I have to go through this function.
That way the user that knows the links cannot cheat to gain points because they don't know the password
*/
module.exports = function(req,res,next){
    const pw = req.get('pw_token');
    if(pw==process.env.REST_PASSWORD){
        next();
    }else{
        res.status(403).send({
            error:'invalid call'
        })
    }
}
