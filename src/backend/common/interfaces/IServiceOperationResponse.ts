import ServiceOperationStatuses from "../enums/ServiceOperationStatuses"

interface IServiceOperationResponse {
    status: ServiceOperationStatuses,
    errorMessage?: string 
}
  
export default IServiceOperationResponse