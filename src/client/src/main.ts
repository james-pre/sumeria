import * as render from './render_thread.js';

const _port = Number(new URLSearchParams(location.search).get('port'));

export const serverPort = Number.isSafeInteger(_port) && _port > 0 ? _port : null;

render.init();
