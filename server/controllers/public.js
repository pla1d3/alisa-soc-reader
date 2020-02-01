import { clientRedis } from '../helpers/connectDB';
import tdClient from '../tdclient';

export const waitPhone = async (reqData, resData)=> {
  const sessionString = await clientRedis.getAsync(reqData.session.user_id);
  let sessionJSON = JSON.parse(sessionString);
  sessionJSON = sessionJSON || {};

  tdClient.setClient(reqData.session.user_id, reqData.request.command);
  sessionJSON.status = 'waitCode';
  sessionJSON.phone = reqData.request.command;

  clientRedis.set(reqData.session.user_id, JSON.stringify(sessionJSON));
  resData.response.text = 'Отправьте полученный код';

  return resData;
};

export const waitCode = async (reqData, resData)=> {
  const sessionString = await clientRedis.getAsync(reqData.session.user_id);
  let sessionJSON = JSON.parse(sessionString);
  sessionJSON = sessionJSON || {};

  sessionJSON.status = 'waitMessage';
  sessionJSON.isAuth = true;
  sessionJSON.code = reqData.request.command;

  console.log(sessionJSON);
  await clientRedis.set(reqData.session.user_id, JSON.stringify(sessionJSON));

  let messageData = await new Promise(resolve=> {
    setTimeout(()=> {
      messageData = tdClient.getMessages(reqData.session.user_id);
      resolve(messageData);
    }, 500);
  });

  console.log(messageData.message.content);
  resData.response.text = `
    Ваши сообщения: \n
    ------------------
    От: ` + messageData.from + `\n
    Сообщение: ` + messageData.message.content.text.text;

  return resData;
};