const Joi = require("joi");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const UserDTO = require('../dto/user');
const JWTService = require('../services/JWTService');
const Token = require('../models/token');
const token = require("../models/token");

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;

const authController = {
    register : async (req, res, next) => {
        // 1 Validate user inputs
        const userRegisterSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            name: Joi.string().min(5).max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(passwordPattern).required(),
            confirmPassword: Joi.ref('password')
        });
        
        const { error } = userRegisterSchema.validate(req.body);
        
        // 2 if error in validation > return error via middleware
        if(error){
            return next(error);
        }
        
        // 3 if email or username already registered > return error
        const {name, username, email, password} = req.body;
        // Check if email is not already registered
        try {
            // Here we are checking if email is already registered or not
            const emailInUse = await User.exists({email});
            // Here we are checking if username is already registered or not
            const usernameInUse = await User.exists({username});

            if(emailInUse){
                const error = {
                    status:409,
                    message: "Email Already Registered, Use another Email"
                }
                return next(error);
            }

            if(usernameInUse){
                const error = {
                    status:409,
                    message: "Username Already in use, try different one"
                }
                return next(error);
            }

        } catch (error) {
            return next(error);
        }

        // 4 password hash
        const hashedPassword = await bcrypt.hash(password, 10);
        
        let accessToken;
        let refreshToken;
        let userToRegister;
        let userRegistered;
    
        try {
            // 5 store user data in db
            userToRegister = new User({name, username, email, password:hashedPassword});
            userRegistered = await userToRegister.save();

            // Generate Tokens
            accessToken = JWTService.signAccessToken({_id: userRegistered.id}, '30m');
            refreshToken = JWTService.signRefreshToken({_id: userRegistered.id}, '30m');

        } catch (error) {
            return next(error);
        }

        // Store refresh token in Database
        await JWTService.storeRefreshToken(refreshToken, userRegistered.id);

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        });
        
        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        });
        
        const userDTO = new UserDTO(userRegistered);
        // 6 Return response
        return res.status(201).json({user: userDTO, auth: true});
    },
    login : async (req, res, next) => {
        const userLoginSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            password: Joi.string().pattern(passwordPattern),
        })

        const {error} = userLoginSchema.validate(req.body);

        if(error){
            return next(error);
        }

        const {username, password} = req.body;

        let userExists;
        try {
            userExists = await User.findOne({username});

            if(!userExists){
                const error = {
                    status: 401,
                    message: "User not exists"
                }
                return next(error);
            }
            const passwordMatched = await bcrypt.compare(password, userExists.password);
            if(!passwordMatched){
                const error = {
                    status: 401,
                    message: "Password not matched"
                }
                return next(error);
            }

            // Generate Tokens
            const accessToken = JWTService.signAccessToken({_id: userExists.id}, '30m');
            const refreshToken = JWTService.signRefreshToken({_id: userExists.id}, '30m');

            // Store refresh token in Database
            await JWTService.updateRefreshToken(refreshToken, userExists.id);

            res.cookie('accessToken', accessToken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true
            })

            res.cookie('refreshToken', refreshToken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true
            })

            const userDTO = new UserDTO(userExists);
            return res.status(200).json({user: userDTO, auth: true});
        } catch (error) {
            return next(error);
        }
    },
    logout : async (req, res, next) => {
        // Delete Refresh Token from database
        const { refreshToken } = req.cookies;

        try {
            await Token.deleteOne({token: refreshToken});
        } catch (error) {
            next(error);
        }

        // Clear Cookies in response
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');

        // Send response to the user
        res.status(200).json({user: null, auth: false});
    },
    refresh: async (req, res, next) => {
        // 1. Get refresh token from cookies
        const orignalRefreshToken = req.cookies.refreshToken;
        // 2. verify refresh token
        let id;
        try {
            id = JWTService.verifyRefreshToken(orignalRefreshToken)._id;

        } catch (e) {
            const error = {
                status: 401,
                message: "Unauthorized"
            }
            return next(error);
        }
        try {
            const match = Token.findOne({_id: id, token: orignalRefreshToken});
            if(!match){
                const error = {
                    status: 401,
                    message: "Unauthorized"
                }
                return next(error);
            }
        } catch (e) {
            return next(e);
        }
        try {
            // 3. Generate new tokens
            const accessToken = JWTService.signAccessToken({_id: id}, '30m');

            const refreshToken = JWTService.signRefreshToken({_id: id}, '60m');

            // 4. Update token in db and return response
            await Token.updateOne({_id:id}, {token: refreshToken});

            res.cookie('accessToken', accessToken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true
            });

            res.cookie('refreshToken', refreshToken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true
            });
        } catch (e) {
            return next(e);
        }

        const user = await User.findOne({_id:id});

        const userdto = new UserDTO(user);

        res.status(200).json({user: userdto, auth: true});
    }
}

module.exports = authController;