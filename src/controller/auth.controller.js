import {asyncHandler} from "../utils/asynchandler.js"
import {ApiResponse} from   "../utils/api-response.js"
import {ApiError} from "../utils/api-errors.js"
import {User} from "../models/user.models.js"
import { uploadOnCloudinary ,deleteFromCloudinary} from "../utils/cloudinary.js"


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




export {
    registerUser
}