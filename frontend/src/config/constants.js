export const SOCKET_EVENTS = {
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  
  // Presence
  USER_ONLINE: 'userOnline',
  ONLINE_USERS: 'onlineUsers',
  USER_OFFLINE: 'userOffline',
  LAST_SEEN_UPDATE: 'lastSeenUpdate',
  
  // Draft Preview
  DRAFT_START: 'draftStart',
  DRAFT_UPDATE: 'draftUpdate',
  DRAFT_CLEAR: 'draftClear',
  DRAFT_STOP: 'draftStop',
  
  // Messaging
  MESSAGE_SEND: 'messageSend',
  MESSAGE_SENT: 'messageSent',
  MESSAGE_RECEIVE: 'messageReceive',
  MESSAGE_DELIVERED: 'messageDelivered',
  MESSAGE_SEEN: 'messageSeen',
  CHAT_SEEN: 'chatSeen',
  CHAT_CLEARED: 'chatCleared',
  CHAT_DELETED: 'chatDeleted',
  MESSAGE_DELETE: 'messageDelete',
  MESSAGE_EDIT: 'messageEdit',
};
