import IServiceOperationResponse from "src/backend/common/interfaces/IServiceOperationResponse"
import { Chat } from "../chat.entity"

interface IInitializingUserChats extends IServiceOperationResponse {
    chats?: Chat[]
}
  
export default IInitializingUserChats