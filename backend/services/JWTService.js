const jwt = require('jsonwebtoken');
const {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET} = require('../config/index');
const Token = require('../models/token');

class JWTService {
    // sign access token
    static signAccessToken (payload, expiryTime){
        return jwt.sign(payload, ACCESS_TOKEN_SECRET, {expiresIn: expiryTime});
    }

    // sigh refresh token
    static signRefreshToken (payload, expiryTime){
        return jwt.sign(payload, REFRESH_TOKEN_SECRET, {expiresIn: expiryTime});
    }

    // Verify access token
    static verifyAccessToken(token){
        return jwt.verify(token, ACCESS_TOKEN_SECRET);
    }

    // Verify refresh token
    static verifyRefreshToken(token){
        return jwt.verify(token, REFRESH_TOKEN_SECRET);
    }

    // Store Refresh Token in Database
    static async storeRefreshToken(token, userId){
        try {
            const newToken = new Token({
                token: token,
                userId: userId
            });
            // Store it in db
            await newToken.save();
        } catch (error) {
            console.log(error)
        }
    }

    // Update Refresh Token upon login
    static async updateRefreshToken(refreshToken, userID){
        try {
            await Token.updateOne({
                userId: userID
            },
            {token: refreshToken},
            {upsert: true})
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = JWTService;