"use strict";
/**
 * @file events.ts
 * @layer Shared
 * @responsibility All Socket.IO event names as single source of truth
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCKET_EVENTS = void 0;
exports.SOCKET_EVENTS = {
    CLIENT: {
        JOIN_CONVERSATION: 'conversation:join',
        LEAVE_CONVERSATION: 'conversation:leave',
        SEND_MESSAGE: 'message:send',
        TYPING_START: 'typing:start',
        TYPING_STOP: 'typing:stop',
        MARK_READ: 'message:markRead',
    },
    SERVER: {
        MESSAGE_NEW: 'message:new',
        MESSAGE_UPDATED: 'message:updated',
        MESSAGE_DELETED: 'message:deleted',
        TYPING_START: 'typing:start',
        TYPING_STOP: 'typing:stop',
        USER_ONLINE: 'user:online',
        USER_OFFLINE: 'user:offline',
        UNREAD_COUNT: 'message:unreadCount',
        ERROR: 'socket:error',
    },
};
//# sourceMappingURL=events.js.map