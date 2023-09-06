const JWTService = require("../services/JWTService");
const User = require("../models/user");
const UserDTO = require("../dto/user");

const auth =  async (req, res, next) => {
    try {
        // 1. Refresh and Access Token validation
        const { refreshToken, accessToken } = req.cookies;
        if(!refreshToken || !accessToken){
            const error = {
                status:401,
                message: "Unauthorized"
            }
            return next(error);
        }

        let _id;
        try {
            _id = JWTService.verifyAccessToken(accessToken)._id;
        } catch (error) {
            return next(error);
        }

        let user;
        try {
            user = await User.findOne({_id: _id});
        } catch (error) {
            return next(error);
        }

        const userdto = new UserDTO(user);
        req.user = userdto;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = auth;