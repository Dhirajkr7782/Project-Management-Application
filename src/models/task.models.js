import mongoose,{Schema} from "mongoose";
import { AvailableTaskStatus, TaskStatusEnum } from "../utils/constants.js";
import { assign } from "nodemailer/lib/shared";

const taskSchema=new Schema({
    title:{
        type:String,
        required:true,
        trim:true,
    },

    description: String,
    project:{
        type:Schema.Types.ObjectId,
        ref:"Project",
        required:true,
    },
    assignrdTo:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    assignedBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        
    },
    status:{
        type:String,
        enum:AvailableTaskStatus,
        default:TaskStatusEnum.TODO,
    },
    attachments:{
        type: [
            {
                url: String,
                mimetype: String,
                size: Number,
            },
        ],
        default: [],

      },
    },{ timeseries:true},
);

export const Task=mongoose.model("Task",taskSchema);
        
    