const asyncHandler = (asyncRequest) => {
    return (req, res, next) => {
        Promise.resolve(asyncRequest(req, res, next)).catch((err) => {
            next(err)
        })
    }
}



export { asyncHandler }