/***防抖 ***/
export function _debounce(fn) {
  let debounceTime = null;
  return () => {
    clearTimeout(debounceTime);
    debounceTime = setTimeout(() => {
      fn();
    }, 500);
  };
}

/***定时 ***/
export function _init(fn, stopFn, time = 600, stopTime = 0) {
  fn();
  const initTimer = setInterval(() => {
    fn();
  }, 1000 * time);
  stopFn(initTimer);
  stopTime &&
    setTimeout(() => {
      clearInterval(initTimer);
      return Promise.resolve();
    }, 1000 * stopTime);
}

export function getArray(num, item) {
  return Array.from({ length: num }, () => item);
}

export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
// export function deepClone(obj, hash = new WeakMap()) {
//   if (obj instanceof RegExp) {
//     return new RegExp(obj);
//   }
//   if (obj instanceof Date) {
//     return new Date(obj);
//   }
//   if (obj === null || typeof obj !== 'object') {
//     return obj;
//   }
//   if (hash.has(obj)) {
//     return hash.get(obj);
//   }
//   // Observer
//   if (!obj.hasOwnProperty) {
//     return JSON.parse(JSON.stringify(obj));
//   }
//   const t = new obj.constructor();
//   hash.get(obj, t);
//   for (const key in obj) {
//     if (obj.hasOwnProperty(key)) {
//       t[key] = deepClone(obj[key], hash);
//     }
//   }
//   return t;
// }

export function flatArr(input) {
  const stack = [...input];
  const res = [];
  while (stack.length) {
    const next = stack.pop();
    if (Array.isArray(next)) {
      stack.push(...next);
    }
    {
      res.push(next);
    }
  }
  return res.reverse();
}

export function jsonp(url, params, callback) {
  return new Promise(resolve => {
    const script = document.createElement('script');
    window[callback] = function(data) {
      resolve(data);
      document.removeChild(script);
    };
    params = { ...params, callback };
    const arrs = [];
    for (const key in params) {
      arrs.push(`${key}=${params[key]}`);
    }
    script.src = `${url}?${arrs.join('&')}`;
    document.body.appendChild(script);
  });
}

export function filterArr(arr) {
  if (!Array.isArray(arr) || !arr.length) {
    return arr;
  }
  const strArr = arr.map(item =>
    Object.prototype.toString.call(item) === '[object Object]' ||
    Array.isArray(item)
      ? JSON.stringify(item)
      : item
  );
  return strArr
    .filter((item, idx) => strArr.indexOf(item) === idx)
    .map(item => {
      try {
        return JSON.parse(item);
      } catch (err) {
        return item;
      }
    });
}

// base64解码
export function base64Decode(input) {
  let rv = window.atob(input);
  rv = escape(rv);
  rv = decodeURIComponent(rv);
  return rv;
}

export function flatJson(input, prop, result = []) {
  for (let i = 0; i < input.length; i++) {
    result.push(input[i]);
    const child = input[i][prop];
    if (child) {
      result.push(...flatJson(child, prop));
    }
  }
  return result;
}

export function changeTime(val, noHour) {
  if (!val) {
    return '';
  }
  const myDate = new Date(val);
  const year = myDate.getFullYear();
  const month =
    myDate.getMonth() < 9
      ? '0' + (myDate.getMonth() + 1)
      : myDate.getMonth() + 1;
  const date =
    myDate.getDate() < 10 ? '0' + myDate.getDate() : myDate.getDate();
  const hour =
    myDate.getHours() < 10 ? '0' + myDate.getHours() : myDate.getHours();
  const minute =
    myDate.getMinutes() < 10 ? '0' + myDate.getMinutes() : myDate.getMinutes();
  const seconds =
    myDate.getSeconds() < 10 ? '0' + myDate.getSeconds() : myDate.getSeconds();
  // const a = new Array("日", "一", "二", "三", "四", "五", "六");
  return !noHour
    ? `${year}-${month}-${date} ${hour}:${minute}:${seconds}`
    : `${year}年${month}月${date}日`;
}

