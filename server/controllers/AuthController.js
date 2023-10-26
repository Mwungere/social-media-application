const UserModel = require ('../models/userModel')
const jwt = require('jsonwebtoken')

const maxAge= 3 * 24 * 60 * 60;
// registering a new user
export const registerUser = async(req, res) => {
    const { fullname, username, password, email} = req.body
    try {
        const oldUser = await UserModel.findOne({username})
        if(oldUser){
            return res.status(400).json({message:"The username is already registered!"})
        }
        const user = await UserModel.create({fullname, username, password, email})
        const token = jwt.sign({
            username: user.username, id: user._id
        }, process.env.JWT_KEY, {
            expiresIn: maxAge
        })
        res.status(200).json({user, token})
    } catch (error) {
        res.status(400).json({message: error.message})
    }

}

//login users

export const loginUser = async (req, res) => {
    const {identifier, password} = req.body
    try {
        const user = await UserModel.login(identifier, password)
        const token = jwt.sign({
            username: user.username, id: user._id
        }, process.env.JWT_KEY, {
            expiresIn: maxAge
        })
        res.status(200).json({user, token})
    } catch (error) {
        res.status(400).json({message: error.message})
    }
}

