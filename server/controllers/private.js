import tdClient from '../tdclient';

export const waitMessage = async (reqData, resData)=> {

  tdClient.getMessages(reqData.session.user_id);
  return resData;

};