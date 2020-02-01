import { clientRedis } from '../helpers/connectDB';
import { waitPhone, waitCode } from './public';
import { waitMessage } from './private';

export default async (req, res)=> {
  const reqData = req.body;
  const sessionString = await clientRedis.getAsync(reqData.session.user_id);
  let sessionJSON = JSON.parse(sessionString);
  sessionJSON = sessionJSON || {};

  let resData = { response: {} };

  console.log(sessionJSON.isAuth, sessionJSON.status);
  if (sessionJSON.isAuth) {
    resData = await privateActions(reqData, resData);
  } else {
    resData = await publicActions(reqData, resData);
  }

  resData.session = reqData.session;
  resData.version = reqData.version;

  res.send(resData);
};

const publicActions = async (reqData, resData)=> {
  const sessionString = await clientRedis.getAsync(reqData.session.user_id);
  let sessionJSON = JSON.parse(sessionString);
  sessionJSON = sessionJSON || {};

  if (reqData.session.new) {
    resData.response.text = 'Привет, необходима авторизация. Ваш номер телефона от аккаунта телеграм?';
    sessionJSON.status = 'waitPhone';
    clientRedis.set(reqData.session.user_id, JSON.stringify(sessionJSON));
    return resData;
  }

  switch (sessionJSON.status) {
    case 'waitPhone':
      resData = await waitPhone(reqData, resData);
      break;
    case 'waitCode':
      resData = await waitCode(reqData, resData);
      break;
  }

  return resData;
};

const privateActions = async (reqData, resData)=> {
  const sessionString = await clientRedis.getAsync(reqData.session.user_id);
  let sessionJSON = JSON.parse(sessionString);
  sessionJSON = sessionJSON || {};

  console.log(sessionJSON.status);
  switch (sessionJSON.status) {
    case 'waitMessage':
      resData = await waitMessage(reqData, resData);
      break;
  }

  return resData;
};