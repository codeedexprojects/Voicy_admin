import axios from "axios";
export const commonApi=async(method,url,reqBody,reqHeader)=>{
    const config={
        method,
        url,
        data:reqBody,
        headers:reqHeader?reqHeader:{"Content-Type":"application/json"}
    }
    return await axios(config).then(result=>{
        return result
    }).catch(result=>{
        return result
    })
}