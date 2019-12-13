const mTempl=()=>new ApiGateway.Method.Lambda()
    .Authorization("NONE")
    .Lambda("paul")
export const api=new ApiGateway.Api()
    .method("rec",{
        GET:mTempl(),
        branch:{
            "{id}":{
                GET:mTempl(),
                branch:{
                    "paul":{
                        GET:mTempl()
                    }
                }
            }
        }
    })