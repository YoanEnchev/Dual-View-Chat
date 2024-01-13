import { IsString, MaxLength } from 'class-validator';

export class MessageCreateRequest {

    @IsString({ message: 'Text must be a string.' })
    @MaxLength(3000, { message: 'Text must be at most 3000 characters.' })
    text: string;
}