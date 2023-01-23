encrypt = (entradaEncrypt, chave) => {
    return CryptoJS.AES.encrypt(entradaEncrypt, chave).toString()
  }
  
  decrypt = (entradaDecrypt, chave) => {
    return CryptoJS.AES.decrypt(entradaDecrypt, chave).toString(CryptoJS.enc.Utf8)
  }