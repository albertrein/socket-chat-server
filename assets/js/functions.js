encrypt = (entradaEncrypt, chave) => {
  return CryptoJS.AES.encrypt(entradaEncrypt, chave).toString()
}

decrypt = (entradaDecrypt, chave) => {
  return CryptoJS.AES.decrypt(entradaDecrypt, chave).toString(CryptoJS.enc.Utf8)
}

var stringToHTML = function (str) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(str, 'text/html');
  return doc.body;
};

function changeColor(hex) {
  localStorage.setItem('currentColor', hex);
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  var r = parseInt(result[1], 16);
  var g = parseInt(result[2], 16);
  var b = parseInt(result[3], 16);
  var cssString = '';
  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;
  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  hn = Math.round(h * 360);
  sn = Math.round(s * 100);
  ln = Math.round(l * 100);

  document.documentElement.style.setProperty('--color-text', ln > 60 ? 'black' : 'white')



  cssString = 'hsl(' + hn + ',' + sn + '%,' + ln + '%)';

  hd = Math.round(h * 360);
  sd = Math.round(s * 100);
  ld = Math.round(l * 100) + 10;

  lightCssString = 'hsl(' + hd + ',' + sd + '%,' + ld + '%)';

  hl = Math.round(h * 360);
  sl = Math.round(s * 100);
  ll = Math.round(l * 100) - 10;

  darkCssString = 'hsl(' + hl + ',' + sl + '%,' + ll + '%)';

  document.documentElement.style.setProperty('--color-primary', cssString);
  document.documentElement.style.setProperty('--color-dark-primary', darkCssString);
  document.documentElement.style.setProperty('--color-light-primary', lightCssString);

  return 'Color has changed.';
}