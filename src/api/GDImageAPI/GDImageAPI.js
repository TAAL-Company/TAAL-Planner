export const uploadImage = async (e) => {
    const GOOGLE_DRIVE_IMG_URL = "http://drive.google.com/uc?export=view&id=";
    let GOOGLE_DRIVE_IMG_ID = "";
    let imageUrl = ""

    var file = e.target.files[0] 

    return await getBase64(file).then(
        async (dataSend) => {
            const response = await fetch('https://script.google.com/macros/s/AKfycbwepXPfgrR2zfYLXk0GTWW07l7p4jikD24xX3Wzj2nW6BA2w_NXi4DGqJghc6Uh-grv/exec', { method: "POST", body: JSON.stringify(dataSend) })
            const data = await response.json();
            GOOGLE_DRIVE_IMG_ID = data.id;
            imageUrl = GOOGLE_DRIVE_IMG_URL + GOOGLE_DRIVE_IMG_ID;
            return imageUrl
        }
    );

};

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            var rawLog = reader.result.split(',')[1]; //extract only thee file data part
            var dataSend = { dataReq: { data: rawLog, name: file.name, type: file.type }, fname: "uploadFilesToGoogleDrive" };
            resolve(dataSend);
        }
        reader.onerror = error => reject(error);
    });
}
