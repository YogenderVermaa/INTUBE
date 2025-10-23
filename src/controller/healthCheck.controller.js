import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/api-response.js";


const healthCheck = asyncHandler(async (req,res) => {
    return res.status(200)
    .json(new ApiResponse(200,"OK","HealthCheck Route Passed"))
})

export {healthCheck}