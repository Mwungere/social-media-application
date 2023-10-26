const mongoose = require("mongoose")
const { isEmail } = require("validator")
const bcrypt = require("bcrypt")
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: [true, 'Please enter a password'],
        unique: true,
        minlength: [3, 'Minimum characters should be 8'],
        maxlenght: [20, 'Maxmum characters should be 20']
    },
    fullname:{
        type: String,
        required: [true, 'Please enter your name']
    },
    email:{
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        maxlength: [100, 'Maximum email length is 100 characters'],
        lowercase: true,
        validate: [isEmail, 'Please enter a valid Email']
    },
   password:{
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [8, 'Minimum characters should be 8'],
    },
    profilePicture:{
        type: String,
        default: ''
    },
    coverPicture:{
        type: String,
        default: ''
    },
    followers:{
       type: Array,
       default: [] 
    },
    following:{
        type: Array,
        default: [] 
     },
     isAdmin:{
        type: Boolean,
        default: false
     },
     country: String,
     about: String,
     livesin: String,
     worksAt: String,
     relationship: String
}, {timestamps: true})

userSchema.pre('save', async function(next){
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

userSchema.statics.login = async function(identifier, password){
    const user = await this.findOne({
        // email
        $or: [{ username: identifier}, {email:identifier}]
    });
    if(user){
        const auth = await bcrypt.compare(password, user.password)
        if(auth){
            return user;
        }
        throw Error('Incorrect password')
    }
    throw Error(`User does not exist`)
}

var UserModel = mongoose.model("user", userSchema);
export default UserModel;
