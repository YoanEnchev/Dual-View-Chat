interface IChatRoom {
    chatID: number,
    userAccessToken: string // Consider moving this to context provider or state library in future.
}

export default IChatRoom