import { MouseEventHandler, useEffect } from "react";
import Names from "./components/names.js";
import Results from "./components/results.js";

type LineProps = {
  x: number;
  y: number;
  type: "vertical" | "horizontal";
  isPass: boolean;
};

type AmidaPosition = {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null;

const AMIDA_COUNT = Math.max(Names.length, Results.length);
const VERTICAL_LINE_COUNT = 15;
const VERTICAL_LINE_LENGTH = 45;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 720;
const LINE_DISTANCE = CANVAS_WIDTH / AMIDA_COUNT;
const OFFSET_LINE_POS = LINE_DISTANCE / 2;
let lineProps: LineProps[] = [];
const FONT_PROP = "24px san-serif";

const generateRandom = (): boolean => {
  return Math.random() < 0.2;
};

//デバッグ用関数
const generateRandomHue = (): number => {
  return Math.trunc(Math.random() * 360);
};
const generateHue = (num: number): number => {
  if (num * 30 > 360) return 0;
  return num * 30;
};

const sleep = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

// TODO: x1,x2,y1,y2は線を引くときに計算する(引数をxとyのみにする)
const generateVerticalLine = (
  ctx: CanvasRenderingContext2D | null,
  x1: number,
  y1: number,
  y2: number,
  color: string
) => {
  ctx?.beginPath();
  ctx!.strokeStyle = color;
  ctx!.lineWidth = 5;
  ctx?.moveTo(x1, y1);
  ctx?.lineTo(x1, y2);
  ctx?.stroke();
};

const generateHorizontalLine = (
  ctx: CanvasRenderingContext2D | null,
  x1: number,
  x2: number,
  y1: number,
  color: string
) => {
  ctx?.beginPath();
  ctx!.strokeStyle = color;
  ctx!.lineWidth = 5;
  ctx?.moveTo(x1, y1);
  ctx?.lineTo(x2, y1);
  ctx?.stroke();
};

// const initAdditionalHorizontalLine = () => {
//   for (let i = 1; i <= AMIDA_COUNT; i++) {
//     //横線の有無確認
//     const hasHorizontalLine = lineProps.find((item) => {
//       return item.x === i - 1 && item.type === "horizontal";
//     });
//     if (!hasHorizontalLine) {

//     }
//   }
// };

const initCanvas = () => {
  canvas = document.getElementById("canvas") as HTMLCanvasElement;
  ctx = canvas.getContext("2d");
};

const initAmida = () => {
  for (let i = 1; i <= AMIDA_COUNT; i++) {
    //線を引く
    for (let j = 1; j <= VERTICAL_LINE_COUNT - 1; j++) {
      const x1 = OFFSET_LINE_POS + (i - 1) * LINE_DISTANCE;
      const y1 = (j - 1) * VERTICAL_LINE_LENGTH;
      const x2 = OFFSET_LINE_POS + i * LINE_DISTANCE;
      const y2 = j * VERTICAL_LINE_LENGTH;
      // const color = `hsl(${Math.trunc(360 - j * 30)} 85 66)`;
      const color = `black`;
      //縦線を引く
      generateVerticalLine(ctx, x1, y1, y2, color);
      lineProps.push({
        x: i,
        y: j,
        type: "vertical",
        isPass: false,
      });

      //1つ前の横線を検索し、存在する場合は横線を引かない
      const hasPrevHorizontalLine = lineProps.find((item) => {
        // console.log(item);
        return item.x === i - 1 && item.y === j && item.type === "horizontal";
      });

      if (
        !hasPrevHorizontalLine &&
        j !== 1 &&
        i !== AMIDA_COUNT &&
        generateRandom()
      ) {
        //初回、最後ではない場合かつ前回横線を引いていない場合は、
        //乱数判定がtrueになった場合のみ横線を引く。
        //横線を引いたらフラグを立てる
        generateHorizontalLine(ctx, x1, x2, y1, color);

        console.log(i, j);
        lineProps.push({
          x: i,
          y: j,
          type: "horizontal",
          isPass: false,
        });
      }
    }
    //テキストを入れる
    ctx!.font = FONT_PROP;
    ctx?.fillText(
      Results[i - 1],
      (i - 1) * LINE_DISTANCE,
      VERTICAL_LINE_COUNT * VERTICAL_LINE_LENGTH,
      LINE_DISTANCE * 0.85
    );
  }
  // initAdditionalHorizontalLine();
};

const calcPos: (x: number, y: number) => AmidaPosition = (
  x: number,
  y: number
) => {
  const x1 = OFFSET_LINE_POS + x * LINE_DISTANCE;
  const y1 = (y - 1) * VERTICAL_LINE_LENGTH;
  const x2 = OFFSET_LINE_POS + (x + 1) * LINE_DISTANCE;
  const y2 = y * VERTICAL_LINE_LENGTH;

  const pos: AmidaPosition = {
    x1: x1,
    x2: x2,
    y1: y1,
    y2: y2,
  };
  return pos;
};

const playAmida = async (id: number) => {
  let x = id;
  // for (let i = 1; i < VERTICAL_LINE_COUNT; i++) {
  for await (const i of [...Array(VERTICAL_LINE_COUNT)].keys()) {
    console.log(`x=${x}, i=${i}`);
    const lineColor = `hsl(${(360 / AMIDA_COUNT) * id} 100 50)`;
    const currentPos = calcPos(x, i);

    //x,y+1の座標の横線を検索、存在する場合は渡る(横線を引く)
    const hasHorizontalLine = lineProps.find((item) => {
      return item.x === x + 1 && item.y === i && item.type === "horizontal";
    });

    //x-1,yの座標の横線を検索、存在する場合は渡る(横線を引く)
    const hasPrevHorizontalLine = lineProps.find((item) => {
      return item.x === x && item.y === i && item.type === "horizontal";
    });

    if (hasHorizontalLine) {
      generateHorizontalLine(
        ctx,
        currentPos.x1,
        currentPos.x2,
        currentPos.y1,
        lineColor
      );
      x = x + 1;
      console.log("cross right");
      console.log(`x=${x}, i=${i}`);
    } else if (hasPrevHorizontalLine) {
      x = x - 1;
      const newPos = calcPos(x, i);
      generateHorizontalLine(ctx, newPos.x1, newPos.x2, newPos.y1, lineColor);
      console.log("cross left");
      console.log(`x=${x}, i=${i}`);
    }

    const currentPos2 = calcPos(x, i);

    //縦線を引く
    generateVerticalLine(
      ctx,
      currentPos2.x1,
      currentPos2.y1,
      currentPos2.y2,
      lineColor
    );
    await sleep(500).then(() => console.log(i));
    // console.log(`drawVert x1=${x1} x2=${x2} x=${x}, i=${i}`);
  }
};

const playAmidas: MouseEventHandler<HTMLButtonElement> = () => {
  for (let i = 0; i < AMIDA_COUNT; i++) {
    playAmida(i);
  }
};

const redrawAmida = () => {
  canvas.width = CANVAS_WIDTH;
  lineProps = [];
  initAmida();
};

function Amida() {
  let loading: boolean = false;

  useEffect(() => {
    if (loading) return;
    initCanvas();
    redrawAmida();
    loading = true;
  }, []);
  return (
    <div>
      <button onClick={playAmidas}>start</button>
      <button onClick={redrawAmida}>reset</button>
      <canvas width={CANVAS_WIDTH} height={CANVAS_HEIGHT} id="canvas"></canvas>
    </div>
  );
}

export default Amida;
