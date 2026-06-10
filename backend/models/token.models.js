import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        
        token: {   
            type: String,
            required: true,
        },
        expires_at: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: false,
        versionKey: false,
    }
)

const TokenModel = mongoose.model("Token", tokenSchema);
export default TokenModel;