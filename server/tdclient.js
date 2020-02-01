import { Client } from 'tglib/node';
import { clientRedis } from './helpers/connectDB';

class ClientTD {
  constructor() {
    this.clients = [];
  }

  async setClient(userId, value) {
    this.clients[userId] = new Client({
      apiId: '708825',
      apiHash: '82c52c0e42e4b6e59804cd33e96df279',
      appDir: '../td',
      binaryPath: '/Users/simon/coding/js/alisa-soc-reader/td/build/libtdjson.dylib',
      wasmModule: null
    });

    const defaultHandler = this.clients[userId].callbacks['td:getInput'];

    this.clients[userId].registerCallback('td:getInput', async args=> {
      console.log(args);

      switch (args.string) {
        case 'tglib.input.AuthorizationType':
          return 'user';
        case 'tglib.input.AuthorizationValue':
          console.log('AuthorizationValue', value);
          return value;
        case 'tglib.input.AuthorizationCode':
          console.log('AuthorizationCode');
          return await this.handleCode(userId);
        default:
          return await defaultHandler(args);
      }
    });
  }

  getClient(userId) {
    return this.clients[userId];
  }

  handleCode(userId) {
    return new Promise(resolve=> {
      const intervalID = setInterval(()=> {
        console.log('wait code');

        clientRedis.getAsync(userId).then(sessionString=> {
          let sessionJSON = JSON.parse(sessionString);
          sessionJSON = sessionJSON || {};

          if (sessionJSON.code) {
            clearInterval(intervalID);
            resolve(sessionJSON.code);
          }
        });
      }, 100);
    });
  }

  async getMessages(userId) {
    //contains_unread_mention
    await this.clients[userId].ready;

    const chats = await this.clients[userId].tg.getAllChats();
    const messages = await this.clients[userId].fetch({
      '@type': 'getChatHistory',
      'chat_id': chats[0].id,
      'offset': 0,
      'from_message_id': chats[0].last_message.id,
      'limit': 10,
      'only_local': false
    });
    console.log(chats[0]);

    for (let i = 0; i < chats.length; i++) {
      if (chats[i].unread_count) {
        const message = await this.clients[userId].fetch({
          '@type': 'getMessage',
          'chat_id': chats[0].id,
          'message_id': messages.messages[0].id
        });
        return { from: chats[i].title, message };
      }
    }
  }

  async setPhone(userId, phone) {
    await this.clients[userId].fetch({
      '@type': 'setAuthenticationPhoneNumber',
      'phone_number': phone
    });
  }

  async setCode(userId, code) {
    await this.clients[userId].fetch({
      '@type': 'checkAuthenticationCode',
      'code': code
    });
  }
}

export default new ClientTD();