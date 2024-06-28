import { ChatEntity } from "./chat.entity";

export type AddNewChatInfo = Omit<ChatEntity, "id">