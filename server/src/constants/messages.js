// Client -> Server
export const PLAYER_INIT = 'PLAYER_INIT' // { id }
export const CHANGE_STATUS = 'CHANGE_STATUS' // { status }
export const DRAW_CARD = 'DRAW_CARD' // { }
export const PLAYER_CHOICE_RESPONSE = 'PLAYER_CHOICE_RESPONSE' // { mateId?, rule? }
export const RESTART_GAME = 'RESTART_GAME' // { }
export const ROOM_INIT = 'ROOM_INIT' // { name, numberOfDecks }
export const SKIP_TURN = 'SKIP_TURN' // { }

// Server -> Client
export const PLAYER_INIT_ACK = 'PLAYER_INIT_ACK' // { id, roomState }
export const ROOM_STATE = 'ROOM_STATE' // { roomState }
export const PLAYER_CHOICE_REQUEST = 'PLAYER_CHOICE_REQUEST' // { card }
export const SERVER_ERROR = 'SERVER_ERROR' // { errorMessage }
