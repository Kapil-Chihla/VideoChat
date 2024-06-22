import { User } from "./User";

let GLOBAL_ROOM_ID = 1;

interface Room {
    user1: User,
    user2: User,
}

export class RoomManager {
    private rooms: Map<string, Room>;

    constructor() {
        this.rooms = new Map<string, Room>();
    }

    createRoom(user1: User, user2: User) {
        const roomId = this.generate().toString();
        this.rooms.set(roomId, {
            user1, 
            user2,
        });

        user1.socket.emit("send-offer", {
            roomId
        });

        user2.socket.emit("send-offer", {
            roomId
        });
    }

    onOffer(roomId: string, sdp: string, senderSocketId: string) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
        receivingUser.socket.emit("offer", {
            sdp,
            roomId
        });
    }

    onAnswer(roomId: string, sdp: string, senderSocketId: string) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
        receivingUser.socket.emit("answer", {
            sdp,
            roomId
        });
    }

    onIceCandidates(roomId: string, senderSocketId: string, candidate: any, type: "sender" | "receiver") {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
        receivingUser.socket.emit("add-ice-candidate", {
            candidate,
            type
        });
    }

    findRoomByUserSocket(socketId: string): Room | undefined {
        for (const room of this.rooms.values()) {
            if (room.user1.socket.id === socketId || room.user2.socket.id === socketId) {
                return room;
            }
        }
        return undefined;
    }

    generate() {
        return GLOBAL_ROOM_ID++;
    }
}
