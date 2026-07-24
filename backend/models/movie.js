const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
    {
        title:{
            type: String,
            required: true,
            trim: true
        },
        description:{
            type: String,
            required: true
        },
        duration:{
            type: Number,
            required: true
        },
        genre:{
            type: [String],
            required: true
        },
        rating:{
            type: Number,
            min: 0,
            max: 10
        },
        posterUrl:{
            type: String
        },
        bannerUrl: {
            type: String
        },
        trailerUrl:{
            type: String
        },
        status: {
        type: String,
        enum: ["now", "soon"],
        default: "soon"
        }
    },
    {timestamps: true}
);

module.exports = mongoose.model("Movie", movieSchema);