const Joi = require('joi');
const fs = require('fs');
const Blog = require('../models/blog');
const BlogDTO = require('../dto/blog');
const { BACKEND_SERVER_PATH } = require('../config/index');

const mongodbIdPattern = /^[0-9a-fA-F\d]{24}$/

const blogController = {
    create : async (req, res, next) => {
        // 1. Validate Request
        // 2. Handle photo storage and naming
        // 3. Add to db
        // 4. Return response

        // Photo from client side > encoded base64 string > decode > store photo in folder > save photo's path in db
        const createBlogSchema = Joi.object({
            title: Joi.string().required(),
            author: Joi.string().regex(mongodbIdPattern).required(),
            content: Joi.string().required(),
            photo: Joi.string().required()
        });

        const {error} = createBlogSchema.validate(req.body);

        if(error) {
            return next(error);
        }

        const {title, author, content, photo} = req.body;

        // Handling the photo
        // Read in Nodejs buffer
        const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64');
        // Alot a random name
        const imagePath = `${Date.now()}-${author}.png`;
        // Store in server's directory
        try {
            fs.writeFileSync(`storage/${imagePath}`, buffer);
        } catch (error) {
            return next(error);
        }

        // Save blog in DB
        let newBlog;
        try {
            newBlog = new Blog({
                title,
                author,
                content,
                photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`
            });
            await newBlog.save();
        } catch (error) {
            return next(error);
        }

        const blogdto = new BlogDTO(newBlog);

        return res.status(201).json({blog: blogdto});
    },
    getAll : async (req, res, next) => {},
    getById : async (req, res, next) => {},
    update : async (req, res, next) => {},
    delete : async (req, res, next) => {},
}

module.exports = blogController;