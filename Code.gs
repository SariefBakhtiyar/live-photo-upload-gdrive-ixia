const FOLDER_ID = 'ISI_FOLDER_DRIVE_ANDA';
const TOKEN = 'IXIA_SECURE_2026';

function doPost(e){
  try{
    const data = JSON.parse(e.postData.contents);

    // 🔐 VALIDASI TOKEN
    if(data.token !== TOKEN){
      throw new Error('Unauthorized');
    }

    const base64 = data.foto;

    // 🔐 VALIDASI FORMAT
    if(!base64 || !base64.startsWith('data:image')){
      throw new Error('File bukan gambar valid');
    }

    const cleaned = base64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
    const bytes = Utilities.base64Decode(cleaned);

    // 🔐 BATASI UKURAN (2MB)
    if(bytes.length > 2 * 1024 * 1024){
      throw new Error('Ukuran maksimal 2MB');
    }

    const blob = Utilities.newBlob(bytes, 'image/jpeg');

    const file = DriveApp
      .getFolderById(FOLDER_ID)
      .createFile(blob);

    file.setSharing(
      DriveApp.Access.ANYONE_WITH_LINK,
      DriveApp.Permission.VIEW
    );

    const url = `https://drive.google.com/thumbnail?id=${file.getId()}&sz=w800`;

    return ContentService
      .createTextOutput(JSON.stringify({
        success:true,
        url:url
      }))
      .setMimeType(ContentService.MimeType.JSON);

  }catch(err){
    return ContentService
      .createTextOutput(JSON.stringify({
        success:false,
        message:err.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
