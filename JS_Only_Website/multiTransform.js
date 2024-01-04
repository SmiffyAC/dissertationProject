function applyGaussianBlur(imageData) {
    // Gaussian kernel 5x5
    const kernel = [
        [1, 4, 7, 4, 1],
        [4, 16, 25, 16, 4],
        [7, 26, 41, 26, 7],
        [4, 16, 25, 16, 4],
        [1, 4, 7, 4, 1]
    ];
    const kernelSize = kernel.length;
    const half = Math.floor(kernelSize / 2);
    const width = imageData.width;
    const height = imageData.height;
    const blurredData = new Uint8ClampedArray(imageData.data);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let totalRed = 0, totalGreen = 0, totalBlue = 0, totalWeight = 0;

            for (let ky = -half; ky <= half; ky++) {
                for (let kx = -half; kx <= half; kx++) {
                    const pixelY = Math.min(height - 1, Math.max(0, y + ky));
                    const pixelX = Math.min(width - 1, Math.max(0, x + kx));
                    const weight = kernel[ky + half][kx + half];

                    const pixelIndex = (pixelY * width + pixelX) * 4;
                    totalRed += blurredData[pixelIndex] * weight;
                    totalGreen += blurredData[pixelIndex + 1] * weight;
                    totalBlue += blurredData[pixelIndex + 2] * weight;
                    totalWeight += weight;
                }
            }

            const index = (y * width + x) * 4;
            imageData.data[index] = totalRed / totalWeight;
            imageData.data[index + 1] = totalGreen / totalWeight;
            imageData.data[index + 2] = totalBlue / totalWeight;
        }
    }

    return imageData;
}

function applySobelFilter(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const sobelData = new Uint8ClampedArray(imageData.data);
    const grayscaleData = new Uint8ClampedArray(width * height);

    // Convert to grayscale
    for (let i = 0; i < sobelData.length; i += 4) {
        const avg = (sobelData[i] + sobelData[i + 1] + sobelData[i + 2]) / 3;
        grayscaleData[i / 4] = avg;
    }

    const sobelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];
    const sobelY = [
        [-1, -2, -1],
        [ 0,  0,  0],
        [ 1,  2,  1]
    ];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let pixelX = 0, pixelY = 0;

            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const pixel = grayscaleData[(y + ky) * width + (x + kx)];
                    if (pixel !== undefined) {
                        pixelX += pixel * sobelX[ky + 1][kx + 1];
                        pixelY += pixel * sobelY[ky + 1][kx + 1];
                    }
                }
            }

            const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
            const index = (y * width + x) * 4;
            sobelData[index] = magnitude;
            sobelData[index + 1] = magnitude;
            sobelData[index + 2] = magnitude;
            sobelData[index + 3] = 255; // Alpha
        }
    }

    imageData.data.set(sobelData);
    return imageData;
}


function applySepiaTone(imageData) {
    // Apply sepia tone here
    for (let i = 0; i < imageData.data.length; i += 4) {
        const red = imageData.data[i];
        const green = imageData.data[i + 1];
        const blue = imageData.data[i + 2];

        imageData.data[i] = red * 0.393 + green * 0.769 + blue * 0.189; // Red
        imageData.data[i + 1] = red * 0.349 + green * 0.686 + blue * 0.168; // Green
        imageData.data[i + 2] = red * 0.272 + green * 0.534 + blue * 0.131; // Blue
    }
    return imageData;
}

function applyImageProcessing() {
    const canvas = document.getElementById('imageCanvas');
    const context = canvas.getContext('2d');
    const image = document.getElementById('sourceImage');

    canvas.width = image.width;
    canvas.height = image.height;

    context.drawImage(image, 0, 0, image.width, image.height);
    let imageData = context.getImageData(0, 0, image.width, image.height);

    // Start timing
    const startTime = performance.now();

    // Apply filters in sequence
    imageData = applyGaussianBlur(imageData);
    imageData = applySobelFilter(imageData);
    imageData = applySepiaTone(imageData);

    // Draw the processed image back onto the canvas
    context.putImageData(imageData, 0, 0);

    // End timing
    const endTime = performance.now();
    const timeTaken = endTime - startTime;
    document.getElementById('performanceData').innerText = `Time taken: ${timeTaken.toFixed(2)} milliseconds`;
}

window.onload = function() {
    const image = document.getElementById('sourceImage');
    if (image.complete) {
        applyImageProcessing();
    } else {
        image.onload = applyImageProcessing;
    }
};
