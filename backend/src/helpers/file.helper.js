export function getPublicUrl(filename) {
    // Esta función simplemente le agrega "/uploads/" al nombre del archivo
    // para que el frontend sepa dónde buscarlo.
    return `/uploads/${filename}`;
}