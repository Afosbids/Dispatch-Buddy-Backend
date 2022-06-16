const mongoose =  require('mongoose');
const Schema = mongoose.Schema;


const UserSchema = new Schema({
    name:{
        type:String,
        required:[true, 'Name field is required']
    },
    phoneNumber:{
        type:String,
        required:[true, 'Phone number field is required']
    },
    email:{
        type:String,
        required:[true, 'Email field is required']
    },
    userType:{
        type: String,
        enum : ['Shipper','Rider'],
        default: 'Shipper'
    },
    password:{
        type:String,
        required:[true, 'Password field is required']
    }
},{ timestamps: true })


const User = mongoose.model('User', UserSchema)

module.exports = User