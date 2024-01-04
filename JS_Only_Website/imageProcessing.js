window.onload = function() {
    const canvas = document.getElementById('imageCanvas');
    const context = canvas.getContext('2d');
    const image = document.getElementById('sourceImage');

    image.onload = function() {
        // Draw the image onto the canvas
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        // Get the image data
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply grayscale filter
        for (let i = 0; i < data.length; i += 4) {
            const brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
            data[i] = brightness;     // Red
            data[i + 1] = brightness; // Green
            data[i + 2] = brightness; // Blue
        }

        // Overwrite original image
        context.putImageData(imageData, 0, 0);
    };
};
