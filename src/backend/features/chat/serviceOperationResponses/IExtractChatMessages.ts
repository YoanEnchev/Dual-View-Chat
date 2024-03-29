import IServiceOperationResponse from "src/backend/common/interfaces/IServiceOperationResponse"
import IMessageJSONFormat from "src/shared/interfaces/IMessageJSONFormat"

interface IExtractChatMessages extends IServiceOperationResponse {
    messages?: IMessageJSONFormat[]
}
  
export default IExtractChatMessages