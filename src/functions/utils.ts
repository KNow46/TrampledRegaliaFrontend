const bgImageWidth = 2179

export const calculateScale = (imageWidth = bgImageWidth): number => {
    return window.innerWidth > window.innerHeight ?
        window.innerWidth / imageWidth :
        window.innerHeight / imageWidth
}

export const calculateOffSetFromCenter = (coordinate: number): number => {
    const scale = calculateScale()
    return coordinate * scale;
}

export const wasMouseUpPartOfDrag = (downEvent: MouseEvent, upEvent: MouseEvent, threshold = 5): boolean => {
    const dx = upEvent.clientX - downEvent.clientX;
    const dy = upEvent.clientY - downEvent.clientY;
    console.log(upEvent.clientX, downEvent.clientX);
    return Math.sqrt(dx * dx + dy * dy) > threshold;
};