// 判断文件类型
export function instanceofFile(input) {
  const list = input.split('.');
  const name = '.' + list[list.length - 1];
  if (/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(name)) {
    return 'image';
  }
  if (/\.(mp3|wav|mkv|)$/.test(name)) {
    return 'audio';
  }
  if (/\.(mp4|m2v|mkv|)$/.test(name)) {
    return 'video';
  }
  return 'file';
}

// 格式化文件大小
export function renderSize(value) {
  if (null === value || value === '') {
    return '0 Bytes';
  }
  var unitArr = new Array(
    'Bytes',
    'KB',
    'MB',
    'GB',
    'TB',
    'PB',
    'EB',
    'ZB',
    'YB'
  );
  var index = 0,
    srcsize = parseFloat(value);
  index = Math.floor(Math.log(srcsize) / Math.log(1024));
  var size = srcsize / Math.pow(1024, index);
  //  保留的小数位数
  size = size.toFixed(2);
  return size + unitArr[index];
}

//根据身份证判断男女
export function sexCard(card) {
  if (!card) {
    return;
  }
  return parseInt(card.substr(16, 1)) % 2 === 1 ? '男' : '女';
}

// 身份证中间隐藏
export function filterCard(value) {
  if (!value) {
    return;
  }
  var str1 = value.slice(0, 6);

  var str2 = '';

  var str3 = value.slice(14);

  if (value.length === 15) {
    str2 = '******';
  } else {
    str2 = '********';
  }

  return str1 + str2 + str3;
}

// 判断dom元素是否存在另一个dom元素中
export function isParent(node, parent) {
  while (node) {
    if (node === parent) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}

export function isEmpty(str) {
  const text = str.replace(/\s+|[\r\n]/g, '');
  return text.length ? false : true;
}

// 文件下载并修改名称
function getBlob(url, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'blob';
  xhr.onload = function() {
    if (xhr.status === 200) {
      cb(xhr.response);
    }
  };
  xhr.send();
}

function saveAs(blob, filename) {
  if (window.navigator.msSaveOrOpenBlob) {
    navigator.msSaveBlob(blob, filename);
  } else {
    var link = document.createElement('a');
    var body = document.querySelector('body');

    link.href = window.URL.createObjectURL(blob);
    link.download = filename;

    link.style.display = 'none';
    body.appendChild(link);

    link.click();
    body.removeChild(link);

    window.URL.revokeObjectURL(link.href);
  }
}
export function download(url, filename) {
  getBlob(url, function(blob) {
    saveAs(blob, filename);
  });
}
// 替换emoji为特殊字体
const ranges = [
  '\ud83c[\udf00-\udfff]',
  '\ud83d[\udc00-\ude4f]',
  '\ud83d[\ude80-\udeff]'
];
const reg = new RegExp(ranges.join('|'), 'g');
const html = '<span style="font-family: NotomojiColor;">';
export function filteremoji(emojireg) {
  return emojireg
    ? emojireg
        .replace(/<\/?(?!br)|(?<!br)>/g, '<span>$&</span>')
        .replace(reg, `${html}$&</span>`)
    : '';
}

function timeRange(beginTime, endTime, nowTime) {
  var strb = beginTime.split(':');
  if (strb.length !== 2) {
    return false;
  }

  var stre = endTime.split(':');
  if (stre.length !== 2) {
    return false;
  }

  var strn = nowTime.split(':');
  if (stre.length !== 2) {
    return false;
  }
  var b = new Date();
  var e = new Date();
  var n = new Date();

  b.setHours(strb[0]);
  b.setMinutes(strb[1]);
  e.setHours(stre[0]);
  e.setMinutes(stre[1]);
  n.setHours(strn[0]);
  n.setMinutes(strn[1]);

  if (n.getTime() - b.getTime() >= 0 && n.getTime() - e.getTime() <= 0) {
    return true;
  } else {
    return false;
  }
}
export function isDuringDate() {
  var myDate = new Date();
  var nowTime = myDate.getHours() + ':' + myDate.getMinutes();
  if (
    timeRange('8:30', '11:30', nowTime) ||
    timeRange('14:00', '17:00', nowTime)
  ) {
    return true;
  } else {
    return false;
  }
}
