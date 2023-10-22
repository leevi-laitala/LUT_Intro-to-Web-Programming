// Used the lecture material as a template for this code
//
// How to apply physics to shapes
// https://www.youtube.com/watch?v=gmsIkGWvvfs
//
// Some information about particles
// https://www.youtube.com/watch?v=JSrafZXuehQ
//
// Official documentation
// https://photonstorm.github.io/phaser3-docs

let game = null;

window.onload = function() {
    const config = {
        type: Phaser.AUTO,
        backgroundColor: colors.background,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: constants.grid * constants.width,
            height: constants.grid * constants.height
        },
        physics: {
            default: "arcade",
            arcade: {
                gravity: {
                    y: constants.gravity
                }
            }
        },
        pixelArt: true,
        scene: gameScene
    }

    game = new Phaser.Game(config)
    window.focus()
}

