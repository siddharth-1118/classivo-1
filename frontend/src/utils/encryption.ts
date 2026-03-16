
export async function encrypt(text: string, keyString: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const keyData = encoder.encode(keyString);

    // 1. Derive key: SHA256 hash of the key string
    const keyHash = await crypto.subtle.digest("SHA-256", keyData);

    // Import the key for AES-GCM
    const key = await crypto.subtle.importKey(
        "raw",
        keyHash,
        { name: "AES-GCM" },
        false,
        ["encrypt"]
    );

    // 2. Generate 12-byte random Nonce
    const nonce = crypto.getRandomValues(new Uint8Array(12));

    // 3. Encrypt using AES-GCM
    // The result includes the tag at the end
    const encryptedBuffer = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: nonce,
        },
        key,
        data
    );

    // 4. Concatenate Nonce + Ciphertext (which includes Tag)
    const encryptedArray = new Uint8Array(encryptedBuffer);
    const combined = new Uint8Array(nonce.length + encryptedArray.length);
    combined.set(nonce);
    combined.set(encryptedArray, nonce.length);

    // 5. Return Base64 encoded string
    return arrayBufferToBase64(combined);
}

function arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = "";
    const len = buffer.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(buffer[i]);
    }
    return window.btoa(binary);
}
