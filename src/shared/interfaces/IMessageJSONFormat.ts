export default interface IMessageJSONFormat {
    text: string;
    isFromUser: boolean;
    gptResponseToClientIDMsg?: string;
}
  