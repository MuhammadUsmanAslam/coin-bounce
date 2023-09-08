const Joi =  require("joi");
const Comment = require("../models/comment");
const CommentDTO = require("../dto/comment");

const mongodbIdPattern = /^[0-9a-fA-F\d]{24}$/

const commentController = {
    create: async (req, res, next) => {
        const createCommentSchema = Joi.object({
            content: Joi.string().required(),
            author: Joi.string().regex(mongodbIdPattern).required(),
            blog: Joi.string().regex(mongodbIdPattern).required()
        });

        const {error} = createCommentSchema.validate(req.body);

        if(error){
            return next(error);
        }

        const {content, author, blog} = req.body;

        try {
            const newComment = new Comment({
                content,
                author,
                blog
            });

            await newComment.save();
        } catch (error) {
            return next(error);
        }

        res.status(201).json({message: 'Comment is created'});
    },
    getById: async (req, res, next) => {
        const getCommentSchema = Joi.object({
            id: Joi.string().regex(mongodbIdPattern).required()
        });

        const {error} = getCommentSchema.validate(req.params);

        if(error){
            return next(error);
        }

        const {id} = req.params;

        let comments;

        try {
            comments = await Comment.find({blog: id}).populate('author');
        } catch (error) {
            return next (error);
        }

        const commentsDTO = [];

        for(let i=0; i<comments.length; i++){
            const commentdto = new CommentDTO(comments[i]);
            commentsDTO.push(commentdto);
        }

        res.status(200).json({data: commentsDTO});
    }
}

module.exports = commentController;