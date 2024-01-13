import IServiceOperationResponse from "src/backend/common/interfaces/IServiceOperationResponse"

interface IGPTModelTextResponse extends IServiceOperationResponse {
    textResponse?: string
}
  
export default IGPTModelTextResponse