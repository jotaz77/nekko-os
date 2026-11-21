const video = document.querySelector("#demo-video");
const placeholder = document.querySelector("#video-placeholder");

video.addEventListener("loadedmetadata", () => {
    video.hidden = false;
    placeholder.hidden = true;
}, { once: true });
video.src = "/assets/img/nekko-os-demo.mp4";

const photo = document.querySelector("#gallery-photo");
const caption = document.querySelector("#gallery-caption");
const counter = document.querySelector("#gallery-count");
const photos = [{ src: photo.getAttribute("src"), caption: caption.textContent, alt: photo.alt }];
let currentPhoto = 0;

function showPhoto(step) {
    currentPhoto = (currentPhoto + step + photos.length) % photos.length;
    const next = photos[currentPhoto];
    photo.src = next.src;
    photo.alt = next.alt;
    caption.textContent = next.caption;
    counter.textContent = `${currentPhoto + 1} / ${photos.length}`;
}

const additionalPhotos = [
    { src: "/assets/img/nekko-os-ordens.webp", caption: "Ordens de serviço", alt: "Tela de ordens de serviço do NEKKO OS" },
    { src: "/assets/img/nekko-os-estoque.webp", caption: "Estoque", alt: "Tela de estoque do NEKKO OS" },
    { src: "/assets/img/nekko-os-vendas.webp", caption: "Vendas", alt: "Tela de vendas do NEKKO OS" },
];

Promise.all(additionalPhotos.map(item => new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(item);
    image.onerror = () => resolve(null);
    image.src = item.src;
}))).then(results => {
    photos.push(...results.filter(Boolean));
    if (photos.length <= 1) return;
    document.querySelector("#gallery-prev").addEventListener("click", () => showPhoto(-1));
    document.querySelector("#gallery-next").addEventListener("click", () => showPhoto(1));
    showPhoto(0);
    document.querySelector("#gallery-controls").hidden = false;
});
