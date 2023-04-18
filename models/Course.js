import mongoose from 'mongoose';
const schema = new mongoose.Schema({
    title:{
        type:String,
        required:[true,"please Enter course title"],
        minLength:[4,"Title must be atleast 4 chars long."],
        maxLength:[80,"Title can't exceed 80 chars."]
    },
    description:{
        type:String,
        required:[true,"please Enter course title"],
        minLength:[20,"Description must be atleast 20 chars long."],
    },
    lectures:[
        {
            title:{
                type:String,
                required:true
            },
            description:{
                type:String,
                required:true
            },
            video:{
                public_id:{
                    type:String,
                    required:true
                },
                url:{
                    type:String,
                    required:true
                },
            },
        },
    ],
    poster:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        },
    },
    views:{
        type:Number,
        default:0
    },
    noOfVideos:{
        type:Number,
        default:0
    },
    category:{
        type:String,
        required:true
    },
    createdBy:{
        type:String,
        required:[true,"Please Enter creator name"]
    },
    createdAt:{
        type:String,
        default:Date.now,
    }

});

export const Course = mongoose.model("Course",schema);