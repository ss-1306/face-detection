const uploadImage = document.getElementById('uploadImage');
const removeImage = document.getElementById('removeImage');

Promise.all([
    // algoritm for recognisation 
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    // library to detect the faces in image
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    // detection Algorithm
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
]).then(startFaceDetection);

function startFaceDetection() {
    const rectangularContainer = document.createElement('div');
    const facesDetected = document.createElement('div');
    rectangularContainer.style.position = 'relative';
    uploadImage.addEventListener('change', async () => {
        const img = await faceapi.bufferToImage(uploadImage.files[0]);
        document.body.append(facesDetected);
        facesDetected.append('Faces Detected: ');
        document.body.append(rectangularContainer);
        rectangularContainer.append(img);
        const canvas = faceapi.createCanvasFromMedia(img);
        rectangularContainer.append(canvas);
        const displaySize = {width:img.width, height: img.height};
        faceapi.matchDimensions(canvas, displaySize);
        const detect = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
        facesDetected.append(detect.length);
        const resizeDetections = faceapi.resizeResults(detect, displaySize);
        resizeDetections.forEach( detect => {
            const box = detect.detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, {label: 'Face'});
            drawBox.draw(canvas);
        })
    })
}

function loadPreDefinedImages() {
    const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Modi' ,'Thor', 'Tony Stark', 'Yogi'];
}