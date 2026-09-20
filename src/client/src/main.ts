import * as render from './render_thread.js';
import * as socket from './socket.js';
import * as ui from './ui.js';

const _port = Number(new URLSearchParams(location.search).get('port'));

export const serverPort = Number.isSafeInteger(_port) && _port > 0 ? _port : null;

render.init();
ui.init();

if (serverPort === null) console.warn('[client] no server port; running without a connection');
else socket.init(serverPort);
