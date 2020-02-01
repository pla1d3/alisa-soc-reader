import alisaController from './controllers';
import express from 'express';
import cors from 'cors';
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackConfig = require('../webpack.server');

const isEnvDevelopment = process.env.NODE_ENV === 'development';
const app = express();

if (isEnvDevelopment) {
  webpackConfig.entry.app.unshift('webpack-hot-middleware/client?reload=true&timeout=1000');
  webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath
  }));
  app.use(webpackHotMiddleware(compiler));
}

app.use(cors({
  credentials: true,
  origin: ['http://localhost:3000']
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/alisa', alisaController);
app.listen('3000' , ()=> {
  console.log('Started, port: 3000');
});