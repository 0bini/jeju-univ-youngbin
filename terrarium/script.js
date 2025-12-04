
let topZIndex = 2;


document.addEventListener('DOMContentLoaded', (event) => {
    
    const plants = document.querySelectorAll('.plant');

    plants.forEach(plant => {
        
        plant.draggable = true;

        plant.addEventListener('dragstart', dragStart);

        plant.addEventListener('dblclick', bringToFront);
    });
});

document.addEventListener('dragover', (e) => {
    e.preventDefault(); //
});

document.addEventListener('drop', drop);

function dragStart(e) {
    
    e.dataTransfer.setData('text/plain', e.target.id);

    const rect = e.target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    e.dataTransfer.setData('text/offset-x', offsetX);
    e.dataTransfer.setData('text/offset-y', offsetY);
}

function drop(e) {
    e.preventDefault(); 

    const plantId = e.dataTransfer.getData('text/plain');
    if (!plantId) return; 

    const offsetX = e.dataTransfer.getData('text/offset-x');
    const offsetY = e.dataTransfer.getData('text/offset-y');

    const plant = document.getElementById(plantId);

    const currentHeight = plant.offsetHeight;
    const currentWidth = plant.offsetWidth;

    document.body.appendChild(plant);

    plant.style.left = (e.clientX - offsetX) + 'px';
    plant.style.top = (e.clientY - offsetY) + 'px';

    plant.style.height = currentHeight + 'px';
    plant.style.width = currentWidth + 'px';

    plant.style.maxHeight = 'none';
    plant.style.maxWidth = 'none';
}

function bringToFront() {
    topZIndex++; 
    this.style.zIndex = topZIndex;
}