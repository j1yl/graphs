import { P5CanvasInstance, ReactP5Wrapper, Sketch } from "@p5-wrapper/react";

const sketch: Sketch = (p5: P5CanvasInstance) => {
  p5.setup = () => {
    p5.createCanvas(1920, 1080);
    p5.background(0);
    p5.fill(0);
    p5.rect(0, 0, p5.width, p5.height);
    p5.pixelDensity(1);
  };

  p5.draw = () => {
    p5.push();
    p5.translate(p5.width / 2, p5.height / 2);

    let wings = 4;

    p5.blendMode(p5.MULTIPLY);
    p5.fill(0, 3);
    p5.rect(-p5.width / 2, -p5.height / 2, p5.width, p5.height);
    p5.push();
    p5.blendMode(p5.SCREEN);

    for (let i = 0; i < wings; i++) {
      let radius = p5.height / 2 + p5.sin(i * 5 + p5.frameCount / 50) * 500;
      p5.push();

      let dist = 2;
      for (let j = 0; j < radius; j += dist) {
        let rotation =
          (i / wings) * 2 * p5.PI +
          p5.frameCount / 200 +
          p5.sin(p5.frameCount / 5000) +
          p5.sin(i / (60 + i / 5 + j / 5) + i + p5.frameCount / 50) / 1.5;

        p5.push();
        p5.rotate(rotation);
        p5.translate(0, p5.random(10));
        p5.fill(
          200 - j / 2 + p5.sin(j / 45 + 0.2 + i + p5.frameCount) * 30,
          200 - j / 1.8 + p5.sin(j / 70 + 0.2 + i + p5.frameCount / 40) * 60,
          180 - j / 1.6 + p5.sin(j / 60 + 0.5 + i - p5.frameCount / 30) * 60,
          10,
        );
        p5.noStroke();
        p5.rect(
          j,
          j,
          2,
          j +
            p5.sin(
              j / (10 + i / 20) +
                p5.noise(j / (10 + i / 20)) * 10 +
                p5.frameCount / 50,
            ),
        );

        p5.translate(j, i);
        // p5.ellipse(p5.random(-20, 20), p5.random(-20, 20), 5, 5);
        p5.pop();
      }
      p5.pop();
    }
  };
};

function Sketch() {
  return <ReactP5Wrapper sketch={sketch} />;
}

export default Sketch;
