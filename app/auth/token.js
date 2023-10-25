const { sign, verify } = require('jsonwebtoken');
const { genSaltSync, hashSync, compareSync } = require('bcrypt');
// const tokenMsg = require('../msgCodes/token-msg');
const tokenConfig = require("../config/default.json");

const newToken = async () => {
    //Generate Token
    var access_token_secret_key = "";
    var access_token_expire_time = "15m";

    if(tokenConfig.jwtConfig.access_token_expire_time){
        access_token_expire_time = tokenConfig.jwtConfig.access_token_expire_time;
    }

    if(tokenConfig.jwtConfig.access_token_secret_key){
        access_token_secret_key = tokenConfig.jwtConfig.access_token_secret_key;
    }

    const salt = genSaltSync(10);
    //console.log("salt====>", salt);

    if(tokenConfig.jwtConfig.enableToken == true){
        const accessToken = sign({"secret":salt}, access_token_secret_key, { expiresIn: access_token_expire_time });
        console.log("access Token====>", accessToken);
        return accessToken;
    }else {
        return "";
    }
}