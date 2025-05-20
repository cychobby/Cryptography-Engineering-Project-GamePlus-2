// 假设 res.json() 后得到的 creationOptions
const logEl = document.getElementById("log");
// …把你原来内联的所有 JS 代码都粘到这里…

const { public_key } = await beginRes.json();
const pk = public_key;

// 1) 转 Base64URL → Uint8Array
pk.challenge = b64urlToUint8(pk.challenge);
pk.user.id   = b64urlToUint8(pk.user.id);

// 2) 字段名转换：display_name → displayName
pk.user.displayName = pk.user.display_name;
delete pk.user.display_name;

// 3) 去掉所有不符合 WebAuthn API 类型的 null 字段
for (const key of [
  "timeout",
  "exclude_credentials",
  "hints",
  "attestation",
  "attestation_formats",
  "extensions"
]) {
  if (pk[key] === null) {
    delete pk[key];
  }
}

// 4) 注意：exclude_credentials 在 spec 里要叫 excludeCredentials
if (pk.exclude_credentials !== undefined) {
  pk.excludeCredentials = pk.exclude_credentials.map(item => ({
    type: item.type,
    id: b64urlToUint8(item.id),
  }));
  delete pk.exclude_credentials;
}

// 5) 现在再调用 WebAuthn API
const credential = await navigator.credentials.create({ publicKey: pk });
