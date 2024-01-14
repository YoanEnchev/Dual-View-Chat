export default interface ChatRoomsWrapper {
    chatIDs: number[],
    userAccessToken: string // Consider moving this to context provider or state library in future.
}