import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
            onDelete: "CASCADE",
        },
        
        token: {   
            type: String,
            required: true,
            index: true, 
        },
        expires_at: {
            type: Date,
            required: true,
            index: { expireAfterSeconds: 0 }, 
        },
    },
    {
        timestamps: false,
        versionKey: false,
    }
)

const TokenModel = mongoose.model("Token", tokenSchema);
export default TokenModel;