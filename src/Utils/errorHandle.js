
let stack;
export const asyncHandle = (API) =>{
    return (req , res , next) => {
        API(req , res , next).catch(err => {
            stack = err.stack;
            return next(new Error(err) , {cause : 500});
        })
    }
}

export const globalError = (err , req , res , next) => {
    if(err){
        if(process.env.MOOD === "DEV"){
            return res.status(err.cause || 500).json({message : err.message , err , stack});
        }
        return res.status(err.cause || 500).json({message : err.message});
    }
}

