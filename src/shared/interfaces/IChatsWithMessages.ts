import IMessageJSONFormat from "./IMessageJSONFormat";

export default interface IChatsWithMessages {
    // Key must represent chat id.
    [key: number]: IMessageJSONFormat[];
}
  