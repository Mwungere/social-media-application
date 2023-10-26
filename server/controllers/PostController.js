const PostModal = require('../models/postModel')
const mongoose = require('mongoose')
import UserModel from '../models/userModel'


// create new post

// const createPost = async(req, res) => {
//     const { userId } = req.body
//     const userIdExists = await PostModal.findById(userId)
//     if (userIdExists) {
//         try {
//             const newPost = await PostModal.create(req.body)
//             res.status(200).json(newPost)
//         } catch (error) {
//             res.status(500).json({message: error.message})
//         }
//     } else {
//         res.status(403).json("Action forbidden, You can only post when you are a user")
//     }
// }

const createPost = async(req, res) => {
    try {
            const newPost = await PostModal.create(req.body)
            res.status(200).json(newPost)
        } catch (error) {
            res.status(500).json({message: error.message})
        }
}

//get a post
const getPost = async(req, res) => {
    const id = req.params.id
    try {
        const post = await PostModal.findById(id)
        res.status(200).json(post)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

//update a post

const updatePost = async (req, res) => {
    const postId = req.params.id
    const { userId } = req.body
    try {
        const post = await PostModal.findById(postId)
        if (post.userId === userId) {
            await PostModal.updateOne({$set : req.body})
            res.status(200).json("Post updated")
        } else {
            res.status(403).json("Action forbidden, You can only update your post")
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

// delete a post 

const deletePost = async (req, res) => {
    const postId = req.params.id
    const { userId } = req.body
    try {
        const post = await PostModal.findById(postId)
        if (post.userId === userId) {
            await PostModal.deleteOne()
            res.status(200).json("Post has been deleted")
        } else {
            res.status(403).json("Action forbidden, You can only delete your post")
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

// like or dislike a post

const likePost = async (req, res) => {
    const id = req.params.id
    const {userId} = req.body
    try {
        const post = await PostModal.findById(id)
        if (!post.likes.includes(userId)) {
            await post.updateOne({$push: {likes: userId}})
            res.status(200).json("Post liked")
        } else {
            await post.updateOne({$pull: {likes: userId}})
            res.status(200).json("Post disliked")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

// get timeline posts

const getTimelinePosts = async (req, res) => {
    const userId = req.params.id
    try {
        const currentUserPosts = await PostModal.find({userId: userId})
        const followingPosts = await UserModel.aggregate([
            {
                $match: {
                    _id : new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from : "posts",
                    localField: "following",
                    foreignField: "userId",
                    as: "followingPosts"
                }
            },
            {
                $project: {
                   followingPosts: 1,
                   _id: 0
                }
            }
        ])
        res.status(200).json(currentUserPosts.concat(...followingPosts[0].followingPosts)
        .sort((a, b) => {
            return b.createdAt - a.createdAt;
        })
        )
    } catch (error) {
        res.status(500).json(error)
    }
}

module.exports = {
    createPost,
    getPost,
    updatePost,
    deletePost,
    likePost,
    getTimelinePosts
}