let isPremiumUnlocked = false; // Track premium status

document.getElementById('imageInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const maxWidth = 200; // Adjust for resolution
                const scale = maxWidth / img.width;
                canvas.width = maxWidth;
                canvas.height = img.height * scale;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const asciiArt = convertToAscii(imageData, isPremiumUnlocked);
                document.getElementById('asciiArt').innerHTML = asciiArt;
                document.getElementById('downloadTxtBtn').disabled = false;
                document.getElementById('downloadPngBtn').disabled = false;
                document.getElementById('goBackBtn').style.display = 'inline-block';
                document.querySelector('.social-sharing').style.display = 'block'; // Show sharing buttons
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('downloadTxtBtn').addEventListener('click', function() {
    const asciiArt = document.getElementById('asciiArt').textContent;
    const blob = new Blob([asciiArt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii_art.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

document.getElementById('downloadPngBtn').addEventListener('click', function() {
    const asciiArtElement = document.getElementById('asciiArt');
    html2canvas(asciiArtElement).then(canvas => {
        // Add watermark
        const ctx = canvas.getContext('2d');
        ctx.font = '20px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText('Created with ASCII Art Converter', 10, canvas.height - 10);

        // Download the image
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'ascii_art.png';
        link.click();
    });
});

document.getElementById('goBackBtn').addEventListener('click', function() {
    location.reload(); // Reload the page to go back to the home screen
});

document.getElementById('shareTwitterBtn').addEventListener('click', function() {
    const asciiArt = document.getElementById('asciiArt').textContent;
    const text = encodeURIComponent("Check out my ASCII art!\n" + asciiArt);
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank');
});

document.getElementById('shareFacebookBtn').addEventListener('click', function() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
});

document.getElementById('shareInstagramBtn').addEventListener('click', function() {
    const asciiArtElement = document.getElementById('asciiArt');
    html2canvas(asciiArtElement).then(canvas => {
        // Add watermark
        const ctx = canvas.getContext('2d');
        ctx.font = '20px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText('Created with ASCII Art Converter', 10, canvas.height - 10);

        // Open Instagram with the image
        const imageUrl = canvas.toDataURL('image/png');
        const tempLink = document.createElement('a');
        tempLink.href = imageUrl;
        tempLink.download = 'ascii_art.png';
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);

        alert("Download the image and share it on Instagram manually.");
    });
});

document.getElementById('unlockPremiumBtn').addEventListener('click', function() {
    const stripe = Stripe('pk_test_51Qs8biP7t9IkNV028SJUDsnwwxKSfkfFsV6g76nLhnC5BECv1Ib1C50cPh5VUqvnwBlRRsQC4TjvMAh7bEyg3U3a00HWGghfA8'); // Replace with your Stripe public key
    stripe.redirectToCheckout({
        lineItems: [{ price: 'sk_test_51Qs8biP7t9IkNV02pqPs4nhZZL2SfmzttpQaTyg1LJvqqZM8xgtrVBYXjdrjYZTr8Wkpu0lHGli5lsOc2QZUFlMq00YEplbK4o', quantity: 1 }], // Replace with your Stripe price ID
        mode: 'payment',
        successUrl: 'https://imagefun.netlify.app', // Replace with your success URL
        cancelUrl: 'https://imagefun.netlify.app', // Replace with your cancel URL
    }).then(function(result) {
        if (result.error) {
            alert(result.error.message);
        }
    });
});

function convertToAscii(imageData, usePremiumFilter) {
    const asciiChars = ['@', '#', 'S', '%', '?', '*', '+', ';', ':', ',', '.', ' '];
    let asciiArt = '';

    for (let y = 0; y < imageData.height; y += 2) {
        for (let x = 0; x < imageData.width; x++) {
            const offset = (y * imageData.width + x) * 4;
            const r = imageData.data[offset];
            const g = imageData.data[offset + 1];
            const b = imageData.data[offset + 2];
            const brightness = (r + g + b) / 3;
            const charIndex = Math.floor((brightness / 255) * (asciiChars.length - 1));
            const color = `rgb(${r},${g},${b})`;
            let char = asciiChars[charIndex];

            // Apply premium filter if unlocked
            if (usePremiumFilter) {
                char = applyPremiumFilter(char, brightness);
            }

            asciiArt += `<span style="color: ${color};">${char}</span>`;
        }
        asciiArt += '\n';
    }

    return asciiArt;
}

function applyPremiumFilter(char, brightness) {
    // Example premium filter: Replace characters with more detailed ones
    const premiumChars = ['▓', '▒', '░', '▄', '▀', '■', '☀', '☾', '✿', '✦'];
    const index = Math.floor((brightness / 255) * (premiumChars.length - 1));
    return premiumChars[index];
}