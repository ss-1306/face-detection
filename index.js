const uploadImage = document.getElementById('uploadImage');
var img
var canvas
Promise.all([
    // algoritm for recognisation 
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    // library to detect the faces in image
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    // detection Algorithm
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
]).then(startFaceDetection);

async function startFaceDetection() {
    const rectangularContainer = document.createElement('div');
    const facesDetected = document.createElement('div');
    rectangularContainer.style.position = 'relative';
    const labeledFaceDescriptors = await loadPreDefinedImages();
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.5);
    uploadImage.addEventListener('change', async () => {
        if (img) img.remove()
        if (canvas) canvas.remove()
        img = await faceapi.bufferToImage(uploadImage.files[0]);
        document.body.append(facesDetected);
        facesDetected.append('Faces Detected: ');
        document.body.append(rectangularContainer);
        rectangularContainer.append(img);
        canvas = faceapi.createCanvasFromMedia(img);
        rectangularContainer.append(canvas);
        const displaySize = {
            width: img.width,
            height: img.height
        };
        faceapi.matchDimensions(canvas, displaySize);
        const detect = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
        facesDetected.append(detect.length);
        const resizeDetections = faceapi.resizeResults(detect, displaySize);
        const bestResults = resizeDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
        bestResults.forEach((br, i) => {
            const box = resizeDetections[i].detection.box
            const drawBox = new faceapi.draw.DrawBox(box, { label: br.toString() })
            drawBox.draw(canvas)
        });
    });
}

function loadPreDefinedImages() {
    const labels = ['Modi', 'Yogi', 'Amit Shah'];
    return Promise.all(
        labels.map(async label => {
            const descriptions = []
            for (let i = 1; i <= 2; i++) {
                const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/ss-1306/face-detection/main/labeled_images/${label}/${i}.jpg`)
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                descriptions.push(detections.descriptor)
            }

            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}

function removeImage () {
    if (img) img.remove()
    if (canvas) canvas.remove()
}