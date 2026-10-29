import {tavily as Tavily} from "@tavily/core"

const tavily=Tavily({
    apiKey:process.env.TAVILY_API_KEY,
})



export const searchInternet=async({query})=>{
      console.log("Tavily search started:", query);
const result=await tavily.search(query,{
        maxResults:5,
      
    })

     console.log("Tavily search completed");
    return JSON.stringify(result)
}