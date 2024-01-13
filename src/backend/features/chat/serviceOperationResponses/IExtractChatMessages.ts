import IServiceOperationResponse from "src/backend/common/interfaces/IServiceOperationResponse"
import { Message } from "../../message/message.entity"

interface IExtractChatMessages extends IServiceOperationResponse {
    messages?: Message[]
}
  
export default IExtractChatMessages