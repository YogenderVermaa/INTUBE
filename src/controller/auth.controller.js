import {asyncHandler} from "../utils/asynchandler.js"
import {ApiResponse} from   "../utils/api-response.js"
import {ApiError} from "../utils/api-errors.js"
import {User} from "../models/user.models.js"
import { uploadOnCloudinary ,deleteFromCloudinary} from "../utils/cloudinary.js"
import { ref } from "process"
import { IncomingMessage } from "http"



const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user  = User.findById(userId)
        if(!user){
            throw new ApiError("404","Invalid User")
        }
        const accessToken =  user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
    
        user.refreshToken = refreshToken
    
        await user.schemaLevelProjections({validateBeforeSave:false})
    
        return {accessToken,refreshToken}
    } catch (error) {
        console.log("faild to generate Refresh And Access Token ",error)
        throw new ApiError(407,"Failed while generating access and refresh tokens ")
    }
}

const registerUser = asyncHandler(async (req,res) => {
    const {fullname,email,username,password} = req.body

    if([fullname,email,username,password].some((field) => field?.trim() === "")){
        throw new ApiError(404,"All fields are required")
    }

   const existedUser  =  await User.findOne(
        {
            $or: [{username},{email}]
        }
    )

    if(existedUser){
        throw new ApiError(409,"User with email or username already existed")
    }
    // console.warn("fiels hero:",req.files)
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const normalizedAvatarPath = avatarLocalPath?.replace(/\\/g, '/'); 

    // console.log(req.files?.avatar?.[0])
    // console.log("avatar::::",req.files?.avatar?.[0]?.path)
    const coverLocalPath = req.files?.coverImage?.[0]?.path
    const normalizedCoverPath = coverLocalPath?.replace(/\\/g, '/'); 

    if(!normalizedAvatarPath){
        throw new ApiError(400,"avatar file is missing")
    }

//     const avatar = await uploadOnCloudinary(avatarLocalPath)

//    let coverImage = ""

//    if(coverLocalPath){
//     coverImage = await uploadOnCloudinary(coverLocalPath)
//    }

let avatar;
try {
    avatar = await uploadOnCloudinary(normalizedAvatarPath)
} catch (err) {
    console.log("Error uploading avatar",err)
    throw new ApiError(500,"Failed to upload avatar")
}
let coverImage;
if(normalizedCoverPath){
    try {
    coverImage = await uploadOnCloudinary(normalizedCoverPath)
} catch (error) {
    console.log("Error uploading cover Image",error)
    throw new ApiError(500,"Failed to upload cover Image")
}
}


   try {
    const user = await User.create({
     fullname,
     avatar: avatar.url,
     coverImage: coverImage?.url || "",
     email,
     password,
     username: username.toLowerCase()
    })
 
    const createdUser = await User.findById(user._id).select(
     "-password -refreshToken "
    )
    if(!createdUser){
     throw new ApiError(500,"Something Went Wrong While Registring a User")
    }
 
    return res
    .status(200)
    .json(
            new ApiResponse(200,createdUser,"user Registered SuccessFully")
    )
   } catch (error) {
    console.log("Faild while creating user",error)
    if(avatar){
        await deleteFromCloudinary(avatar.public_id)
    }
    if(coverImage){
        await deleteFromCloudinary(coverImage.public_id)
    }

    throw new ApiError(500,"Something went wrong while registring user and image were deleted")
   }
})


const loginUser = asyncHandler(async(req,res) => {
    const {username,email,password} = req.body

    if([username,email,password].some((field) => field?.trim === "")){

        throw new ApiError(400,"UserName and Password are required")
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User with this email and username not found")
    }

    const isPassCorrect = user.isPasswordCorrect(password)
    if(!isPassCorrect){
        throw new ApiError(400,"Invalid Password")
    }

    const {accessToken,refreshToken}  = await generateAccessAndRefreshToken(user?._id)

    const loggedInUser = await User.findById(user?._id).select(
        "-password -refreshToken"
    );

    if(!loggedInUser){
        throw new ApiError(409,"Something went wrong while logging in the user")
    }

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }


    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,loggedInUser,"User Registered SuccessFully")
    )
    

})

const logoutUser  = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                refreshToken: ""
            },
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshTOken",options)
    .json(
        new ApiResponse(200,{},"user logged out successfully")
    )
})

const refreshAccessToken = asyncHandler(async (req,res) => {
    const incommingRefreshToken = req.cookie.refreshToken || req.body.refreshToken


    if(!incommingRefreshToken){
        throw new ApiError(401,"refresh token required")
    }


    try {
       const decodedToken =   jwt.verify(
            incommingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if(!user){
            throw new ApiError(401,"Invalid refresh Token")
        }

        if(incommingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Invalid refresh token")
        }

        const options = {
            httpOnly : true,
            secure : process.env.NODE_ENV === "production" 
        }

        const {accessToken,refreshToken : newRefreshToken} = await generateAccessAndRefreshToken(user?._id)


        return res 
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken: newRefreshToken,

                },
                "Access token refreshed successfully"
            )
        )
    } catch (error) {
     throw new ApiError(500,"something went wrong while refreshign access token")   
    }
})


export {
    registerUser,
    loginUser,
    refreshAccessToken
}