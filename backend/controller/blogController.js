const Joi = require('joi');
const fs = require('fs');
const Blog = require('../models/blog');
const Comment = require("../models/comment");
const BlogDTO = require('../dto/blog');
const BlogDetailsDTO = require('../dto/blog-details');
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
    getAll : async (req, res, next) => {
        try {
            const blogs = await Blog.find({});

            const blogsdto = [];

            for(let i=0; i<blogs.length; i++){
                const dto = new BlogDTO(blogs[i]);
                blogsdto.push(dto)
            }

            res.status(200).json({blogs: blogsdto});

        } catch (error) {
            return next(error);
        }
    },
    getById : async (req, res, next) => {
        // 1. Validate id
        // 2. Send response
        const getByIdSchema = Joi.object({
            id: Joi.string().pattern(mongodbIdPattern).required()
        });

        const {error} = getByIdSchema.validate(req.params);

        if(error) {
            return next(error);
        }

        let blog;
        const {id} = req.params;
        
        try {
            blog = await Blog.findOne({_id:id}).populate("author");
        } catch (error) {
            return next(error);
        }

        const blogdto = new BlogDetailsDTO(blog);

        res.status(200).json({blog: blogdto});
        // res.status(200).json({blog});
    },
    update : async (req, res, next) => {
        // Validate
        const updateBlogSchema = Joi.object({
            title: Joi.string(),
            content: Joi.string().required(),
            author: Joi.string().regex(mongodbIdPattern).required(),
            blogId: Joi.string().regex(mongodbIdPattern).required(),
            photo: Joi.string()
        });

        const {error} = updateBlogSchema.validate(req.body);
        if(error){
            return next(error);
        }

        const {title, author, content, blogId, photo} = req.body;

        let blog;
        try {
            blog = await Blog.findOne({_id: blogId});
        } catch (error) {
            return next(error);
        }

        if(photo){
            let previousPhoto = blog.photoPath;
            previousPhoto = previousPhoto.split('/').at(-1);

            // Delete Photo
            fs.unlinkSync(`storage/${previousPhoto}`);

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

            // Update Blog
            await Blog.updateOne({_id:blogId}, {
                title,
                content,
                photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`,
            });     
        }else{
            await Blog.updateOne({_id:blogId}, {
                title,
                content
            });
        }
        return res.status(200).json({message: "Blog Updated"});
    },
    delete : async (req, res, next) => {
        const deleteBlogSchema = Joi.object({
            id: Joi.string().regex(mongodbIdPattern).required()
        });

        const {error} = deleteBlogSchema.validate(req.params);

        if(error){
            return next(error);
        }

        const {id} = req.params;

        try {
            await Blog.deleteOne({_id: id});

            await Comment.deleteMany({blog: id});
        } catch (error) {
            return next(error);
        }

        return res.status(200).json({message: "Blog deleted succesfully"})
    },
}

module.exports = blogController;