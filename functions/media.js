"use strict";
function validImage(bytes, type) {
  if(type === "image/png") return bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if(type === "image/jpeg") return bytes[0]===255 && bytes[1]===216 && bytes[2]===255;
  if(type === "image/webp") return bytes.toString("ascii",0,4)==="RIFF" && bytes.toString("ascii",8,12)==="WEBP";
  return false;
}
async function validateMedia(bucket, uid, scope, op, path) {
  const kind = op === "setPhoto" ? "profilePhotos" : "identityDocuments";
  if(typeof path!=="string" || !path.startsWith(`${kind}/${scope}/${uid}/`) || !/^[a-zA-Z0-9._-]+$/.test(path.split('/')[3]||'') || path.split('/').length!==4) throw Error("Caminho de imagem inválido ou de outro usuário.");
  const file = bucket.file(path);
  const [meta] = await file.getMetadata();
  if(Number(meta.size)<=0 || Number(meta.size)>=5*1024*1024) throw Error("Escolha uma imagem menor que 5 MB.");
  const [bytes] = await file.download();
  if(!validImage(bytes,meta.contentType)) throw Error("Arquivo inválido. Use uma imagem JPEG, PNG ou WebP.");
  return {path,kind};
}
module.exports={validateMedia,validImage};
