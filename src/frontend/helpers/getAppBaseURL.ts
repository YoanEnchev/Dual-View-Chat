export default function getAppBaseURL(): string {
    const {protocol, host} = window.location
    
    return `${protocol}//${host}`
}