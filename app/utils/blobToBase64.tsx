
//callback - where we want to get result
const blobToBase64 = (blob: Blob, callback: any) => {
  const reader = new FileReader();
  reader.onload = function () {
    const base64data = reader?.result?.toString()?.split(",")[1];
    callback(base64data);
  };
  reader.readAsDataURL(blob);
};

export { blobToBase64 };