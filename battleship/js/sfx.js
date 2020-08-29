
let app; // First create and application object

// We need a renderer, root container and time tracking to render the scene
// function initPixi() { // commented this when adding the changeImage button

app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight
});

// Now we add the scene to the html as a canvas
document.getElementById('sfx').appendChild(app.view);

// Now we create a sprite from jpg image to add it to the scene
let image = new PIXI.Sprite.from(`./images/battleship_bg01.jpg`);

image.width = window.innerWidth; // Setting width
image.height = window.innerHeight; // Setting height

app.stage.addChild(image); // We add the image to the scene

// To create the ripple we will use Displacement mapping 
displacementSprite = new PIXI.Sprite.from('./images/cloud.jpg');
displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite); // Creating the filter from the sprite 
// We need to set the wrap mode to repeat to make sure that the displacement 
// covers the entire image
displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
// Now we add it to the stage and apply the filter
app.stage.addChild(displacementSprite);
app.stage.filters = [displacementFilter];

// applying transform scale to the renderer for the borders
//app.renderer.view.style.transform = 'scale(1.02)';

// Reducing density of ripple
displacementSprite.scale.x = 5;
displacementSprite.scale.y = 5;

// animate(); // Animation loop

// Creating the animation and moving the displacement map position
function animate() {
    displacementSprite.x += 5;
    displacementSprite.y += 2;
    requestAnimationFrame(animate); // Loop
}
