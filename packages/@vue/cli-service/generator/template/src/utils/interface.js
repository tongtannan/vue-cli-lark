import Axios from 'ts-axios-ttn';
import Store from '../store/index';
import { Message } from 'element-ui';
import { getToken } from './auth';
// import router from '../router';
const tokenHeaderName = 'x-auth-token';

// const CancelToken = Axios.CancelToken;
const cancelList = [];
// const source = CancelToken.source();
const submitMethod = ['post', 'formpost', 'put', 'patch', 'delete'];

function removeCancel(input, isCancel) {
  for (const idx in cancelList) {
    if (cancelList[idx].id === input) {
      const item = cancelList.splice(idx, 1);
      isCancel && item[0].fn();
      break;
    }
  }
}

Axios.interceptors.request.use(
  config => {
    config.headers[tokenHeaderName] = getToken();
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default class CommonInterface {
  static fetch = function(
    url = '',
    method = 'get',
    data = {},
    baseUrl = '',
    isSuccessMessage = false,
    isErrorMessage = true,
    callback = null,
    isCancel = false
  ) {
    const toMethod = method.toLocaleLowerCase();
    if (submitMethod.includes(toMethod)) {
      Store.dispatch('asyncFullScreenLoading', true);
    }
    const baseConfig = {
      baseURL: baseUrl ? window.$apiUrl + baseUrl : window.$apiUrl + '/',
      responseType: method === 'download' ? 'blob' : 'json',
      // withCredentials: true,
      cancelToken: new Axios.CancelToken(function(c) {
        Store.commit('pushCancelList', c);
        if (isCancel && toMethod === 'get') {
          cancelList.push({
            id: url + 'get',
            fn: c
          });
        }
      }),
      headers: {
        'Content-Type':
          toMethod === 'formpost' ? 'multipart/form-data' : 'application/json'
        // 'Access-Control-Request-Headers': '*',
        // Origin: '*'
      }
    };
    baseConfig['headers'][tokenHeaderName] = getToken();
    const config = callback
      ? Object.assign({}, baseConfig, {
          onUploadProgress: progressEvent => {
            if (progressEvent.lengthComputable) {
              callback(progressEvent);
              // 属性lengthComputable主要表明总共需要完成的工作量和已经完成的工作是否可以被测量
              // 如果lengthComputable为false，就获取不到progressEvent.total和progressEvent.loaded
              // var complete = (progressEvent.loaded / progressEvent.total * 100 | 0) + '%';
              // console.log(complete);
            }
          }
        })
      : baseConfig;

    const interfaceSign = url.indexOf('?') > -1 ? '&' : '?';
    const interfaceUrl =
      url + interfaceSign + 'timestamp=' + new Date().getTime();

    let instance = Axios.create(config);
    instance = ['get', 'download'].includes(toMethod)
      ? instance.get(interfaceUrl, {
          params: data
          // cancelToken: source.token
        })
      : toMethod === 'delete'
      ? instance.delete(interfaceUrl, {
          params: data
          // cancelToken: source.token
        })
      : toMethod === 'formpost'
      ? instance.post(interfaceUrl, data, {
          // cancelToken: source.token
        })
      : instance[toMethod](interfaceUrl, data, {
          // cancelToken: source.token
        });

    return new Promise((resolve, reject) => {
      return instance
        .then(res => {
          if (toMethod !== 'download') {
            const { data, message } = res;
            const backCode = data.code;
            // const resData = data.data || data;
            const resData = data;
            resolve(resData);
            if (isSuccessMessage && backCode !== '403') {
              Message({
                message: message || res.data.message || res.data.msg,
                type: backCode === '200' ? 'success' : 'error'
              });
            }
          } else {
            const { data, headers } = res;
            const fileName = decodeURI(
              headers['content-disposition']
                .split('filename=')[1]
                .replace(/"/g, '')
            );
            if (
              navigator.userAgent.indexOf('Edge') > -1 ||
              navigator.userAgent.indexOf('NET') > -1
            ) {
              const type = data['type'];
              const blob = new Blob([data], {
                type: type
              });
              if (window.navigator.msSaveBlob) {
                window.navigator.msSaveBlob(blob, fileName);
              }
            } else {
              const url = window.URL.createObjectURL(new Blob([data]));
              const link = document.createElement('a');
              link.style.display = 'none';
              link.href = url;
              link.setAttribute('download', fileName);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          }
        })
        .catch(err => {
          reject(err);
          const errData =
            err.response && err.response.data ? err.response.data : err;
          const { code, message } = errData;
          if (code === '403') {
            Store.dispatch('asyncOverdue', true);
          } else {
            isErrorMessage &&
              message &&
              Message({
                message,
                type: 'error'
              });
          }
        })
        .finally(() => {
          Store.dispatch('asyncFullScreenLoading', false);
          if (isCancel && toMethod === 'get') {
            removeCancel(url + 'get');
          }
        });
    });
  };
  constructor(baseUrl, callback, isCancel) {
    // 请求接口前缀
    this.baseUrl = baseUrl;
    // 请求回调，断点续传类操作
    this.callback = callback;
    // 相同请求取消之前未完成的请求，搜索类操作
    this.isCancel = isCancel;
  }
  get(url, data, isSuccessMessage, isErrorMessage) {
    if (this.isCancel) {
      removeCancel(url + 'get', true);
    }
    return CommonInterface.fetch(
      url,
      'get',
      data,
      this.baseUrl,
      isSuccessMessage,
      isErrorMessage,
      this.callback,
      this.isCancel
    );
  }
  post(url, data, isSuccessMessage, isErrorMessage) {
    return CommonInterface.fetch(
      url,
      'post',
      data,
      this.baseUrl,
      isSuccessMessage,
      isErrorMessage,
      this.callback
    );
  }
  formPost(url, data, isSuccessMessage, isErrorMessage) {
    let postData = new FormData();
    if (Object.prototype.toString.call(data) === '[object Object]') {
      for (const key in data) {
        const val = data[key];
        if (val || val === 0 || val === false) {
          postData.append(key, val);
        }
      }
    } else {
      postData = data;
    }
    return CommonInterface.fetch(
      url,
      'formPost',
      postData,
      this.baseUrl,
      isSuccessMessage,
      isErrorMessage,
      this.callback
    );
  }
  put(url, data, isSuccessMessage, isErrorMessage) {
    return CommonInterface.fetch(
      url,
      'put',
      data,
      this.baseUrl,
      isSuccessMessage,
      isErrorMessage,
      this.callback
    );
  }
  patch(url, data, isSuccessMessage, isErrorMessage) {
    return CommonInterface.fetch(
      url,
      'patch',
      data,
      this.baseUrl,
      isSuccessMessage,
      isErrorMessage,
      this.callback
    );
  }
  delete(url, data, isSuccessMessage, isErrorMessage) {
    return CommonInterface.fetch(
      url,
      'delete',
      data,
      this.baseUrl,
      isSuccessMessage,
      isErrorMessage,
      this.callback
    );
  }
  download(url, data, isSuccessMessage, isErrorMessage) {
    return CommonInterface.fetch(
      url,
      'download',
      data,
      this.baseUrl,
      isSuccessMessage,
      isErrorMessage,
      this.callback
    );
  }
  all(list, callback) {
    const axiosList = list.map(item => {
      const { url, method } = item;
      return Axios[method](url);
    });
    Axios.all(axiosList).then(
      Axios.spread(function() {
        callback(Array.from(arguments));
      })
    );
  }
  cancelToken() {
    // source.cancel();
  }
}

// Axios.interceptors.response.use(
//     response => {
//         return response
//     },
//     error => {
//         if (error.response.status === 401) {
//             removeToken()
//             router.replace({
//                 path: '/login'
//             })
//         }
//         return Promise.reject(error)
//     }
// )
