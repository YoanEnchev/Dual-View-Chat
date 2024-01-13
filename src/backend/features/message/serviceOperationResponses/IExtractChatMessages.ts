import IServiceOperationResponse from "src/backend/common/interfaces/IServiceOperationResponse"
import IMessageJSONFormat from "src/shared/interfaces/IMessageJSONFormat"

interface ICreateMessageServiceResponse extends IServiceOperationResponse {
    messageObject?: IMessageJSONFormat
}
  
export default ICreateMessageServiceResponse